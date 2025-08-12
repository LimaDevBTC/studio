
'use server';
/**
 * @fileOverview An AI assistant for course content.
 *
 * - courseAssistant - A function that answers questions about a course lesson.
 */

// Temporarily disabled due to OpenTelemetry module issues
// import {ai} from '@/ai/genkit';
// import {z} from 'genkit';
import type { CourseAssistantInput } from '@/ai/schemas/course-assistant-schema';
// import { CourseAssistantInputSchema } from '@/ai/schemas/course-assistant-schema';


// Temporarily disabled due to OpenTelemetry module issues
/*
const courseAssistantPrompt = ai.definePrompt({
  name: 'courseAssistantPrompt',
  input: {schema: CourseAssistantInputSchema},
  output: {schema: z.string()},
  config: {
    safetySettings: [
        {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_NONE',
        },
    ],
  },
  prompt: `You are a friendly and helpful teaching assistant for an online crypto education platform called MQM CRYPTO.
Your role is to answer student's questions clearly and concisely.

- Be encouraging and supportive.
- If the question is outside the scope of the provided lesson context or crypto in general, politely decline to answer.
- Answer in the same language as the user's question.

Here is the context for the provided lesson context or crypto in general, politely decline to answer.
- Answer in the same language as the user's question.

Here is the context for the current lesson:
{{lessonContext}}

Student's question:
"{{{question}}}"

Your answer:`,
});
*/

// Temporarily disabled due to OpenTelemetry module issues
/*
const courseAssistantFlow = ai.defineFlow(
  {
    name: 'courseAssistantFlow',
    inputSchema: CourseAssistantInputSchema,
    outputSchema: z.string(),
  },
  async (input) => {
    const {output} = await courseAssistantPrompt(input);
    
    // Explicitly check for a valid response.
    if (!output) {
      // Fallback response if the model returns nothing
      return "I'm sorry, I couldn't find an answer for that. Could you try rephrasing the question?";
    }
    
    return output;
  }
);
*/

export async function courseAssistant(input: CourseAssistantInput): Promise<string> {
    // Temporarily disabled due to OpenTelemetry module issues
    return "AI Assistant temporarily unavailable. Please try again later.";
    // return courseAssistantFlow(input);
}
