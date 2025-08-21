'use server';

/**
 * @fileOverview This file defines a Genkit flow for creating a diagram from user notes.
 *
 * - generateDiagram - A function that handles the diagram creation process.
 * - GenerateDiagramInput - The input type for the generateDiagram function.
 * - GenerateDiagramOutput - The return type for the generateDiagram function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDiagramInputSchema = z.object({
  notes: z.string().describe('The notes to transform into a diagram.'),
});
export type GenerateDiagramInput = z.infer<typeof GenerateDiagramInputSchema>;

const GenerateDiagramOutputSchema = z.object({
    diagram: z.string().describe('A diagram in Mermaid syntax that represents the notes.'),
});

export type GenerateDiagramOutput = z.infer<typeof GenerateDiagramOutputSchema>;

export async function generateDiagram(input: GenerateDiagramInput): Promise<GenerateDiagramOutput> {
  return generateDiagramFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDiagramPrompt',
  input: {schema: GenerateDiagramInputSchema},
  output: {schema: GenerateDiagramOutputSchema},
  prompt: `You are an AI expert in creating diagrams. Transform the given notes into a Mermaid syntax diagram.
  
  Choose a suitable diagram type (e.g., flowchart, sequence diagram, mindmap) based on the content of the notes.
  
  Ensure the Mermaid syntax is valid and accurately represents the information in the notes.

Notes: {{{notes}}}
`,
});

const generateDiagramFlow = ai.defineFlow(
  {
    name: 'generateDiagramFlow',
    inputSchema: GenerateDiagramInputSchema,
    outputSchema: GenerateDiagramOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
