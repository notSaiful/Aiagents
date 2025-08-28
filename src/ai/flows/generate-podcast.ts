
'use server';

/**
 * @fileOverview A Genkit flow for creating a podcast from user notes.
 *
 * - generatePodcast - A function that handles the podcast creation process.
 * - GeneratePodcastInput - The input type for the generatePodcast function.
 * - GeneratePodcastOutput - The return type for the generatePodcast function.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/googleai';
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
- **Vibe**: Smooth, neutral, concise, friendly. Inspired by minimalist narrators, tech explainers, and ASMR-like clarity.
- **Dialogue Flavor**: Use short, digestible sentences, simplified explanations, and a calm, friendly tone. Include pauses for thought.
- **Content Focus**: Prioritize clarity and focused learning, reducing cognitive load. The conversation should be very easy to digest.
- **Characters**: Two speakers, "Speaker1" (neutral, smooth, male voice - Algenib) and "Speaker2" (clear, informative, female voice - Achernar).
`;

const storyStyleInstructions = `
- **Vibe**: Soft, emotional, expressive. Inspired by popular K-drama actors, romantic couples, and slightly dramatic tones.
- **Dialogue Flavor**: Use storytelling techniques, cliffhangers, and emotional phrasing. Weave in famous quotes from movies or pop culture where they fit naturally (e.g., "As they say, with great power comes great responsibility...").
- **Content Focus**: Make learning feel like watching a story unfold, making it highly memorable.
- **Characters**: Two speakers, "Speaker1" (dramatic, expressive male voice - Algenib) and "Speaker2" (emotional, narrative female voice - Achernar).
`;

const actionStyleInstructions = `
- **Vibe**: Bold, energetic, heroic. Inspired by Avengers, Batman, Superman, and fast-paced movie characters.
- **Dialogue Flavor**: Use punchy, dramatic dialogue with a sense of excitement and urgency. Incorporate heroic slogans or famous one-liners from action movies (e.g., "Time to go to work," or "I can do this all day.").
- **Content Focus**: Turn notes into an adrenaline-fueled learning experience that keeps students alert and engaged.
- **Characters**: Two speakers, "Speaker1" (deep, heroic male voice - Algenib) and "Speaker2" (energetic, fast-paced female voice - Achernar).
`;

const formalStyleInstructions = `
- **Vibe**: Calm, clear, professional, and slightly authoritative. Inspired by professors, news anchors, and motivational speakers.
- **Dialogue Flavor**: Keep it straightforward, explanatory, and with minimal fluff. Use authoritative statements or well-known academic proverbs to reinforce points.
- **Content Focus**: Perfect for serious learning and comprehension, with no distractions.
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
The script should be engaging, realistic, and strictly adhere to the specified style. It should include realistic conversational elements like pauses or tone shifts.
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
      model: googleAI.model('gemini-2.5-flash-preview-tts'),
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
