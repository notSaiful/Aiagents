
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
});
export type GenerateSlidesInput = z.infer<typeof GenerateSlidesInputSchema>;

const GenerateSlidesOutputSchema = z.object({
  downloadUrl: z.string().describe('The public URL to download the generated .pptx file.'),
});
export type GenerateSlidesOutput = z.infer<typeof GenerateSlidesOutputSchema>;

export async function generateSlides(input: GenerateSlidesInput): Promise<GenerateSlidesOutput> {
  return generateSlidesFlow(input);
}

const generateSlidesFlow = ai.defineFlow(
  {
    name: 'generateSlidesFlow',
    inputSchema: GenerateSlidesInputSchema,
    outputSchema: GenerateSlidesOutputSchema,
  },
  async ({ notes, title }) => {
    const apiKey = process.env.SLIDESGPT_API_KEY;
    if (!apiKey) {
      throw new Error('SlidesGPT API key is not configured.');
    }

    const apiUrl = 'https://api.slidesgpt.com/v1/generate/powerpoint';
    const presentationTitle = title || 'Presentation from Notes';
    
    // 1. Call SlidesGPT API
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        title: presentationTitle,
        notes: notes,
        style: "futuristic_ai",
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('SlidesGPT API Error:', errorBody);
      throw new Error(`Failed to generate slides. API responded with status ${response.status}.`);
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
