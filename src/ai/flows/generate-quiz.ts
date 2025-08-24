
'use server';

/**
 * @fileOverview AI agent that generates a quiz from input notes.
 *
 * - generateQuiz - A function that generates a quiz from input notes.
 * - GenerateQuizInput - The input type for the generateQuiz function.
 * - GenerateQuizOutput - The return type for the generateQuiz function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateQuizInputSchema = z.object({
  notes: z.string().describe('The notes to generate a quiz from.'),
  style: z.string().describe('The style of quiz to generate.'),
});
export type GenerateQuizInput = z.infer<typeof GenerateQuizInputSchema>;

const QuizQuestionSchema = z.object({
    question: z.string().describe('The quiz question.'),
    options: z.array(z.string()).describe('An array of 4 multiple-choice options.'),
    answer: z.string().describe('The correct answer to the question.'),
    difficulty: z.number().min(1).max(3).describe('The difficulty of the question, from 1 (easy) to 3 (hard).')
});

const GenerateQuizOutputSchema = z.object({
  questions: z.array(QuizQuestionSchema).describe('An array of 10 generated quiz questions.'),
});
export type GenerateQuizOutput = z.infer<typeof GenerateQuizOutputSchema>;
export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;

export async function generateQuiz(input: GenerateQuizInput): Promise<GenerateQuizOutput> {
  return generateQuizFlow(input);
}

const getStyleInstructions = (style: string) => {
    switch (style) {
        case 'Minimalist':
            return `
                - **Vibe**: Calm, organized, efficient. ✨📌🌸
                - **Questions**: Clear, concise, and focused on key facts and definitions.
            `;
        case 'Story':
            return `
                - **Vibe**: Emotional, engaging, memorable. 💖🎭📚
                - **Questions**: Frame questions as scenarios or conflicts from a story. Use pop culture analogies.
            `;
        case 'Action':
            return `
                - **Vibe**: Dramatic, powerful, energetic. ⚡🔥🛡️
                - **Questions**: Frame questions as "Mission Objectives" or "Threats." Use heroic analogies and action-oriented language.
            `;
        case 'Formal':
            return `
                - **Vibe**: Professional, reliable, scholarly. 🏛️📑📌
                - **Questions**: Use precise, academic language. Focus on core concepts and formal definitions.
            `;
        default:
            return '';
    }
}


const generateQuizFlow = ai.defineFlow(
  {
    name: 'generateQuizFlow',
    inputSchema: GenerateQuizInputSchema,
    outputSchema: GenerateQuizOutputSchema,
  },
  async (input) => {
    
    const styleInstructions = getStyleInstructions(input.style);

    const prompt = ai.definePrompt({
      name: 'generateQuizPrompt',
      output: {schema: GenerateQuizOutputSchema},
      prompt: `You are an AI game master. Your task is to create a challenging and engaging quiz from the provided notes.

**Style Instructions (${input.style})**:
${styleInstructions}

**Rules**:
1. Generate exactly 10 multiple-choice questions.
2. Each question must have exactly 4 options.
3. One of the options must be the correct answer.
4. Set a difficulty for each question: 1 for easy, 2 for medium, and 3 for hard. The damage dealt in the game will be based on this difficulty.
5. The output MUST be a valid JSON object containing a "questions" array.
6. First, correct any spelling and grammar mistakes from the notes, then generate the quiz based on the corrected text.

**Notes**:
${input.notes}
`,
    });

    const {output} = await prompt({});
    return output!;
  }
);
