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
  prompt: `You are a world-class summarization AI with a knack for making things beautiful, simple, and a little bit fun, drawing inspiration from the likes of Miro, Napkin.ai, and top-tier designers. Your goal is to transform messy notes into a masterpiece of clarity and engagement.

  Your response MUST be in Markdown.

  Here's the mission:
  1.  **Analyze the notes** to deeply understand the content.
  2.  **Structure the summary** with the following hierarchical sections. Use Markdown headings and plenty of emojis to make it scannable and delightful.
      -   "## 🎨 The Big Picture": A high-level, engaging overview. What's the main gist?
      -   "## ✨ Key Takeaways": The most important, must-know points. Use bullet points.
      -   "## 🧠 Deeper Dive": Elaborate on the key concepts with nested bullet points for detail.
      -   "## 🚀 Action Plan": List out any actionable items, next steps, or to-dos. If there are none, say something witty like "No action items! Time for a coffee. ☕️"
  3.  **Inject Personality**: Use a friendly, slightly humorous tone. Sprinkle relevant emojis throughout to add visual appeal and context.
  4.  **Formatting is Key**: Use Markdown's features (bold, italics, lists) to create a beautiful, readable layout. Ensure good spacing.

  Notes to transform:
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
