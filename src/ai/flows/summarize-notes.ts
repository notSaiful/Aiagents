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
      'An extremely concise, 1-2 sentence summary in Markdown format that captures the main takeaway.'
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
- You are an expert copy editor. Refine the notes into an extremely concise summary (1-2 sentences only).
- Keep only the main takeaway. Use simple, everyday language.
- Ensure it has a natural, engaging flow and avoids a robotic tone.

Long Summary Rules:
- Create a comprehensive and detailed summary that includes all essential information.
- Do not miss any key concepts, definitions, or important details from the notes.
- Structure the output with clear bullet points for readability.

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
