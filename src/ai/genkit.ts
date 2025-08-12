// Temporarily disabled due to OpenTelemetry module issues
/*
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.0-flash',
});
*/

// Temporary placeholder
export const ai = {
  definePrompt: () => ({}),
  defineFlow: () => ({}),
};
