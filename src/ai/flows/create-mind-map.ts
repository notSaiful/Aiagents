
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
- Create a mind map with a central idea and clear, structured nodes in a horizontal layout.
- Use Mermaid mindmap syntax.
- Keep it SHORT, CONCISE, and BEAUTIFUL, stripping away clutter.
- Prioritize clarity and exam-readiness.
- Incorporate concise, motivational phrases or short, clever slogans where they naturally fit the content.
- The first line must be "mindmap".
- The root node MUST be wrapped in double parentheses, like this: root((Central Idea)). This is a strict rule.
- The first indented node after the root MUST be the single parent for all subsequent nodes. This is a strict rule.

Example of a valid mindmap:
mindmap
  root((Photosynthesis 'The Spark of Life' 🌱))
    Core Process
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
Instructions for Story (K-Drama & Pop Culture) style:
- Vibe: Emotional, engaging, memorable. 💖🎭📚
- Create a mind map that follows a narrative structure in a horizontal layout.
- Use Mermaid mindmap syntax.
- The central idea is the "Main Plot" or "Protagonist's Goal." Frame it with a pop culture analogy (e.g., "Defeating the Demogorgon").
- Main branches are the "Acts" or "Character Arcs." Use iconic dialogues or thematic quotes as node text to illustrate the concepts.
- Use emojis like 💖, 🎭, 💥, 📚 to tell the story.
- The first line must be "mindmap".
- The root node MUST be wrapped in double parentheses, like this: root((The Hero's Journey 🎭)). This is a strict rule.
- The first indented node after the root MUST be the single parent for all subsequent nodes. This is a strict rule.
`;

const actionStyleInstructions = `
Instructions for Bold / Action-Oriented (Avengers Style):
- Vibe: Dramatic, powerful, energetic. Inspired by Avengers, Justice League, and superhero comics. ⚡🔥🛡️
- **Heroic Analogy:** Represent key concepts as part of a battle plan.
- **Action Words:** Use energetic verbs (e.g., conquer, defeat, unleash).
- **Visual Punch:** Use emojis like ⚡🔥🛡️🏹.
- Create a mind map that feels like a superhero's mission briefing in a horizontal layout. The mind map should tell a story of a mission, from the setup to the final battle.
- Use Mermaid mindmap syntax.
- The central idea is the "Mission Control Center" or "Primary Mission." It sets the stage for the entire operation.
- Main branches are the "Phases" or "Allies" of the mission (e.g., "Phase 1: The Recon," "Allied Forces").
- Connect concepts like they are mission objectives, enemy weak points, or strategic assets.
- The first line must be "mindmap".
- The root node MUST be wrapped in double parentheses, like this: root((Mission: Defeat Thanos 💥)). This is a strict rule.
- The first indented node after the root MUST be the single parent for all subsequent nodes. This is a strict rule.
`;

const formalStyleInstructions = `
Instructions for Formal / Academic style:
- Vibe: Professional, reliable, scholarly. 🏛️📑📌
- Create a logical, hierarchical mind map in a horizontal layout, suitable for academic or professional use.
- Use Mermaid mindmap syntax.
- The central idea must be the core academic concept.
- Branches should represent main topics and sub-topics in a structured manner.
- Include famous academic quotes, proverbs, or authoritative statements that fit the concepts.
- Avoid informal language and excessive emojis. Use only scholarly emojis like 🏛️, 📑, 📌 sparingly.
- The first line must be "mindmap".
- The root node MUST be wrapped in double parentheses, like this: root((The Theory of Relativity 🏛️)). This is a strict rule.
- The first indented node after the root MUST be the single parent for all subsequent nodes. This is a strict rule.
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
    } else if (input.style === 'Action') {
      styleInstructions = actionStyleInstructions;
    } else if (input.style === 'Formal') {
      styleInstructions = formalStyleInstructions;
    }

    const prompt = ai.definePrompt({
      name: 'createMindMapPrompt',
      output: {schema: CreateMindMapOutputSchema},
      prompt: `You are an AI study assistant that transforms raw class notes into aesthetic, structured study material. Create a mind map from the notes in a ${input.style} style.

${styleInstructions}

The output must be a valid Mermaid mindmap string. Do not include any other text or explanations.
First, correct any spelling and grammar mistakes from the notes, then generate the mind map based on the corrected text.

Notes: ${input.notes}
`,
    });

    const {output} = await prompt({});
    return output!;
  }
);
