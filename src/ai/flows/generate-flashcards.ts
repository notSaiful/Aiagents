
'use server';

/**
 * @fileOverview AI agent that generates flashcards from input notes.
 *
 * - generateFlashcards - A function that generates flashcards from input notes.
 * - GenerateFlashcardsInput - The input type for the generateFlashcards function.
 * - GenerateFlashcardsOutput - The return type for the generateFlashcards function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateFlashcardsInputSchema = z.object({
  notes: z.string().describe('The notes to generate flashcards from.'),
  style: z.string().describe('The style of notes to generate.'),
});
export type GenerateFlashcardsInput = z.infer<typeof GenerateFlashcardsInputSchema>;

const GenerateFlashcardsOutputSchema = z.object({
  flashcards: z.array(
    z.object({
      question: z.string().describe('The question for the flashcard.'),
      answer: z.string().describe('The answer to the question.'),
    })
  ).describe('The generated flashcards in Q&A format.'),
});
export type GenerateFlashcardsOutput = z.infer<typeof GenerateFlashcardsOutputSchema>;

export async function generateFlashcards(input: GenerateFlashcardsInput): Promise<GenerateFlashcardsOutput> {
  return generateFlashcardsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFlashcardsPrompt',
  input: {schema: GenerateFlashcardsInputSchema},
  output: {schema: GenerateFlashcardsOutputSchema},
  prompt: `You are an AI study assistant that transforms raw class notes into aesthetic, structured study material. Generate flashcards from the notes in a {{style}} style.

{{#ifCond style '==' 'Minimalist'}}
Instructions for Minimalist / Quick Review style:
- Generate 3-5 flashcards based on the provided notes.
- Each flashcard must have a concise question and an accurate, exam-ready answer.
- Prioritize key concepts, definitions, and important facts from the notes.
{{/ifCond}}

The output MUST be a valid JSON object containing a "flashcards" array.

Notes: {{{notes}}}
`,
});

const generateFlashcardsFlow = ai.defineFlow(
  {
    name: 'generateFlashcardsFlow',
    inputSchema: GenerateFlashcardsInputSchema,
    outputSchema: GenerateFlashcardsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
