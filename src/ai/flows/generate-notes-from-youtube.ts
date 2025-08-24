
'use server';

/**
 * @fileOverview A Genkit flow for transcribing a YouTube video and generating comprehensive study notes.
 *
 * - generateNotesFromYoutube - Analyzes a video, transcribes it, and generates summaries, flashcards, and a mind map.
 * - GenerateNotesFromYoutubeInput - The input type for the function.
 * - GenerateNotesFromYoutubeOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { media } from 'genkit';

// Import the functions from other flows to reuse them
import { summarizeNotes } from './summarize-notes';
import { generateFlashcards } from './generate-flashcards';
import { createMindMap } from './create-mind-map';


const GenerateNotesFromYoutubeInputSchema = z.object({
  youtubeUrl: z.string().url().describe('The URL of the YouTube video to process.'),
  style: z.string().describe('The style for the generated notes (e.g., Minimalist, Story).'),
});
export type GenerateNotesFromYoutubeInput = z.infer<typeof GenerateNotesFromYoutubeInputSchema>;

const GenerateNotesFromYoutubeOutputSchema = z.object({
  transcript: z.string().describe('The transcribed text from the video.'),
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
export type GenerateNotesFromYoutubeOutput = z.infer<typeof GenerateNotesFromYoutubeOutputSchema>;


export async function generateNotesFromYoutube(input: GenerateNotesFromYoutubeInput): Promise<GenerateNotesFromYoutubeOutput> {
  return generateNotesFromYoutubeFlow(input);
}


const generateNotesFromYoutubeFlow = ai.defineFlow(
  {
    name: 'generateNotesFromYoutubeFlow',
    inputSchema: GenerateNotesFromYoutubeInputSchema,
    outputSchema: GenerateNotesFromYoutubeOutputSchema,
  },
  async ({ youtubeUrl, style }) => {

    // 1. Transcribe the video using Gemini 1.5 Pro's multimodal capabilities
    const { text: transcript } = await ai.generate({
      prompt: `Please transcribe the following YouTube video. Provide a clean, accurate transcript.
        Remove filler words like "um" and "uh."
        Ensure the output is well-structured and easy to read.
        If the video has no discernible speech, return an empty string.`,
      history: [
        {
          role: 'user',
          content: [
            {
                media: {
                    url: youtubeUrl,
                }
            },
          ],
        },
      ],
      model: 'googleai/gemini-1.5-pro-latest'
    });

    if (!transcript) {
        throw new Error('Could not transcribe the video. It may not contain detectable speech or the URL may be invalid.');
    }

    // 2. Generate all notes in parallel from the transcript
    const notesPayload = { notes: transcript, style };
    const [summaryRes, flashcardsRes, mindMapRes] = await Promise.all([
        summarizeNotes(notesPayload),
        generateFlashcards(notesPayload),
        createMindMap(notesPayload),
    ]);

    // 3. Consolidate and return all generated content
    return {
      transcript,
      shortSummary: summaryRes.shortSummary,
      longSummary: summaryRes.longSummary,
      flashcards: flashcardsRes.flashcards,
      mindMap: mindMapRes.mindMap,
    };
  }
);
    