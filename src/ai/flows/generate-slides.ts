
'use server';

/**
 * @fileOverview A Genkit flow for creating a PowerPoint presentation from user notes using the SlidesGPT API.
 *
 * - generateSlides - A function that handles the presentation generation process.
 * - GenerateSlidesInput - The input type for the generateSlides function.
 * - GenerateSlidesOutput - The return type for the generateSlides function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import fetch from 'node-fetch';

const GenerateSlidesInputSchema = z.object({
  notes: z.string().describe('The plain text notes to transform into a presentation.'),
});
export type GenerateSlidesInput = z.infer<typeof GenerateSlidesInputSchema>;

const GenerateSlidesOutputSchema = z.object({
  downloadUrl: z.string().describe('The public URL to download the generated .pptx file.'),
  embedUrl: z.string().describe('The URL to embed the presentation.'),
});
export type GenerateSlidesOutput = z.infer<typeof GenerateSlidesOutputSchema>;

// Helper function to strip HTML tags from a string
function stripHtml(html: string): string {
  if (!html) return '';
  return html.replace(/<[^>]*>?/gm, '');
}

export async function generateSlides(input: GenerateSlidesInput): Promise<GenerateSlidesOutput> {
  const plainTextNotes = stripHtml(input.notes);
  if (!plainTextNotes.trim()) {
    throw new Error('Notes content cannot be empty.');
  }
  return generateSlidesFlow({ notes: plainTextNotes });
}

const generateSlidesFlow = ai.defineFlow(
  {
    name: 'generateSlidesFlow',
    inputSchema: GenerateSlidesInputSchema,
    outputSchema: GenerateSlidesOutputSchema,
  },
  async ({ notes }) => {
    const apiKey = process.env.SLIDESGPT_API_KEY;
    if (!apiKey) {
      console.error('SlidesGPT API key is not configured.');
      throw new Error('The slide generation service is not configured. Please contact support.');
    }

    const apiUrl = 'https://api.slidesgpt.com/v1/presentations/generate';
    
    const requestBody = {
        prompt: notes,
    };

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorBody = await response.json();
        console.error(`SlidesGPT API Error (Status: ${response.status}):`, errorBody);
        throw new Error(`Slide generation failed. Please check API key and notes format. (Status: ${response.status})`);
      }

      const result = await response.json();

      return { 
        downloadUrl: result.download,
        embedUrl: result.embed,
      };

    } catch (error) {
        if (error instanceof Error) {
            console.error('Error calling SlidesGPT API:', error.message);
            throw error;
        }
        console.error('An unexpected error occurred in generateSlidesFlow:', error);
        throw new Error('An unexpected error occurred during slide generation.');
    }
  }
);
