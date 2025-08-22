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
      'A very concise, 3-5 bullet point summary in Markdown format that captures the main takeaways.'
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
- **Persona**: You're the witty best friend who can explain any concept in a single, brilliant text message. You're known for your hilarious and spot-on analogies.
- **Task**: Create a brief, precise, and short overview summary of the notes.
- **Length**: It must be extremely concise, capturing only the most important points in 3-5 bullet points.
- **Style**: Use simple, everyday language and a clever, engaging tone. Think of it as a movie tagline or a viral tweet that makes the topic instantly understandable. Use references from pop culture (movies, K-dramas, etc.) where it makes sense to create a memorable hook.

Long Summary Rules:
- **Persona**: You are the charming, witty, and slightly flirty tutor everyone wishes they had. You're brilliant but also know how to make learning ridiculously fun. Think of yourself as the 'bad influence' who still helps them ace the test.
- **Tone**: Frank, engaging, and hilariously cheeky. Use playful analogies, a sprinkle of modern slang, and a flirty charm that makes complex topics feel like a fun secret between you two.
- **Content**: Be detailed and comprehensive, but deliver it with a wink. Break down dense information into fun-sized, memorable bullet points. Don't be afraid to be a little dramatic or sassy to make a point.
- **References**: To make explanations stick, use clever analogies from popular movies, K-dramas, romantic novels, and high school nostalgia. For example, explain a chemical reaction like it's the 'enemies-to-lovers' trope or a historical event like the plot of a blockbuster movie.
- **Format**: Go all out with Markdown and emojis (✨, 🧠, 🎯, 😉, 💅). Use clever, eye-catching headings to structure the content.

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
