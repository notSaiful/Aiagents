
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
  style: z.string().describe('The style of notes to generate.'),
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

const minimalistStyleInstructions = `
Instructions for Minimalist / Quick Review style:
- Focus on clarity and fast comprehension.
- Short Summary: 3-5 ultra-concise bullet points. Use minimal emojis like ✨, 📌, 🌸. The output must be clean HTML.
- Long Summary: 6-10 bullets, clear hierarchy, no fluff. The output must be clean HTML.
- Keep language simple, exam-friendly, and ensure minimal cognitive load.
`;

const summarizeNotesFlow = ai.defineFlow(
  {
    name: 'summarizeNotesFlow',
    inputSchema: SummarizeNotesInputSchema,
    outputSchema: SummarizeNotesOutputSchema,
  },
  async (input) => {
    let styleInstructions = '';
    if (input.style === 'Minimalist') {
      styleInstructions = minimalistStyleInstructions;
    }
    
    const summarizeNotesPrompt = ai.definePrompt({
      name: 'summarizeNotesPrompt',
      output: {schema: SummarizeNotesOutputSchema},
      prompt: `You are an AI study assistant. Transform the following notes into concise, aesthetic study material in a ${input.style} style.

${styleInstructions}

You are an expert at correcting spelling and grammar mistakes from OCR-extracted text. First, fix any errors in the notes, then generate the summaries based on the corrected text.

Format the output using clean HTML (p, ul, li, strong, blockquote, h3, h4).

Notes:
${input.notes}
  `,
    });

    const {output} = await summarizeNotesPrompt({});
    return output!;
  }
);
