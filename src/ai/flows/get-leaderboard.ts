
'use server';

/**
 * @fileOverview Retrieves and ranks users for the leaderboard.
 */

import { z } from 'genkit';
import { ai } from '@/ai/genkit';
import { getFirestore, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import type { UserStats } from '@/types';

const GetLeaderboardInputSchema = z.object({
  // In a real app, you might have filters like 'weekly', 'monthly'
  filter: z.enum(['all-time']).default('all-time'),
});
export type GetLeaderboardInput = z.infer<typeof GetLeaderboardInputSchema>;

const GetLeaderboardOutputSchema = z.object({
  leaderboard: z.array(z.object({
      rank: z.number(),
      uid: z.string(),
      displayName: z.string(),
      photoURL: z.string().optional(),
      points: z.number(),
      streak: z.number(),
      achievements: z.array(z.object({
          id: z.string(),
          name: z.string(),
          icon: z.string(),
      })),
  }))
});
export type GetLeaderboardOutput = z.infer<typeof GetLeaderboardOutputSchema>;

export async function getLeaderboard(input: GetLeaderboardInput): Promise<GetLeaderboardOutput> {
  return getLeaderboardFlow(input);
}

const getLeaderboardFlow = ai.defineFlow(
  {
    name: 'getLeaderboardFlow',
    inputSchema: GetLeaderboardInputSchema,
    outputSchema: GetLeaderboardOutputSchema,
  },
  async ({ filter }) => {
    const db = getFirestore(app);
    const usersCollection = collection(db, 'users');

    // For this example, we'll only implement 'all-time'. 
    // Weekly/monthly would require more complex querying or data duplication.
    const usersQuery = query(usersCollection, orderBy('points', 'desc'), limit(50));

    try {
      const querySnapshot = await getDocs(usersQuery);
      const leaderboard: GetLeaderboardOutput['leaderboard'] = [];
      
      let rank = 1;
      querySnapshot.forEach((doc) => {
        const user = doc.data() as UserStats;
        // Ensure achievements is an array before mapping
        const achievements = (user.achievements || []).map(a => ({ id: a.id, name: a.name, icon: a.icon }));

        leaderboard.push({
          rank,
          uid: user.uid,
          displayName: user.displayName,
          photoURL: user.photoURL,
          points: user.points || 0,
          streak: user.streak || 0,
          achievements: achievements,
        });
        rank++;
      });

      return { leaderboard };
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      throw new Error('Failed to fetch leaderboard data.');
    }
  }
);
