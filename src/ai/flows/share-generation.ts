
'use server';

/**
 * @fileOverview Saves a generated content snapshot to Firestore for sharing.
 *
 * - shareGeneration - Saves the content and returns a unique ID.
 * - ShareGenerationInput - The input type for the shareGeneration function.
 * - ShareGenerationOutput - The return type for the shareGeneration function.
 */

import {z} from 'genkit';
import {ai} from '@/ai/genkit';
import {getFirestore, doc, setDoc, serverTimestamp, collection} from 'firebase/firestore';
import {app} from '@/lib/firebase';
import type { Flashcard } from '@/types';


const ShareGenerationInputSchema = z.object({
  shortSummary: z.string(),
  longSummary: z.string(),
  flashcards: z.array(
    z.object({
      question: z.string(),
      answer: z.string(),
    })
  ),
  mindMap: z.string(),
  imageUrl: z.string(),
});
export type ShareGenerationInput = z.infer<typeof ShareGenerationInputSchema>;

const ShareGenerationOutputSchema = z.object({
  shareId: z.string(),
});
export type ShareGenerationOutput = z.infer<typeof ShareGenerationOutputSchema>;

export async function shareGeneration(input: ShareGenerationInput): Promise<ShareGenerationOutput> {
  return shareGenerationFlow(input);
}

const shareGenerationFlow = ai.defineFlow(
  {
    name: 'shareGenerationFlow',
    inputSchema: ShareGenerationInputSchema,
    outputSchema: ShareGenerationOutputSchema,
  },
  async (input) => {
    const db = getFirestore(app);
    const shareCollection = collection(db, 'shared_generations');
    const newShareRef = doc(shareCollection);
    
    await setDoc(newShareRef, {
      ...input,
      createdAt: serverTimestamp(),
    });
    
    return {
      shareId: newShareRef.id,
    };
  }
);
