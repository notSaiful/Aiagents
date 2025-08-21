// Summarize notes using the Gemini API and return a concise, aesthetically pleasing summary with bullet points.

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
  summary: z
    .string()
    .describe(
      'A concise, aesthetically pleasing summary in Markdown format, organized into sections like "Main Ideas", "Key Concepts", and "Action Items".'
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
  prompt: `You are an expert summarizer, inspired by tools like Miro, Visily, and Napkin.ai.
  Your task is to transform raw notes into a visually structured, beautiful, and easy-to-digest summary.

  Analyze the notes and organize the content into logical sections. Use the following structure:
  - **## 🌟 Main Ideas**: Identify the core concepts or the most important takeaways.
  - **## 🔑 Key Concepts**: Break down the main ideas into smaller, key points using nested bullet points.
  - **##  actionable items**: List any tasks, to-dos, or actionable steps mentioned.
  - Use emojis to make the summary more engaging.

  Format the entire output using Markdown. Ensure the summary is not just a block of text, but a well-organized and aesthetically pleasing document.

  Notes: {{{notes}}}`,
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
