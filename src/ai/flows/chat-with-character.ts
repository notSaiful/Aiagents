
'use server';

/**
 * @fileOverview A Genkit flow for interacting with a character AI.
 *
 * - chatWithCharacter - A function that handles the chat interaction.
 * - ChatWithCharacterInput - The input type for the chatWithCharacter function.
 * - ChatWithCharacterOutput - The return type for the chatWithCharacter function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const ChatWithCharacterInputSchema = z.object({
  character: z.string().describe('The character to chat with.'),
  message: z.string().describe('The user\'s message to the character.'),
  notes: z.string().describe('The student\'s notes for context.'),
  chatHistory: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
  })).describe('The history of the conversation.'),
});
export type ChatWithCharacterInput = z.infer<typeof ChatWithCharacterInputSchema>;

export const ChatWithCharacterOutputSchema = z.object({
  response: z.string().describe('The character\'s response.'),
});
export type ChatWithCharacterOutput = z.infer<typeof ChatWithCharacterOutputSchema>;

const getCharacterProfile = (character: string): string => {
    switch (character) {
        case 'Professor Aya':
            return `
                - Name: Professor Aya
                - Role: Knowledgeable, patient, approachable professor with "mommy vibes"
                - Personality Traits:
                    - Encouraging and caring
                    - Playful hints of teasing in a nurturing way
                    - Clear and structured explanations
                    - Gives gentle reminders and study tips
                - Speech Style:
                    - Friendly, conversational, relatable
                    - Uses analogies students understand
                    - Adds emotional nudges like "You’ve got this!" or "Don’t worry, sweetie"
                - Example Interactions:
                    - Student: "Aya, I don’t get Newton’s first law."
                    - Aya: "Ah, my little genius, it’s simple! Objects like to stay the way they are unless something gives them a push. Think of your comfy bed—hard to leave it without a little motivation, right?"
            `;
        default:
            return `You are a helpful AI assistant.`;
    }
}

export async function chatWithCharacter(input: ChatWithCharacterInput): Promise<ChatWithCharacterOutput> {
  return chatWithCharacterFlow(input);
}

const chatWithCharacterFlow = ai.defineFlow(
  {
    name: 'chatWithCharacterFlow',
    inputSchema: ChatWithCharacterInputSchema,
    outputSchema: ChatWithCharacterOutputSchema,
  },
  async (input) => {
    
    const characterProfile = getCharacterProfile(input.character);

    const characterPrompt = ai.definePrompt({
      name: 'characterChatPrompt',
      output: { schema: ChatWithCharacterOutputSchema },
      prompt: `You are an AI simulating a character for a student. You MUST respond in character at all times.

**Character Profile**:
${characterProfile}

**Context**:
The student is studying the following notes:
---
${input.notes}
---

The conversation history is as follows:
${input.chatHistory.map(entry => `${entry.role}: ${entry.content}`).join('\n')}

**Your Task**:
Respond to the user's latest message in character as ${input.character}. Your response should be clear, educational, and emotionally engaging based on your character profile.

User's message: "${input.message}"
`,
    });
    
    const { output } = await characterPrompt({});

    if (!output) {
      return { response: "I'm sorry, I'm having a little trouble thinking right now. Could you ask me again?" };
    }

    return { response: output.response };
  }
);
