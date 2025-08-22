
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
      'A concise, 5-7 bullet point summary in clean HTML format that captures all the main takeaways without leaving important points out.'
    ),
  longSummary: z
    .string()
    .describe(
      'A very detailed and comprehensive summary in clean HTML format, encompassing all points from the notes.'
    ),
});
export type SummarizeNotesOutput = z.infer<typeof SummarizeNotesOutputSchema>;

export async function summarizeNotes(input: SummarizeNotesInput): Promise<SummarizeNotesOutput> {
  return summarizeNotesFlow(input);
}

const minimalistStyleInstructions = `
Instructions for Minimalist / Quick Review style:
- Focus on clarity and fast comprehension.
- Short Summary: 5-7 concise bullet points. Use minimal emojis like ✨, 📌, 🌸. Make sure not to leave any important points out. The output must be clean HTML.
- Long Summary: A detailed, comprehensive summary with as many bullet points as needed to cover all aspects of the notes. Ensure clear hierarchy and no fluff. The output must be clean HTML.
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
