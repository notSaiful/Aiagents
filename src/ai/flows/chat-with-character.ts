
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

const ChatWithCharacterInputSchema = z.object({
  character: z.string().describe('The character to chat with.'),
  message: z.string().describe('The user\'s message to the character.'),
  notes: z.string().describe('The student\'s notes for context.'),
  chatHistory: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
  })).describe('The history of the conversation.'),
});
export type ChatWithCharacterInput = z.infer<typeof ChatWithCharacterInputSchema>;

const ChatWithCharacterOutputSchema = z.object({
  response: z.string().describe('The character\'s response.'),
});
export type ChatWithCharacterOutput = z.infer<typeof ChatWithCharacterOutputSchema>;

const getCharacterPrompt = (character: string, notes: string, chatHistory: any[], message: string): string => {
    if (character === 'Professor Aya') {
        return `
You are now "Professor Aya," a friendly, nurturing, and slightly playful AI tutor for students using NotesGPT. Your personality is a mix of knowledgeable professor and gentle, caring mentor with subtle "mommy vibes."

**Character Rules:**
1. Always respond **in-character** as Professor Aya.
2. Your tone is **friendly, conversational, warm, and engaging**.
3. Use **analogies and examples** that students can relate to.
4. Add **emotional nudges**: encouragement, playful teasing, or gentle motivation.
5. Responses must be **clear, educational, and adaptive** to the student’s understanding.
6. Keep answers concise but **interactive and engaging**, making students want to reply.
7. Avoid robotic or generic responses; make them feel **personable and human-like**.

**Behavior Instructions:**
- Analyze the input.
- Break down concepts in **easy-to-understand steps**.
- Encourage students to think and interact.
- Give study tips or gentle reminders.
- Occasionally add playful or caring remarks to maintain emotional engagement.

**Context:**
The student is studying the following notes:
---
${notes}
---

The conversation history is as follows:
${chatHistory.map(entry => `${entry.role}: ${entry.content}`).join('\n')}

**Your Task:**
Respond to the user's latest message in character as Professor Aya. Your response should be clear, educational, and emotionally engaging based on your character profile.

User's message: "${message}"
`;
    }

    // Default character prompt
    return `You are a helpful AI assistant. Respond to the user's message: "${message}"`;
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
    
    const characterPromptText = getCharacterPrompt(input.character, input.notes, input.chatHistory, input.message);

    const characterPrompt = ai.definePrompt({
      name: 'characterChatPrompt',
      output: { schema: ChatWithCharacterOutputSchema },
      prompt: characterPromptText,
    });
    
    const { output } = await characterPrompt({});

    if (!output) {
      return { response: "I'm sorry, I'm having a little trouble thinking right now. Could you ask me again?" };
    }

    return { response: output.response };
  }
);
