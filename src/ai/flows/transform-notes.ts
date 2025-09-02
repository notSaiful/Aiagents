
'use server';

/**
 * @fileOverview This file defines a Genkit flow for transforming notes into multiple formats at once.
 * This is now DEPRECATED and will be removed. Use individual flows instead.
 * - transformNotes - A function that handles the unified transformation process.
 * - TransformNotesInput - The input type for the transformNotes function.
 * - TransformNotesOutput - The return type for the transformNotes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TransformNotesInputSchema = z.object({
  notes: z.string().describe('The notes to transform.'),
  style: z.string().describe('The style of output to generate (Minimalist, Story, Action, Formal).'),
});
export type TransformNotesInput = z.infer<typeof TransformNotesInputSchema>;

const FlashcardSchema = z.object({
  question: z.string().describe('The question for the flashcard.'),
  answer: z.string().describe('The answer to the question.'),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).describe("The difficulty of the question."),
});
export type Flashcard = z.infer<typeof FlashcardSchema>;


// Output Schema
const TransformNotesOutputSchema = z.object({
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
  flashcards: z.array(FlashcardSchema).describe('An array of 8-10 generated flashcards in Q&A format.'),
  mindMap: z.string().describe('A mind map in Mermaid syntax that represents the notes.'),
});
export type TransformNotesOutput = z.infer<typeof TransformNotesOutputSchema>;

// Style Instructions
const getStyleInstructions = (style: string) => {
    const commonHtmlRule = "Format all summaries using clean HTML (p, ul, li, strong, h3, h4).";
    const commonFlashcardRule = "Generate 8-10 flashcards, each with a difficulty ('Easy', 'Medium', 'Hard').";
    const commonMindMapRule = `Generate a mind map following these NON-NEGOTIABLE rules:
1. Start with "mindmap".
2. Have exactly ONE root node indented by 2 spaces.
3. Each node must be on its own line.
4. Use 4 spaces for each indentation level.
5. Quote any node text with special characters or spaces.
6. Include NO text outside the Mermaid syntax.`;

    switch (style) {
        case 'Minimalist':
            return `
                **Overall Vibe**: Calm, organized, efficient. ✨📌🌸
                **Summary**: ${commonHtmlRule} Focus on clarity and fast comprehension. Strip away clutter. Incorporate concise, motivational phrases.
                **Flashcards**: ${commonFlashcardRule} Each flashcard must be concise and clutter-free. Prioritize key concepts.
                **Mind Map**: ${commonMindMapRule} Keep it short, concise, and beautiful.
            `;
        case 'Story':
            return `
                **Overall Vibe**: Emotional, engaging, memorable. 💖🎭📚
                **Summary**: ${commonHtmlRule} Transform notes into a compelling narrative using pop culture analogies. Use headings like "Scene 1: The Setup".
                **Flashcards**: ${commonFlashcardRule} Frame questions like mini-scenes from a popular show. Use emojis like 💖, 🎭, 📚.
                **Mind Map**: ${commonMindMapRule} Frame the central idea as a "Main Plot" and branches as "Acts".
            `;
        case 'Action':
            return `
                **Overall Vibe**: Dramatic, powerful, energetic. ⚡🔥🛡️
                **Summary**: ${commonHtmlRule} Transform notes into a heroic saga. Frame content as a mission. Use headings like "Phase 1: The Gathering Storm".
                **Flashcards**: ${commonFlashcardRule} Frame questions as "Mission Objectives" or "Threats". Use emojis like ⚡🔥🛡️.
                **Mind Map**: ${commonMindMapRule} Frame the central idea as "Mission HQ" and branches as "Phases".
            `;
        case 'Formal':
            return `
                **Overall Vibe**: Professional, reliable, scholarly. 🏛️📑📌
                **Summary**: ${commonHtmlRule} Create a professional, exam-ready summary with clear, structured headings. Avoid informal language.
                **Flashcards**: ${commonFlashcardRule} Questions must be clear and precise. Answers must be accurate and well-defined.
                **Mind Map**: ${commonMindMapRule} Create a logical, hierarchical mind map of the academic concepts.
            `;
        default:
            return "Generate a standard summary, flashcards, and mind map.";
    }
}


// Main exported function
export async function transformNotes(input: TransformNotesInput): Promise<TransformNotesOutput> {
  return transformNotesFlow(input);
}


// The Genkit Flow
const transformNotesFlow = ai.defineFlow(
  {
    name: 'transformNotesFlow',
    inputSchema: TransformNotesInputSchema,
    outputSchema: TransformNotesOutputSchema,
  },
  async (input) => {
    
    const styleInstructions = getStyleInstructions(input.style);

    const transformPrompt = ai.definePrompt({
      name: 'transformNotesPrompt',
      output: {schema: TransformNotesOutputSchema},
      prompt: `You are an expert AI study assistant. Your task is to transform the user's notes into a comprehensive study package.

**Instructions for Style: ${input.style}**
${styleInstructions}

**Overall Task**:
1.  First, correct any spelling and grammar mistakes from the notes.
2.  Based on the corrected text, generate all of the following in a single JSON response:
    *   A short summary.
    *   A long summary.
    *   An array of flashcards.
    *   A mind map in Mermaid syntax.

The output MUST be a single, valid JSON object that strictly adheres to the defined output schema. Do not add any text or explanation outside of the JSON object.

**User's Notes**:
---
${input.notes}
---
`,
    });

    try {
      const {output} = await transformPrompt({});
      if (!output) {
        throw new Error("The AI failed to generate a response. Please try again.");
      }
      return output;
    } catch (error) {
      console.error("Error in transformNotesFlow:", error);
      throw new Error("Failed to transform notes due to an internal error. The AI may have returned an invalid format.");
    }
  }
);
