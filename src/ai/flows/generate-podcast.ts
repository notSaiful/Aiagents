
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
- **Voice Type**: Smooth, neutral, concise, friendly.
- **Inspiration**: Minimalist narrators, tech explainer voices, ASMR-like clarity.
- **Dialogue Flavor**: Use short, digestible sentences and simplified explanations.
- **Effect**: Focused learning, reduces cognitive load, very easy to digest.
- **Characters**: Two speakers, "Speaker1" (neutral, smooth, male voice - Algenib) and "Speaker2" (clear, informative, female voice - Achernar).
`;

const storyStyleInstructions = `
- **Voice Type**: Soft, emotional, expressive.
- **Inspiration**: Popular K-drama actors, romantic couples, slightly dramatic tones.
- **Dialogue Flavor**: Use storytelling, cliffhangers, and emotional phrasing.
- **Effect**: Makes learning feel like watching a story unfold, easy to remember.
- **Characters**: Two speakers, "Speaker1" (dramatic, expressive male voice - Algenib) and "Speaker2" (emotional, narrative female voice - Achernar).
`;

const actionStyleInstructions = `
- **Voice Type**: Bold, energetic, heroic.
- **Inspiration**: Avengers, Batman, Superman, fast-paced characters.
- **Dialogue Flavor**: Punchy, dramatic, with excitement and urgency.
- **Effect**: Turns notes into an adrenaline-fueled learning experience, keeps students alert.
- **Characters**: Two speakers, "Speaker1" (deep, heroic male voice - Algenib) and "Speaker2" (energetic, fast-paced female voice - Achernar).
`;

const formalStyleInstructions = `
- **Voice Type**: Calm, clear, professional, slightly authoritative.
- **Inspiration**: Professors, news anchors, motivational speakers.
- **Dialogue Flavor**: Straightforward, explanatory, minimal fluff.
- **Effect**: Perfect for serious learning and comprehension, no distraction.
- **Characters**: Two speakers, "Speaker1" (calm, authoritative male voice - Algenib) and "Speaker2" (clear, professional female voice - Achernar).
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
    
    let script = '';
    try {
      const { output } = await dialoguePrompt({});
      if (!output?.script) {
          throw new Error('AI failed to return a script.');
      }
      script = output.script;
    } catch (error) {
        console.error('Error generating script:', error);
        throw new Error('Failed to generate a script. The AI may have refused the request due to safety filters.');
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
      prompt: script,
    });
    
    if (!media) {
        throw new Error('No audio could be generated for the script. This may be due to an API error or an empty script.');
    }

    const audioBuffer = Buffer.from(media.url.substring(media.url.indexOf(',') + 1), 'base64');
    const wavBase64 = await toWav(audioBuffer);

    return {
      podcastWavDataUri: `data:audio/wav;base64,${wavBase64}`,
    };
  }
);
