
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

const minimalistStyleInstructions = `
Instructions for Minimalist / Quick Review style:
- Vibe: Calm, organized, efficient. ✨📌🌸
- Generate 3-5 flashcards based on the provided notes.
- Each flashcard must have a concise, clutter-free question and an accurate, exam-ready answer.
- Prioritize key concepts, definitions, and essential facts from the notes.
- Incorporate concise, motivational phrases or short, clever slogans where they naturally fit the content.
`;

const storyStyleInstructions = `
Instructions for Story (K-Drama) style:
- Vibe: Emotional, engaging, memorable. 💖🎭📚
- Generate 3-5 flashcards that feel like mini-scenarios or dramatic turning points.
- Question: Frame it as a situation or a conflict a character might face.
- Answer: Provide the key concept as the resolution or the lesson learned.
- Weave in relevant emotional dialogues or dramatic quotes that align with the concepts.
- Use emojis like 💖, 🎭, 📚 to add emotional context.
`;

const actionStyleInstructions = `
Instructions for Bold / Action-Oriented (Avengers Style):
- Vibe: Dramatic, powerful, energetic. ⚡🔥🛡️
- Generate 3-5 high-impact flashcards designed for action-takers.
- Question: Frame it as a "Mission" or "Objective."
- Answer: Provide the "Intel" or "Strategy" needed to complete the mission.
- Use punchy, heroic slogans or meme references from popular movies where they fit the concept.
- Use strong, motivating language and emojis like ⚡, 🔥, 🛡️.
`;

const formalStyleInstructions = `
Instructions for Formal / Academic style:
- Vibe: Professional, reliable, scholarly. 🏛️📑📌
- Generate 3-5 flashcards suitable for academic or professional settings.
- Question: Must be clear, precise, and directly related to core academic concepts in the notes.
- Answer: Must be accurate, well-defined, and structured.
- Include famous academic quotes, proverbs, or authoritative statements that fit the concepts.
- Avoid slang or informal language.
`;

const generateFlashcardsFlow = ai.defineFlow(
  {
    name: 'generateFlashcardsFlow',
    inputSchema: GenerateFlashcardsInputSchema,
    outputSchema: GenerateFlashcardsOutputSchema,
  },
  async (input) => {
    let styleInstructions = '';
    if (input.style === 'Minimalist') {
      styleInstructions = minimalistStyleInstructions;
    } else if (input.style === 'Story') {
      styleInstructions = storyStyleInstructions;
    } else if (input.style === 'Action') {
      styleInstructions = actionStyleInstructions;
    } else if (input.style === 'Formal') {
      styleInstructions = formalStyleInstructions;
    }
    
    const prompt = ai.definePrompt({
      name: 'generateFlashcardsPrompt',
      output: {schema: GenerateFlashcardsOutputSchema},
      prompt: `You are an AI study assistant that transforms raw class notes into aesthetic, structured study material. Generate flashcards from the notes in a ${input.style} style.

${styleInstructions}

The output MUST be a valid JSON object containing a "flashcards" array.

First, correct any spelling and grammar mistakes from the notes, then generate the flashcards based on the corrected text.

Notes: ${input.notes}
`,
    });

    const {output} = await prompt({});
    return output!;
  }
);
