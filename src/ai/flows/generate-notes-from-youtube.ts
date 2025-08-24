
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

    // 1. Transcribe the video using Gemini 1.5 Flash's multimodal capabilities
    const { text: transcript } = await ai.generate({
      prompt: `You are a highly specialized AI assistant for video transcription. Your ONLY task is to process the video content from the provided URL and produce a clean, accurate transcript.

Follow these rules STRICTLY:
1.  You MUST transcribe the audio content of the video found at the URL.
2.  Do NOT transcribe the URL itself.
3.  Remove all filler words like "um," "uh," "like," etc.
4.  If the video contains no discernible speech or is otherwise inaccessible, you MUST return the exact string "ERROR_NO_SPEECH_DETECTED". Do not output any other text.
5.  Your entire output must be ONLY the cleaned transcript or the error string. Do not add any commentary, headings, or explanations.`,
      history: [
        {
          role: 'user',
          content: [
            {
                media: {
                    url: youtubeUrl,
                    contentType: 'video/youtube',
                }
            },
          ],
        },
      ],
      model: 'googleai/gemini-1.5-flash-latest'
    });

    if (!transcript || transcript.includes('ERROR_NO_SPEECH_DETECTED') || transcript.length < 20) {
        throw new Error('Could not generate a transcript from the video. The video may be inaccessible, have no detectable speech, or the URL may be invalid.');
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
    