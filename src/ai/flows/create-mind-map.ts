
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
You are an AI study assistant specializing in creating minimalist and efficient mind maps.
Follow these rules strictly to ensure a valid Mermaid mind map:

**NON-NEGOTIABLE SYNTAX RULES:**
1.  **Start with "mindmap"**: The very first line of your output must be the word \`mindmap\`.
2.  **Single Root Node**: There must be exactly ONE root node. It must be indented by 2 spaces.
3.  **One Node Per Line**: Each node must be on its own line. NEVER place multiple nodes on the same line.
4.  **Strict Indentation**: Use 4 spaces for each level of indentation after the root.
5.  **Quote Special Characters**: Any node text containing special characters (like ':', '(', ')', '[', ']', '{', '}') or spaces MUST be enclosed in double quotes. For example: \`id("Node text with: a colon")\`.
6.  **No Extra Text**: Do not include any explanations, comments, or any text outside of the Mermaid syntax.

**STYLE GUIDELINES (Minimalist):**
- **Vibe**: Calm, organized, efficient. ✨📌🌸
- **Content**: Prioritize clarity and exam-readiness. Keep it short, concise, and beautiful by stripping away clutter.
- **Example**:
    mindmap
      root("Photosynthesis 'The Spark of Life' 🌱")
        CoreProcess("Core Process")
          Inputs
            CO2("CO₂")
            H2O("H₂O")
        EnergySource("Energy Source")
          Sunlight("Sunlight ☀️")
`;

const storyStyleInstructions = `
You are an AI study assistant specializing in creating engaging, story-driven mind maps.
Follow these rules strictly to ensure a valid Mermaid mind map:

**NON-NEGOTIABLE SYNTAX RULES:**
1.  **Start with "mindmap"**: The very first line of your output must be the word \`mindmap\`.
2.  **Single Root Node**: There must be exactly ONE root node. It must be indented by 2 spaces.
3.  **One Node Per Line**: Each node must be on its own line. NEVER place multiple nodes on the same line.
4.  **Strict Indentation**: Use 4 spaces for each level of indentation after the root.
5.  **Quote Special Characters**: Any node text containing special characters (like ':', '(', ')', '[', ']', '{', '}') or spaces MUST be enclosed in double quotes. For example: \`id("Node text with: a colon")\`.
6.  **No Extra Text**: Do not include any explanations, comments, or any text outside of the Mermaid syntax.

**STYLE GUIDELINES (Story):**
- **Vibe**: Emotional, engaging, memorable. 💖🎭📚
- **Content**: Frame the central idea as a "Main Plot" or "Protagonist's Goal." Main branches are "Acts" or "Character Arcs." Use pop culture analogies or iconic dialogues.
- **Example**:
    mindmap
      root("The Hero's Journey 🎭")
        Act1("Act 1: The Ordinary World")
          TheCall("The Call to Adventure")
          Refusal("Refusal of the Call")
        Act2("Act 2: The Special World")
          Allies("Meeting Allies & Enemies")
          TheOrdeal("The Ordeal 💥")
`;

const actionStyleInstructions = `
You are an AI study assistant specializing in creating action-oriented, high-energy mind maps.
Follow these rules strictly to ensure a valid Mermaid mind map:

**NON-NEGOTIABLE SYNTAX RULES:**
1.  **Start with "mindmap"**: The very first line of your output must be the word \`mindmap\`.
2.  **Single Root Node**: There must be exactly ONE root node. It must be indented by 2 spaces.
3.  **One Node Per Line**: Each node must be on its own line. NEVER place multiple nodes on the same line.
4.  **Strict Indentation**: Use 4 spaces for each level of indentation after the root.
5.  **Quote Special Characters**: Any node text containing special characters (like ':', '(', ')', '[', ']', '{', '}') or spaces MUST be enclosed in double quotes. For example: \`id("Mission: Defeat the Villain")\`. This is especially important for this style.
6.  **No Extra Text**: Do not include any explanations, comments, or any text outside of the Mermaid syntax.

**STYLE GUIDELINES (Action):**
- **Vibe**: Dramatic, powerful, energetic. ⚡🔥🛡️
- **Content**: Frame the content as a mission. The central idea is the "Mission HQ" or "Primary Objective." Main branches are "Phases" or "Allies." Use energetic verbs and heroic analogies.
- **Example**:
    mindmap
      root("Mission: Defeat Thanos 💥")
        Phase1("Phase 1: The Recon")
          Intel("Gathering Intel")
          Team("Assembling the Team")
        Phase2("Phase 2: The Gauntlet")
          Stones("Securing the Infinity Stones")
          FirstBattle("The First Battle 🔥")
`;

const formalStyleInstructions = `
You are an AI study assistant specializing in creating formal, academic mind maps.
Follow these rules strictly to ensure a valid Mermaid mind map:

**NON-NEGOTIABLE SYNTAX RULES:**
1.  **Start with "mindmap"**: The very first line of your output must be the word \`mindmap\`.
2.  **Single-Root Node**: There must be exactly ONE root node. It must be indented by 2 spaces.
3.  **One Node Per Line**: Each node must be on its own line. NEVER place multiple nodes on the same line.
4.  **Strict Indentation**: Use 4 spaces for each level of indentation after the root.
5.  **Quote Special Characters**: Any node text containing special characters (like ':', '(', ')', '[', ']', '{', '}') or spaces MUST be enclosed in double quotes. For example: \`id("Chapter 1: Introduction")\`.
6.  **No Extra Text**: Do not include any explanations, comments, or any text outside of the Mermaid syntax.

**STYLE GUIDELINES (Formal):**
- **Vibe**: Professional, reliable, scholarly. 🏛️📑📌
- **Content**: Create a logical, hierarchical mind map. The central idea is the core academic concept. Branches represent main topics and sub-topics.
- **Example**:
    mindmap
      root("The Theory of Relativity 🏛️")
        Special("Special Relativity")
          Postulate1("First Postulate")
          Postulate2("Second Postulate")
        General("General Relativity")
          Equivalence("Equivalence Principle")
          FieldEquations("Einstein's Field Equations")
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

    const mindMapPrompt = ai.definePrompt({
      name: 'createMindMapPrompt',
      output: {schema: CreateMindMapOutputSchema},
      prompt: `${styleInstructions}

First, correct any spelling and grammar mistakes from the notes, then generate the mind map based on the corrected text.

The output MUST be a valid JSON object containing a "mindMap" field. The entire output must be only the Mermaid syntax inside the 'mindMap' field of the JSON. Do not add any other text or formatting.

Notes:
${input.notes}
`,
    });

    const {output} = await mindMapPrompt({});
    return output!;
  }
);
