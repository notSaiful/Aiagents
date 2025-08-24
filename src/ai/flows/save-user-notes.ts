
'use server';

/**
 * @fileOverview Saves a generated content snapshot to a user's collection in Firestore.
 *
 * - saveUserNotes - Saves the content and returns the document ID.
 * - SaveUserNotesInput - The input type for the saveUserNotes function.
 * - SaveUserNotesOutput - The return type for the saveUserNotes function.
 */

import {z} from 'genkit';
import {ai} from '@/ai/genkit';
import {getFirestore, doc, setDoc, serverTimestamp, collection, updateDoc} from 'firebase/firestore';
import {app} from '@/lib/firebase';
import type { Flashcard } from '@/types';


const SaveUserNotesInputSchema = z.object({
  userId: z.string(),
  sourceText: z.string(),
  style: z.string(),
  shortSummary: z.string(),
  longSummary: z.string(),
  flashcards: z.array(
    z.object({
      question: z.string(),
      answer: z.string(),
    })
  ),
  mindMap: z.string(),
});
export type SaveUserNotesInput = z.infer<typeof SaveUserNotesInputSchema>;

const SaveUserNotesOutputSchema = z.object({
  noteId: z.string(),
});
export type SaveUserNotesOutput = z.infer<typeof SaveUserNotesOutputSchema>;

export async function saveUserNotes(input: SaveUserNotesInput): Promise<SaveUserNotesOutput> {
  return saveUserNotesFlow(input);
}

const saveUserNotesFlow = ai.defineFlow(
  {
    name: 'saveUserNotesFlow',
    inputSchema: SaveUserNotesInputSchema,
    outputSchema: SaveUserNotesOutputSchema,
  },
  async ({ userId, style, ...noteData }) => {
    const db = getFirestore(app);

    // Create a new document in the user's 'notes' subcollection
    const notesCollection = collection(db, 'users', userId, 'notes');
    const newNoteRef = doc(notesCollection);
    
    await setDoc(newNoteRef, {
      ...noteData,
      style,
      createdAt: serverTimestamp(),
    });

    // Update the user's preferred style in their main document
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
        'settings.preferredStyle': style,
    });
    
    return {
      noteId: newNoteRef.id,
    };
  }
);
