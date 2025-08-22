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
      'A concise, aesthetically pleasing summary with bullet points, in Markdown format.'
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
  prompt: `You are an AI assistant that is an expert at transforming boring notes into fun, engaging, and easy-to-digest summaries.
  
Your tone should be playful, encouraging, and a little bit humorous. Use emojis liberally to make the summary pop!

Please summarize the following notes. Structure your response in Markdown with clear, creative headings for each section. Here are some heading ideas to get you started (feel free to use them or come up with your own):

-   **The Gist ✨:** A brief, high-level overview.
-   **Key Takeaways 🚀:** The most important points.
-   **Deep Dive 🧐:** More detailed explanations.
-   **Things to Remember 🧠:** Critical points to memorize.
-   **Action Plan ✅:** Any tasks or next steps.

Transform the notes below into an awesome summary!

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
