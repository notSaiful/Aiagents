
'use server';

/**
 * @fileOverview Handles all gamification logic like points, streaks, and achievements.
 */

import { z } from 'genkit';
import { ai } from '@/ai/genkit';
import { getFirestore, doc, getDoc, updateDoc, increment, serverTimestamp, Timestamp, arrayUnion } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import type { Achievement, UserStats } from '@/types';

const UpdateUserStatsInputSchema = z.object({
  userId: z.string(),
  action: z.enum([
    'generateSummary',
    'generateFlashcards',
    'createMindmap',
    'generatePodcast',
    'quizCorrectAnswer',
    'quizCompleted'
  ]),
});
export type UpdateUserStatsInput = z.infer<typeof UpdateUserStatsInputSchema>;

const UpdateUserStatsOutputSchema = z.object({
  success: z.boolean(),
  newAchievements: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
  })).optional(),
  streakMilestone: z.number().optional().describe('The streak day count if a milestone was hit (e.g., 3, 5, 7).'),
});
export type UpdateUserStatsOutput = z.infer<typeof UpdateUserStatsOutputSchema>;

export async function updateUserStats(input: UpdateUserStatsInput): Promise<UpdateUserStatsOutput> {
  return updateUserStatsFlow(input);
}

const ALL_ACHIEVEMENTS: Omit<Achievement, 'dateUnlocked'>[] = [
    { id: 'note-ninja', name: 'Note Ninja', description: 'Generate 50 summaries', icon: 'ninja.png' },
    { id: 'flashcard-master', name: 'Flashcard Master', description: 'Complete 100 flashcard sets', icon: 'flashcard.png' },
    { id: 'mindmap-guru', name: 'Mindmap Guru', description: 'Create 5 mindmaps', icon: 'guru.png' },
    { id: 'podcast-listener', name: 'Podcast Pro', description: 'Listen to 10 AI-generated podcasts', icon: 'podcast.png' },
    { id: 'game-champ', name: 'Game Champ', description: 'Complete 20 quiz games', icon: 'champ.png' },
];

const POINTS_MAP: Record<UpdateUserStatsInput['action'], number> = {
    generateSummary: 10,
    generateFlashcards: 5,
    createMindmap: 20,
    generatePodcast: 5,
    quizCorrectAnswer: 15,
    quizCompleted: 0, // No points for completion itself, only correct answers
};

const STATS_MAP: Record<string, keyof UserStats['stats']> = {
    generateSummary: 'summariesGenerated',
    generateFlashcards: 'flashcardsCompleted',
    createMindmap: 'mindmapsCreated',
    generatePodcast: 'podcastsListened',
    quizCompleted: 'gamesCompleted',
};

const updateUserStatsFlow = ai.defineFlow(
  {
    name: 'updateUserStatsFlow',
    inputSchema: UpdateUserStatsInputSchema,
    outputSchema: UpdateUserStatsOutputSchema,
  },
  async ({ userId, action }) => {
    const db = getFirestore(app);
    const userRef = doc(db, 'users', userId);

    try {
      const userDoc = await getDoc(userRef);
      if (!userDoc.exists()) {
        console.error("User not found:", userId);
        return { success: false };
      }

      const user = userDoc.data() as UserStats;
      const updates: any = {};
      let pointsToAdd = POINTS_MAP[action];
      let streakMilestone: number | undefined = undefined;

      // 1. Handle Streaks
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const lastActivityDate = user.lastActivityDate ? (user.lastActivityDate as Timestamp).toDate() : null;
      if (lastActivityDate) {
        lastActivityDate.setHours(0, 0, 0, 0);
      }
      
      let currentStreak = user.streak || 0;

      if (!lastActivityDate || lastActivityDate.getTime() < today.getTime()) {
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        if (lastActivityDate && lastActivityDate.getTime() === yesterday.getTime()) {
            // Consecutive day
            currentStreak++;
        } else {
            // Not a consecutive day, reset streak
            currentStreak = 1;
        }

        // Streak bonuses and milestone check
        if (currentStreak === 3) {
            pointsToAdd += 15;
            streakMilestone = 3;
        }
        if (currentStreak === 5) {
            pointsToAdd += 25;
            streakMilestone = 5;
        }
        if (currentStreak === 7) {
            pointsToAdd += 50;
            streakMilestone = 7;
        }

        updates.streak = currentStreak;
        updates.lastActivityDate = serverTimestamp();
      }

      // 2. Update Points
      updates.points = increment(pointsToAdd);
      
      // 3. Update activity stats
      const statToUpdate = STATS_MAP[action];
      if(statToUpdate) {
        updates[`stats.${statToUpdate}`] = increment(1);
      }
      
      await updateDoc(userRef, updates);

      // 4. Check for new achievements (after updating stats)
      const updatedUserDoc = await getDoc(userRef);
      const updatedUser = updatedUserDoc.data() as UserStats;
      const newAchievements: Omit<Achievement, 'dateUnlocked'>[] = [];
      const userAchievements = (updatedUser.achievements || []).map(a => a.id);

      if ((updatedUser.stats?.summariesGenerated || 0) >= 50 && !userAchievements.includes('note-ninja')) newAchievements.push(ALL_ACHIEVEMENTS[0]);
      if ((updatedUser.stats?.flashcardsCompleted || 0) >= 100 && !userAchievements.includes('flashcard-master')) newAchievements.push(ALL_ACHIEVEMENTS[1]);
      if ((updatedUser.stats?.mindmapsCreated || 0) >= 5 && !userAchievements.includes('mindmap-guru')) newAchievements.push(ALL_ACHIEVEMENTS[2]);
      if ((updatedUser.stats?.podcastsListened || 0) >= 10 && !userAchievements.includes('podcast-listener')) newAchievements.push(ALL_ACHIEVEMENTS[3]);
      if ((updatedUser.stats?.gamesCompleted || 0) >= 20 && !userAchievements.includes('game-champ')) newAchievements.push(ALL_ACHIEVEMENTS[4]);

      if (newAchievements.length > 0) {
        const achievementsToAdd = newAchievements.map(ach => ({
          ...ach,
          dateUnlocked: new Date().toISOString(),
        }));
        await updateDoc(userRef, {
            achievements: arrayUnion(...achievementsToAdd)
        });
        return { success: true, newAchievements: achievementsToAdd, streakMilestone };
      }

      return { success: true, streakMilestone };
    } catch (error) {
      console.error('Error updating user stats:', error);
      return { success: false };
    }
  }
);
