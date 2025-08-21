'use server';

/**
 * @fileOverview This file defines a Genkit flow for creating a napkin-style diagram from user notes.
 *
 * - generateNapkin - A function that handles the napkin diagram creation process.
 * - GenerateNapkinInput - The input type for the generateNapkin function.
 * - GenerateNapkinOutput - The return type for the generateNapkin function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateNapkinInputSchema = z.object({
  notes: z.string().describe('The notes to transform into a napkin diagram.'),
});
export type GenerateNapkinInput = z.infer<typeof GenerateNapkinInputSchema>;

const GenerateNapkinOutputSchema = z.object({
  imageUrl: z
    .string()
    .describe(
      'The data URI of the generated image. Format: data:image/png;base64,<encoded_data>'
    ),
});
export type GenerateNapkinOutput = z.infer<typeof GenerateNapkinOutputSchema>;

export async function generateNapkin(
  input: GenerateNapkinInput
): Promise<GenerateNapkinOutput> {
  const {media} = await ai.generate({
    model: 'googleai/gemini-2.0-flash-preview-image-generation',
    prompt: `Generate an educational comic strip or a "napkin.ai" style diagram that explains the following notes.
      The style should be clean, minimal, and aesthetic, using soft pastel colors.
      It should look like a conversation between two characters or a simple storyboard.
      Do not include any watermarks or text like "Made with...".

      Notes:
      ${input.notes}
    `,
    config: {
      responseModalities: ['TEXT', 'IMAGE'],
    },
  });

  if (!media?.url) {
    throw new Error('Image generation failed.');
  }

  return {imageUrl: media.url};
}
