
'use server';

/**
 * @fileOverview A Genkit flow for transcribing a YouTube video and generating comprehensive study notes.
 *
 * - generateNotesFromYoutube - Downloads audio, transcribes it, and generates summaries, flashcards, and a mind map.
 * - GenerateNotesFromYoutubeInput - The input type for the function.
 * - GenerateNotesFromYoutubeOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import ytdl from 'ytdl-core';
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
    if (!ytdl.validateURL(youtubeUrl)) {
      throw new Error('Invalid YouTube URL provided.');
    }

    // 1. Download Audio
    const audioStream = ytdl(youtubeUrl, {
      filter: 'audioonly',
      quality: 'lowestaudio',
    });
    
    const chunks: Buffer[] = [];
    for await (const chunk of audioStream) {
        chunks.push(chunk);
    }
    const audioBuffer = Buffer.concat(chunks);

    // 2. Transcribe Audio
    const { text: transcript } = await ai.generate({
      prompt: 'Transcribe the following audio. Focus on accuracy and clarity, correcting any obvious errors and structuring the output for readability.',
      history: [
        {
          role: 'user',
          content: [
            media({
              url: `data:audio/mp4;base64,${audioBuffer.toString('base64')}`,
            }),
          ],
        },
      ],
      model: 'googleai/gemini-1.5-pro-latest'
    });

    if (!transcript) {
        throw new Error('Could not transcribe the audio.');
    }

    // 3. Generate all notes in parallel from the transcript
    const notesPayload = { notes: transcript, style };
    const [summaryRes, flashcardsRes, mindMapRes] = await Promise.all([
        summarizeNotes(notesPayload),
        generateFlashcards(notesPayload),
        createMindMap(notesPayload),
    ]);

    // 4. Consolidate and return all generated content
    return {
      transcript,
      shortSummary: summaryRes.shortSummary,
      longSummary: summaryRes.longSummary,
      flashcards: flashcardsRes.flashcards,
      mindMap: mindMapRes.mindMap,
    };
  }
);
    
