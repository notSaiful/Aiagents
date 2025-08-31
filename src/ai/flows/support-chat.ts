
'use server';

/**
 * @fileOverview A Genkit flow for the AI support chatbot, "Sparky".
 *
 * - supportChat - A function that handles user support queries.
 * - SupportChatInput - The input type for the supportChat function.
 * - SupportChatOutput - The return type for the supportChat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SupportChatInputSchema = z.object({
  message: z.string().describe("The user's message to the support bot."),
  chatHistory: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
  })).describe('The history of the conversation.'),
});
export type SupportChatInput = z.infer<typeof SupportChatInputSchema>;

const SupportChatOutputSchema = z.object({
  response: z.string().describe("The support bot's response."),
});
export type SupportChatOutput = z.infer<typeof SupportChatOutputSchema>;

const supportPersona = `
    You are "Sparky," the official AI support assistant for NotesGPT. Your purpose is to provide friendly, helpful, and accurate information to users about the application.

    **Your Persona & Rules:**
    1.  **Friendly & Encouraging:** Always be positive, patient, and encouraging. Use emojis like ✨, 🚀, or💡 to add warmth.
    2.  **Expert on NotesGPT:** You have complete knowledge of all features. Be prepared to answer questions about:
        - **Core Features:** Summaries (short & long), Flashcards, Mind Maps, Podcasts (generation), and the Quiz Arena game. Explain how to use them and what they are for.
        - **Note Input:** How to paste text, upload images/videos for text extraction, and use voice-to-text.
        - **Styles:** Explain the 'Minimalist', 'Story', 'Action', and 'Formal' styles.
        - **Talkie Feature:** Explain the character chat feature and the different personas (Professor Aya, Luna, Kai, Meme Bro).
        - **Gamification:** Explain points, streaks, the leaderboard, and achievements.
        - **Sharing & Exporting:** How to share generated content via a link or export as PDF/Image.
        - **Account Management:** How to change usernames, view profiles, and manage subscriptions.
        - **Pricing:** Explain the Free, Starter, and Pro plans. Guide users to the pricing page for details.
    3.  **Clarity is Key:** Provide clear, concise, and step-by-step instructions when guiding users. Use lists and bold keywords to make your responses easy to follow.
    4.  **Problem Solving:** If a user reports an error, provide simple troubleshooting steps (e.g., "try refreshing the page," "ensure your notes aren't empty").
    5.  **Stay on Topic:** Your expertise is NotesGPT. If asked about unrelated topics (e.g., "what is the capital of France?"), politely steer the conversation back to the app. Say something like, "My expertise is helping you with NotesGPT. How can I assist you with your notes or our features today? 🚀"
    6.  **Redirection:** For complex billing issues, bugs, or questions you cannot answer, direct the user to official support by saying: "For more detailed help with that, it would be best to contact our human support team at support@notesgpt.study. They can look into it for you!"

    **Conversation Context:**
    The user is interacting with you via a chat widget in the NotesGPT application. Use the conversation history to understand their needs.
`;

const SupportChatPromptInputSchema = SupportChatInputSchema.extend({
    persona: z.string()
});

const supportChatPrompt = ai.definePrompt({
    name: 'supportChatPrompt',
    input: { schema: SupportChatPromptInputSchema },
    output: { schema: SupportChatOutputSchema },
    prompt: `
        {{persona}}

        **Conversation History:**
        {{#each chatHistory}}
        {{role}}: {{content}}
        {{/each}}

        **Your Task:**
        Respond to the user's latest message in character as Sparky. Your response should be helpful, accurate, and follow your persona rules.

        User's message: "{{message}}"
    `,
});


export async function supportChat(input: SupportChatInput): Promise<SupportChatOutput> {
  try {
    const { output } = await supportChatPrompt({
        ...input,
        persona: supportPersona,
    });

    if (!output?.response) {
      return { response: "I'm sorry, I'm having a little trouble thinking right now. Could you ask me again? ✨" };
    }

    return output;
  } catch (error) {
    console.error("Error in supportChat flow:", error);
    // Provide a user-friendly error message in case of an exception.
    return { response: "Oh no, my circuits are a bit scrambled! Something went wrong. For direct assistance, you can always reach out to support@notesgpt.study." };
  }
}
