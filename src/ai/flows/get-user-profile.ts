
'use server';

/**
 * @fileOverview Retrieves a user's profile data for the profile page.
 * It does NOT create a profile if one doesn't exist. Creation is handled at sign-up.
 */

import { z } from 'genkit';
import { ai } from '@/ai/genkit';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import type { UserProfileData, UserStats } from '@/types';

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
      const docSnap = await getDoc(userRef);

      if (!docSnap.exists()) {
        console.warn(`User profile not found for UID: ${userId}. Profile should be created on sign-up.`);
        return { profile: null };
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
