
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
Instructions for Story (K-Drama) style:
- Vibe: Emotional, engaging, memorable. 💖🎭📚
- Turn boring notes into short, memorable stories. Add an emotional twist, so even complex ideas stick in your memory.
- Short Summary: A short, engaging narrative (2-3 paragraphs) that captures the main concept of the notes. Weave in a touch of K-Drama style emotion—a hint of conflict, a surprising connection, a moment of realization.
- Long Summary: A more detailed story, like a mini-series episode. Break down the notes into scenes or chapters. Use headings (<h3>) for each "scene." Flesh out the concepts with characters, dialogue, or a clear plot. Ensure the story arc covers all key points from the notes comprehensively.
- Weave in relevant emotional dialogues or romantic/dramatic quotes that align with the concepts. Use emojis like 💖, 🎭, 📚. The output must be clean HTML.
`;

const actionStyleInstructions = `
Instructions for Bold / Action-Oriented (Avengers Style):
- Vibe: Dramatic, powerful, energetic. Inspired by Avengers, Justice League, and superhero comics. ⚡🔥🛡️
- Short Summary: A high-impact "mission briefing" with 5-7 punchy bullet points. Frame key concepts as "Primary Objectives" or "Intel." Use strong, action-oriented verbs and heroic language.
- Long Summary: A detailed "strategic overview." Structure it with headings like "Mission Critical," "Threat Analysis," and "Strategic Imperatives." Make it comprehensive, motivating, and ready for deployment.
- Use punchy, heroic slogans or memorable quotes from popular superhero movies/comics where they fit the concept (e.g., "On your left," "I can do this all day," "Some men just want to watch the world burn").
- Use emojis like ⚡, 🔥, 🛡️, 💥, 🎯 to add excitement and energy. The output must be clean HTML.
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
