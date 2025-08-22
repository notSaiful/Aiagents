
'use server';

/**
 * @fileOverview This file defines a Genkit flow for creating a mind map from user notes.
 *
 * - createMindMap - A function that handles the mind map creation process.
 * - CreateMindMapInput - The input type for the createMindMap function.
 * - CreateMindMapOutput - The return type for the createMindMap function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CreateMindMapInputSchema = z.object({
  notes: z.string().describe('The notes to transform into a mind map.'),
  style: z.string().describe('The style of notes to generate.'),
});
export type CreateMindMapInput = z.infer<typeof CreateMindMapInputSchema>;

const CreateMindMapOutputSchema = z.object({
  mindMap: z.string().describe('A mind map in Mermaid syntax that represents the notes.'),
});

export type CreateMindMapOutput = z.infer<typeof CreateMindMapOutputSchema>;

export async function createMindMap(input: CreateMindMapInput): Promise<CreateMindMapOutput> {
  return createMindMapFlow(input);
}

const minimalistStyleInstructions = `
Instructions for Minimalist / Quick Review style:
- Vibe: Calm, organized, efficient. ✨📌🌸
- Create a mind map with a central idea and clear, structured nodes.
- Use Mermaid mindmap syntax.
- Keep it SHORT, CONCISE, and BEAUTIFUL, stripping away clutter.
- Prioritize clarity and exam-readiness.
- The first line must be "mindmap".
- The root node MUST be wrapped in double parentheses, like this: root((Central Idea)). This is a strict rule.
- Use minimal emojis like ✨, 📌, 📚, 🌸 to make it aesthetic.

Example of a valid mindmap:
mindmap
  root((Photosynthesis 🌱))
    Inputs
      CO₂
      H₂O
    Energy Source
      Sunlight ☀️
    Outputs
      Glucose
      Oxygen
`;

const storyStyleInstructions = `
Instructions for Story (K-Drama) style:
- Vibe: Emotional, engaging, memorable. 💖🎭📚
- Create a mind map that follows a narrative structure.
- Use Mermaid mindmap syntax.
- The central idea should be the "Protagonist" or "Main Plot."
- Main branches can be "Act 1: The Setup," "Act 2: The Conflict," "Act 3: The Resolution."
- Connect concepts like they are characters or plot points.
- Use dramatic emojis like 💖, 🎭, 💔, 💥, 📚 to tell the story.
- The first line must be "mindmap".
- The root node MUST be wrapped in double parentheses, like this: root((The Tragic Hero's Journey 🎭)). This is a strict rule.
`;

const createMindMapFlow = ai.defineFlow(
  {
    name: 'createMindMapFlow',
    inputSchema: CreateMindMapInputSchema,
    outputSchema: CreateMindMapOutputSchema,
  },
  async (input) => {
    let styleInstructions = '';
    if (input.style === 'Minimalist') {
      styleInstructions = minimalistStyleInstructions;
    } else if (input.style === 'Story') {
        styleInstructions = storyStyleInstructions;
    }

    const prompt = ai.definePrompt({
      name: 'createMindMapPrompt',
      output: {schema: CreateMindMapOutputSchema},
      prompt: `You are an AI study assistant that transforms raw class notes into aesthetic, structured study material. Create a mind map from the notes in a ${input.style} style.

${styleInstructions}

Notes: ${input.notes}
`,
    });

    const {output} = await prompt({});
    return output!;
  }
);
