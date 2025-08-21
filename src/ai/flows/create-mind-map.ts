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
});
export type CreateMindMapInput = z.infer<typeof CreateMindMapInputSchema>;

const MindMapNodeSchema: z.ZodType<any> = z.object({
  name: z.string(),
  children: z.lazy(() => MindMapNodeSchema.array()).optional(),
});

const CreateMindMapOutputSchema = z.object({
  mindMap: MindMapNodeSchema.describe('A JSON representation of the mind map structure.'),
});

export type CreateMindMapOutput = z.infer<typeof CreateMindMapOutputSchema>;

export async function createMindMap(input: CreateMindMapInput): Promise<CreateMindMapOutput> {
  return createMindMapFlow(input);
}

const prompt = ai.definePrompt({
  name: 'createMindMapPrompt',
  input: {schema: CreateMindMapInputSchema},
  output: {schema: CreateMindMapOutputSchema},
  prompt: `You are an AI expert in creating mind maps. Transform the given notes into a JSON structure representing a mind map. Ensure the JSON is valid and well-structured.

Notes: {{{notes}}}
`,
});

const createMindMapFlow = ai.defineFlow(
  {
    name: 'createMindMapFlow',
    inputSchema: CreateMindMapInputSchema,
    outputSchema: CreateMindMapOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
