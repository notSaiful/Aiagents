
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
- Generate 8-10 flashcards based on the provided notes.
- Each flashcard must have a concise, clutter-free question and an accurate, exam-ready answer.
- Prioritize key concepts, definitions, and essential facts from the notes.
- Incorporate concise, motivational phrases or short, clever slogans where they naturally fit the content.
`;

const storyStyleInstructions = `
Instructions for Story (K-Drama & Pop Culture) style:
- Vibe: Emotional, engaging, memorable. 💖🎭📚
- Generate 8-10 flashcards that feel like mini-scenes or dramatic turning points from a popular show.
- Question: Frame it as a situation or conflict a character might face, using a pop culture analogy (e.g., "In this 'Squid Game'-like scenario, what is the key rule for survival?").
- Answer: Provide the key concept as the resolution or the lesson learned, reinforcing it with a thematic quote or takeaway.
- Use emojis like 💖, 🎭, 📚 to add emotional context. Ensure the reference illustrates the academic point.
`;

const actionStyleInstructions = `
Instructions for Bold / Action-Oriented (Avengers Style):
- Vibe: Dramatic, powerful, energetic. Inspired by Avengers, Justice League, and superhero comics. ⚡🔥🛡️
- **Heroic Analogy:** Represent key concepts as battles or missions.
- **Action Words:** Use energetic verbs (e.g., conquer, defeat, unleash).
- **Visual Punch:** Use emojis like ⚡🔥🛡️🏹.
- Generate 8-10 high-impact flashcards that tell a small part of a larger heroic story.
- Question: Frame it as a critical "Mission Objective" or a "Threat" that the hero must overcome (e.g., "With the city's power grid failing, how can our hero restore it?").
- Answer: Provide the "Intel," "Strategy," or "Key to Victory" needed to succeed. The answer should feel like a piece of crucial information that leads to mission success.
`;

const formalStyleInstructions = `
Instructions for Formal / Academic style:
- Vibe: Professional, reliable, scholarly. 🏛️📑📌
- Generate 8-10 flashcards suitable for academic or professional settings.
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
