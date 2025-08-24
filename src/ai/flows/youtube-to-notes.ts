
'use server';

/**
 * @fileOverview A Genkit flow for transcribing audio from a YouTube video.
 *
 * - extractTranscriptFromYoutube - Downloads audio from a YouTube URL and transcribes it.
 * - ExtractTranscriptInput - The input type for the function.
 * - ExtractTranscriptOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import ytdl from 'ytdl-core';
import { media } from 'genkit';

const ExtractTranscriptInputSchema = z.object({
  youtubeUrl: z.string().url().describe('The URL of the YouTube video to transcribe.'),
});
export type ExtractTranscriptInput = z.infer<typeof ExtractTranscriptInputSchema>;

const ExtractTranscriptOutputSchema = z.object({
  transcript: z.string().describe('The transcribed text from the YouTube video audio.'),
});
export type ExtractTranscriptOutput = z.infer<typeof ExtractTranscriptOutputSchema>;

export async function extractTranscriptFromYoutube(input: ExtractTranscriptInput): Promise<ExtractTranscriptOutput> {
  return extractTranscriptFlow(input);
}

const extractTranscriptFlow = ai.defineFlow(
  {
    name: 'extractTranscriptFlow',
    inputSchema: ExtractTranscriptInputSchema,
    outputSchema: ExtractTranscriptOutputSchema,
  },
  async ({ youtubeUrl }) => {
    if (!ytdl.validateURL(youtubeUrl)) {
      throw new Error('Invalid YouTube URL provided.');
    }

    const audioStream = ytdl(youtubeUrl, {
      filter: 'audioonly',
      quality: 'lowestaudio',
    });
    
    // Convert stream to buffer to get content type and data
    const chunks: Buffer[] = [];
    for await (const chunk of audioStream) {
        chunks.push(chunk);
    }
    const audioBuffer = Buffer.concat(chunks);

    const { text } = await ai.generate({
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
      model: 'googleai/gemini-1.5-pro-latest' // Use a model capable of audio transcription
    });

    return {
      transcript: text,
    };
  }
);

    