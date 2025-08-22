
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
- Vibe: Calm, organized, efficient. ✨📌🌸
- Focus on clarity and fast comprehension. Strip away clutter and focus on what really matters.
- Short Summary: 5-7 ultra-clean and concise bullet points that capture all main takeaways. Prioritize key facts. The output must be clean HTML.
- Long Summary: A detailed, comprehensive summary with as many bullet points as needed to cover all aspects of the notes. Ensure clear hierarchy and no fluff. The output must be clean HTML.
- Keep language simple, exam-friendly, and ensure minimal cognitive load.
`;

const storyStyleInstructions = `
Instructions for Story (K-Drama) style:
- Vibe: Emotional, engaging, memorable. 💖🎭📚
- Turn boring notes into short, memorable stories. Add an emotional twist, so even complex ideas stick in your memory.
- Short Summary: A short, engaging narrative (2-3 paragraphs) that captures the main concept of the notes. Weave in a touch of K-Drama style emotion—a hint of conflict, a surprising connection, a moment of realization. Use emojis like 💖, 🎭, 📚. The output must be clean HTML.
- Long Summary: A more detailed story, like a mini-series episode. Break down the notes into scenes or chapters. Use headings (<h3>) for each "scene." Flesh out the concepts with characters, dialogue, or a clear plot. Ensure the story arc covers all key points from the notes comprehensively. The output must be clean HTML.
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
    } else if (input.style === 'Story') {
      styleInstructions = storyStyleInstructions;
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
