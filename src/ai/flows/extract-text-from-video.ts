
'use server';

/**
 * @fileOverview A Genkit flow for extracting a transcript from a video.
 *
 * - extractTextFromVideo - A function that handles the video transcription process.
 * - ExtractTextFromVideoInput - The input type for the extractTextFromVideo function.
 * - ExtractTextFromVideoOutput - The return type for the extractTextFromVideo function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractTextFromVideoInputSchema = z.object({
  videoDataUri: z
    .string()
    .describe(
      "A video file, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractTextFromVideoInput = z.infer<typeof ExtractTextFromVideoInputSchema>;

const ExtractTextFromVideoOutputSchema = z.object({
  extractedText: z.string().describe('The transcript extracted from the video.'),
});
export type ExtractTextFromVideoOutput = z.infer<typeof ExtractTextFromVideoOutputSchema>;

export async function extractTextFromVideo(input: ExtractTextFromVideoInput): Promise<ExtractTextFromVideoOutput> {
  return extractTextFromVideoFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractTextFromVideoPrompt',
  input: {schema: ExtractTextFromVideoInputSchema},
  output: {schema: ExtractTextFromVideoOutputSchema},
  prompt: `You are an expert transcription service.
Your task is to extract all spoken words from the provided video.
Analyze the video carefully and provide a clean, accurate transcript of the dialogue.
Do not include timestamps or speaker labels unless they are part of the spoken content.

Video: {{media url=videoDataUri}}
`,
});

const extractTextFromVideoFlow = ai.defineFlow(
  {
    name: 'extractTextFromVideoFlow',
    inputSchema: ExtractTextFromVideoInputSchema,
    outputSchema: ExtractTextFromVideoOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
