'use server';

/**
 * @fileOverview A Genkit flow for creating a PowerPoint presentation from user notes using the SlidesGPT API.
 *
 * - generateSlides - A function that handles the presentation generation process.
 * - GenerateSlidesInput - The input type for the generateSlides function ويعمل في الخلفية 
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
  
  const wordCount = plainTextNotes.trim().split(/\s+/).length;
  if (wordCount < 20 || wordCount > 5000) {
    throw new Error('Notes must be between 20 and 5,000 words to generate slides.');
  }
  
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
    
    // Construct a detailed prompt with design guidelines
    const designPrompt = `
      Create a professional and visually stunning PowerPoint presentation based on the following notes.

      **Design Guidelines:**
      - **Theme:** Use a modern, minimalistic theme with high contrast for readability.
      - **Visuals:** Add relevant, high-quality icons and simple illustrations on each slide to enhance understanding.
      - **Color Palette:** Use a consistent and professional color palette. A good base would be shades of blue, white, and grey, with a single, clear accent color for emphasis (like a bright orange or teal).
      - **Typography:** Titles and headings should be big and bold. Body text should be lighter and clean, ensuring it's easy to read.
      - **Content Structure:** Use bullet points with short, impactful phrases. Limit bullet points to a maximum of 5 per slide to avoid clutter.
      - **Layout:** Ensure plenty of whitespace on each slide. The design should feel open and uncluttered.
      - **Data Visualization:** If the notes contain data or comparisons, include one simple, clear visual chart or diagram.
      - **Structure:** Start with a title slide, follow with content slides, and end with a strong summary slide and a final "Thank You" or "Q&A" slide.

      **Notes to convert:**
      ---
      ${notes}
      ---
    `;

    const requestBody = {
        prompt: designPrompt,
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
        let errorBody;
        try {
          errorBody = await response.json();
        } catch (e) {
          errorBody = { message: 'Failed to parse error response from API.' };
        }
        
        console.error(`SlidesGPT API Error (Status: ${response.status}):`, errorBody);

        let errorMessage = 'Slide generation failed due to an unknown error.';
        if (response.status === 401) {
            errorMessage = 'Unauthorized: Please check your SlidesGPT API key.';
        } else if (response.status === 404) {
            errorMessage = 'API endpoint not found. Please contact support.';
        } else if (response.status >= 500) {
            errorMessage = 'SlidesGPT server error. Please try again later.';
        } else if (errorBody && errorBody.message) {
            errorMessage = `API Error: ${errorBody.message}`;
        }
        
        throw new Error(errorMessage);
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
