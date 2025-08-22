'use server';

/**
 * @fileOverview Summarizes notes using the Gemini API and returns a concise, aesthetically pleasing summary with bullet points.
 *
 * - summarizeNotes - A function that handles the summarization process.
 * - SummarizeNotesInput - The input type for the summarizeNotes function.
 * - SummarizeNotesOutput - The return type for the summarizeNotes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeNotesInputSchema = z.object({
  notes: z.string().describe('The notes to summarize.'),
});
export type SummarizeNotesInput = z.infer<typeof SummarizeNotesInputSchema>;

const SummarizeNotesOutputSchema = z.object({
  shortSummary: z
    .string()
    .describe(
      'A very concise, 3-5 bullet point summary in Markdown format.'
    ),
  longSummary: z
    .string()
    .describe(
      'A more detailed, 6-10 bullet point summary in Markdown format.'
    ),
});
export type SummarizeNotesOutput = z.infer<typeof SummarizeNotesOutputSchema>;

export async function summarizeNotes(input: SummarizeNotesInput): Promise<SummarizeNotesOutput> {
  return summarizeNotesFlow(input);
}

const summarizeNotesPrompt = ai.definePrompt({
  name: 'summarizeNotesPrompt',
  input: {schema: SummarizeNotesInputSchema},
  output: {schema: SummarizeNotesOutputSchema},
  prompt: `You are an AI study assistant that transforms raw class notes into aesthetic, structured study material. Create two summaries of the notes: one short and one long.

GOALS:
- Make notes EASY to understand at a glance.
- Use clean Markdown formatting, bullet points, and emojis.
- Use pastel-style header emojis like ✨, 📌, 📚, 🌸.
- Prioritize clarity and exam-readiness.
- DO NOT add unnecessary text. Only beautify, summarize, and structure.
- No long paragraphs. Max 2 lines per point.

Short Summary Rules:
- Generate 3-5 ultra-concise bullet points for a quick review.

Long Summary Rules:
- Generate 6-10 detailed bullet points. Still concise, but more comprehensive than the short summary.

Notes:
{{{notes}}}
  `,
});

const summarizeNotesFlow = ai.defineFlow(
  {
    name: 'summarizeNotesFlow',
    inputSchema: SummarizeNotesInputSchema,
    outputSchema: SummarizeNotesOutputSchema,
  },
  async input => {
    const {output} = await summarizeNotesPrompt(input);
    return output!;
  }
);
