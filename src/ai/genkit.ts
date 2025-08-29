
import {genkit, configureGenkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

configureGenkit({
  plugins: [googleAI()],
});

export const ai = genkit({
  model: 'googleai/gemini-1.5-pro',
});
