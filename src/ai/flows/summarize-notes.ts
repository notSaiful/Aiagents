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
      'A very concise, 3-5 bullet point summary in clean HTML format that captures the main takeaways.'
    ),
  longSummary: z
    .string()
    .describe(
      'A more detailed, 6-10 bullet point summary in clean HTML format.'
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
  prompt: `You are an AI assistant that transforms raw notes into a structured, professional summary, as if it were a clean Google Doc.

GOALS:
- Format the output using clean HTML (p, ul, li, strong, blockquote, h3, h4).
- Structure the content with clear headings and bullet points for readability.
- Maintain a professional and objective tone.
- Use standard formatting for clarity and exam-readiness.
- DO NOT use emojis or overly casual language.

Short Summary Rules:
- **Task**: Create a brief, precise summary that captures the main takeaways from the notes.
- **Length**: It must be concise, capturing the most important points in 3-5 bullet points (li tags).
- **Style**: Use clear, direct language. Think of it as an executive summary at the top of a report.

Long Summary Rules:
- **Task**: Create a detailed and comprehensive summary of the notes.
- **Tone**: Professional, clear, and informative.
- **Content**: Break down the information into well-organized sections with clear headings (h3, h4). Use bullet points to list key details. Use <blockquote> for important definitions or key concepts.
- **Format**: Structure the content like a well-organized document.

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
