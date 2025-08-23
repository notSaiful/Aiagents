
'use server';

/**
 * @fileOverview A Genkit flow for creating a podcast from user notes.
 *
 * - generatePodcast - A function that handles the podcast creation process.
 * - GeneratePodcastInput - The input type for the generatePodcast function.
 * - GeneratePodcastOutput - The return type for the generatePodcast function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import wav from 'wav';

const GeneratePodcastInputSchema = z.object({
  notes: z.string().describe('The notes to transform into a podcast script.'),
  style: z.string().describe('The style of podcast to generate.'),
});
export type GeneratePodcastInput = z.infer<typeof GeneratePodcastInputSchema>;

const GeneratePodcastOutputSchema = z.object({
  podcastWavDataUri: z.string().describe('A WAV file of the podcast, as a data URI.'),
});
export type GeneratePodcastOutput = z.infer<typeof GeneratePodcastOutputSchema>;

export async function generatePodcast(input: GeneratePodcastInput): Promise<GeneratePodcastOutput> {
  return generatePodcastFlow(input);
}

const minimalistStyleInstructions = `
- **Vibe**: Calm, organized, efficient. ✨📌🌸
- **Characters**: Two speakers, "Speaker1" (neutral, smooth, male voice - Algenib) and "Speaker2" (clear, informative, female voice - Achernar).
- **Dialogue Style**: Clear, concise, and direct. Focus on breaking down complex topics into simple, digestible pieces of information. No fluff, just facts and clarity.
- **Example**:
  - Speaker1: "Today, we are discussing photosynthesis."
  - Speaker2: "It's the process plants use to convert light into energy."
`;

const storyStyleInstructions = `
- **Vibe**: Emotional, engaging, memorable. 💖🎭📚
- **Characters**: Two speakers, "Speaker1" (dramatic, expressive male voice - Algenib) and "Speaker2" (emotional, narrative female voice - Achernar).
- **Dialogue Style**: Frame the concepts as a story with a beginning, middle, and end. Use analogies and metaphors to make the content relatable. Dialogue should feel like a conversation from a K-Drama or a compelling narrative.
- **Example**:
  - Speaker1: "Imagine a kingdom starved of light. That was the world before the hero, Photosynthesis, arrived."
  - Speaker2: "And with a single beam of sunlight, it created a feast of life, banishing the darkness."
`;

const actionStyleInstructions = `
- **Vibe**: Dramatic, powerful, energetic. ⚡🔥🛡️
- **Characters**: Two speakers, "Speaker1" (deep, heroic male voice - Algenib) and "Speaker2" (energetic, fast-paced female voice - Achernar).
- **Dialogue Style**: Frame the dialogue as a mission briefing or an action movie scene. Use strong, action-oriented verbs. The conversation should be high-energy and exciting.
- **Example**:
  - Speaker1: "Our mission, should we choose to accept it, is to conquer the process of cellular respiration."
  - Speaker2: "Phase one: Unleash the power of glucose. Phase two: Ignite the Krebs cycle. We will not fail."
`;

const formalStyleInstructions = `
- **Vibe**: Professional, reliable, scholarly. 🏛️📑📌
- **Characters**: Two speakers, "Speaker1" (calm, authoritative male voice - Algenib) and "Speaker2" (clear, professional female voice - Achernar).
- **Dialogue Style**: The dialogue should be structured like an academic discussion or a formal presentation. Use precise terminology and cite concepts as if in a lecture.
- **Example**:
  - Speaker1: "Good morning. Our lecture today will cover the Theory of Relativity, a cornerstone of modern physics."
  - Speaker2: "As defined by Einstein, it comprises two interrelated theories: special relativity and general relativity."
`;

async function toWav(pcmData: Buffer, channels = 1, rate = 24000, sampleWidth = 2): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    const bufs: any[] = [];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}

const generatePodcastFlow = ai.defineFlow(
  {
    name: 'generatePodcastFlow',
    inputSchema: GeneratePodcastInputSchema,
    outputSchema: GeneratePodcastOutputSchema,
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

    const dialoguePrompt = ai.definePrompt({
      name: 'generatePodcastScriptPrompt',
      output: { schema: z.object({ script: z.string() }) },
      prompt: `You are a scriptwriter for a podcast. Your task is to convert the following notes into a conversational dialogue script between two characters: Speaker1 and Speaker2.
The script should be engaging and reflect the specified style.
The output MUST be a script where each line is prefixed with "Speaker1:" or "Speaker2:".

**Style Instructions**:
${styleInstructions}

**Notes to convert**:
${input.notes}
`,
    });

    const { output } = await dialoguePrompt({});
    if (!output?.script) {
        throw new Error('Failed to generate a script.');
    }
    
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.5-flash-preview-tts',
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          multiSpeakerVoiceConfig: {
            speakerVoiceConfigs: [
              {
                speaker: 'Speaker1',
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: 'Algenib' },
                },
              },
              {
                speaker: 'Speaker2',
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: 'Achernar' },
                },
              },
            ],
          },
        },
      },
      prompt: output.script,
    });
    
    if (!media) {
      throw new Error('No audio could be generated for the script.');
    }

    const audioBuffer = Buffer.from(media.url.substring(media.url.indexOf(',') + 1), 'base64');
    const wavBase64 = await toWav(audioBuffer);

    return {
      podcastWavDataUri: `data:audio/wav;base64,${wavBase64}`,
    };
  }
);
