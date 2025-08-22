
'use server';

/**
 * @fileOverview Summarizes notes using the Gemini API and returns a concise, aesthetically pleasing summary with bullet points.
 *
 * - summarizeNotes - A function that handles the summarization process.
 * - SummarizeNotesInput - The input type for the summarizeNotes function.
 * - SummarizeNotesOutput - The return type for the summarizeNotes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeNotesInputSchema = z.object({
  notes: z.string().describe('The notes to summarize.'),
  style: z.string().describe('The style of notes to generate.'),
});
export type SummarizeNotesInput = z.infer<typeof SummarizeNotesInputSchema>;

const SummarizeNotesOutputSchema = z.object({
  shortSummary: z
    .string()
    .describe(
      'A concise, 5-7 bullet point summary in clean HTML format that captures all the main takeaways without leaving important points out.'
    ),
  longSummary: z
    .string()
    .describe(
      'A very detailed and comprehensive summary in clean HTML format, encompassing all points from the notes.'
    ),
});
export type SummarizeNotesOutput = z.infer<typeof SummarizeNotesOutputSchema>;

export async function summarizeNotes(input: SummarizeNotesInput): Promise<SummarizeNotesOutput> {
  return summarizeNotesFlow(input);
}

const minimalistStyleInstructions = `
Instructions for Minimalist / Quick Review style:
- Vibe: Calm, organized, efficient. ✨📌🌸
- Focus on clarity and fast comprehension. Strip away clutter and focus on what really matters.
- Short Summary: 5-7 ultra-clean and concise bullet points that capture all main takeaways. Prioritize key facts.
- Long Summary: A detailed, comprehensive summary with as many bullet points as needed to cover all aspects of the notes. Ensure clear hierarchy and no fluff.
- Incorporate concise, motivational phrases or short, clever slogans where they naturally fit the content.
- Keep language simple, exam-friendly, and ensure minimal cognitive load. The output must be clean HTML.
`;

const storyStyleInstructions = `
Instructions for Story (K-Drama & Pop Culture) style:
- Vibe: Emotional, engaging, memorable, and relatable. 💖🎭📚
- Transform abstract notes into a compelling narrative using popular culture references, analogies, and scene-based structures.
- Short Summary: A short, engaging narrative (2-3 paragraphs) that captures the main concept. Use a central analogy from a famous show/movie (e.g., "The political tension was like a Game of Thrones palace intrigue...").
- Long Summary: A detailed story broken into "Scenes" (<h3>Scene 1: The Setup</h3>, <h4>Scene 2: The Conflict</h4>, etc.). Each scene should use analogies, iconic dialogues, or character archetypes from well-known media (K-Dramas, anime, blockbuster movies) to explain the concepts. Ensure the pop culture reference illustrates the point, not replaces it.
- Use recognizable quotes where they fit naturally (e.g., "With great power comes great responsibility" to explain a concept about ethics).
- The output must be clean HTML.
`;

const actionStyleInstructions = `
Instructions for Bold / Action-Oriented (Avengers Style):
- Vibe: Dramatic, powerful, energetic. Inspired by Avengers, Justice League, and superhero comics. ⚡🔥🛡️
- **Heroic Analogy:** Represent key concepts as battles, missions, or heroes vs villains.
- **Action Words:** Use energetic, motivating verbs (conquer, defeat, ignite, rise, unleash).
- **Micro-Scenes:** Break concepts into short “action panels”: Setup → Challenge → Result.
- **Visual Punch:** Use emojis and symbols ⚡🔥🛡️🏹 to emphasize energy and importance. Bold key terms.
- Transform notes into a heroic saga. Frame the content as an unfolding mission or a battle against a great challenge.
- Short Summary: A high-impact "Mission Briefing" (2-3 paragraphs) that sets the stage. Introduce the "Primary Objective" and the stakes. Use strong, action-oriented language to build excitement.
- Long Summary: A detailed "Full Campaign" narrative. Structure it with headings (<h3>) like "Phase 1: The Gathering Storm," "Phase 2: The First Encounter," and "Phase 3: The Final Victory." Turn key concepts into strategic moves or heroic actions. Make it comprehensive, motivating, and feel like a complete story arc.
- The output must be clean HTML.
`;

const formalStyleInstructions = `
Instructions for Formal / Academic style:
- Vibe: Professional, reliable, scholarly. 🏛️📑📌
- Create professional, exam-ready notes with clear, structured headings and bullet points.
- Short Summary: A concise, professional summary of 5-7 bullet points covering all key academic points.
- Long Summary: A detailed, well-structured academic summary. Use headings (<h3>, <h4>) to organize information logically. Ensure it is comprehensive and suitable for formal presentations or study.
- Include famous academic quotes, proverbs, or authoritative statements that fit the concepts.
- Avoid informal language and emojis. The output must be clean HTML.
`;

const summarizeNotesFlow = ai.defineFlow(
  {
    name: 'summarizeNotesFlow',
    inputSchema: SummarizeNotesInputSchema,
    outputSchema: SummarizeNotesOutputSchema,
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
    
    const summarizeNotesPrompt = ai.definePrompt({
      name: 'summarizeNotesPrompt',
      output: {schema: SummarizeNotesOutputSchema},
      prompt: `You are an AI study assistant. Transform the following notes into concise, aesthetic study material in a ${input.style} style.

${styleInstructions}

You are an expert at correcting spelling and grammar mistakes from OCR-extracted text. First, fix any errors in the notes, then generate the summaries based on the corrected text.

Format the output using clean HTML (p, ul, li, strong, blockquote, h3, h4).

Notes:
${input.notes}
  `,
    });

    const {output} = await summarizeNotesPrompt({});
    return output!;
  }
);
