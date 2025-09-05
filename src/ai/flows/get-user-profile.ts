
'use server';

/**
 * @fileOverview Retrieves a user's profile data for the profile page.
 * If a profile doesn't exist for the user, it creates a default one.
 */

import { z } from 'genkit';
import { ai } from '@/ai/genkit';
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import type { UserProfileData, Achievement, UserStats } from '@/types';
import { adminAuth } from '@/lib/firebase-admin';

const GetUserProfileInputSchema = z.object({
  userId: z.string(),
});
export type GetUserProfileInput = z.infer<typeof GetUserProfileInputSchema>;

const GetUserProfileOutputSchema = z.object({
  profile: z.object({
    uid: z.string(),
    displayName: z.string(),
    username: z.string(),
    email: z.string(),
    photoURL: z.string().optional(),
    points: z.number(),
    streak: z.number(),
    achievements: z.array(z.object({
        id: z.string(),
        name: z.string(),
        description: z.string(),
        icon: z.string(),
        dateUnlocked: z.string(),
    })),
    stats: z.object({
        summariesGenerated: z.number(),
        flashcardsCompleted: z.number(),
        mindmapsCreated: z.number(),
        podcastsListened: z.number(),
        gamesCompleted: z.number(),
    })
  }).nullable(),
});
export type GetUserProfileOutput = z.infer<typeof GetUserProfileOutputSchema>;

export async function getUserProfile(input: GetUserProfileInput): Promise<GetUserProfileOutput> {
  return getUserProfileFlow(input);
}

const getUserProfileFlow = ai.defineFlow(
  {
    name: 'getUserProfileFlow',
    inputSchema: GetUserProfileInputSchema,
    outputSchema: GetUserProfileOutputSchema,
  },
  async ({ userId }) => {
    const db = getFirestore(app);
    const userRef = doc(db, 'users', userId);

    try {
      let docSnap = await getDoc(userRef);

      if (!docSnap.exists()) {
        console.warn(`User profile not found for UID: ${userId}. Creating a new one.`);
        
        // This is the secure way to get user data on the server.
        // It uses the Admin SDK, which has the necessary privileges.
        if (!adminAuth) {
            throw new Error("Admin SDK not initialized. Cannot create user profile.");
        }
        
        const userRecord = await adminAuth.getUser(userId);

        const displayName = userRecord.displayName || userRecord.email?.split('@')[0] || 'New User';
        const email = userRecord.email || '';
        const photoURL = userRecord.photoURL;
        
        const newUserProfile: Omit<UserStats, 'updatedAt'> = {
            uid: userId,
            displayName: displayName,
            username: displayName.replace(/\s+/g, '_').toLowerCase(),
            usernameLower: displayName.replace(/\s+/g, '_').toLowerCase(),
            email: email,
            photoURL: photoURL || '',
            points: 0,
            streak: 0,
            achievements: [],
            stats: {
                summariesGenerated: 0,
                flashcardsCompleted: 0,
                mindmapsCreated: 0,
                podcastsListened: 0,
                gamesCompleted: 0,
            },
            createdAt: serverTimestamp(),
        };

        await setDoc(userRef, newUserProfile);
        
        // Re-fetch the document to get the server-timestamped version
        docSnap = await getDoc(userRef);
        if (!docSnap.exists()) {
            throw new Error('Failed to create and fetch new user profile.');
        }
      }
      
      const user = docSnap.data() as UserStats;
      
      const defaultStats = {
          summariesGenerated: 0,
          flashcardsCompleted: 0,
          mindmapsCreated: 0,
          podcastsListened: 0,
          gamesCompleted: 0,
      };

      const profileData: UserProfileData = {
          uid: user.uid,
          displayName: user.displayName || 'User',
          username: user.username || '',
          email: user.email || '',
          photoURL: user.photoURL,
          points: user.points || 0,
          streak: user.streak || 0,
          achievements: (user.achievements || []).map(a => ({
              ...a,
              dateUnlocked: a.dateUnlocked || new Date().toISOString(),
          })),
          stats: {
              ...defaultStats,
              ...(user.stats || {}),
          }
      };

      return { profile: profileData };

    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw new Error('Failed to fetch user profile data.');
    }
  }
);
