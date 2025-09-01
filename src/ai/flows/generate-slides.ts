
'use server';

/**
 * @fileOverview A Genkit flow for creating a PowerPoint presentation from user notes.
 *
 * - generateSlides - A function that handles the presentation generation process.
 * - GenerateSlidesInput - The input type for the generateSlides function.
 * - GenerateSlidesOutput - The return type for the generateSlides function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import fetch from 'node-fetch';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { app } from '@/lib/firebase';

const GenerateSlidesInputSchema = z.object({
  notes: z.string().describe('The notes to transform into a presentation.'),
  title: z.string().optional().describe('The title for the presentation.'),
  style: z.string().default('futuristic_ai').describe('The design style for the presentation.'),
  maxSlides: z.number().optional().describe('The maximum number of slides to generate.'),
});
export type GenerateSlidesInput = z.infer<typeof GenerateSlidesInputSchema>;

const GenerateSlidesOutputSchema = z.object({
  downloadUrl: z.string().describe('The public URL to download the generated .pptx file.'),
});
export type GenerateSlidesOutput = z.infer<typeof GenerateSlidesOutputSchema>;

export async function generateSlides(input: GenerateSlidesInput): Promise<GenerateSlidesOutput> {
  if (!input.notes.trim()) {
    throw new Error('Notes content cannot be empty.');
  }
  return generateSlidesFlow(input);
}

const generateSlidesFlow = ai.defineFlow(
  {
    name: 'generateSlidesFlow',
    inputSchema: GenerateSlidesInputSchema,
    outputSchema: GenerateSlidesOutputSchema,
  },
  async ({ notes, title, style, maxSlides }) => {
    const apiKey = process.env.SLIDESGPT_API_KEY;
    if (!apiKey) {
      console.error('SlidesGPT API key is not configured.');
      throw new Error('The slide generation service is not configured. Please contact support.');
    }

    const apiUrl = 'https://api.slidesgpt.com/v1/generate/powerpoint';
    const presentationTitle = title || 'Presentation from Notes';
    
    const requestBody: { [key: string]: any } = {
        title: presentationTitle,
        notes: notes,
        style: style,
    };

    if (maxSlides) {
        requestBody.maxSlides = maxSlides;
    }

    // 1. Call SlidesGPT API
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`SlidesGPT API Error (Status: ${response.status}):`, errorBody);
      if (response.status === 401 || response.status === 403) {
          throw new Error('Slide generation failed due to an authentication issue. Please contact support.');
      }
      throw new Error(`Slide generation failed. Please check API key and notes format.`);
    }

    const presentationBuffer = await response.buffer();
    
    // 2. Upload to Firebase Storage
    const storage = getStorage(app);
    const fileName = `presentations/${new Date().getTime()}-${presentationTitle.replace(/\s/g, '_')}.pptx`;
    const storageRef = ref(storage, fileName);
    
    const snapshot = await uploadBytes(storageRef, presentationBuffer, {
      contentType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    });

    // 3. Get Download URL
    const downloadUrl = await getDownloadURL(snapshot.ref);

    return { downloadUrl };
  }
);
