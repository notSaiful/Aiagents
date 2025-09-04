'use server';

import { getYoutubeNotesV2 } from "@/ai/flows/get-youtube-notes";

/**
 * A server action to safely call the getYoutubeNotesV2 Genkit flow.
 */
export async function getYoutubeNotesAction(params: { url: string; language?: string }) {
  try {
    // Directly call the Genkit flow. Since this is a server action,
    // it runs in the trusted server environment.
    const result = await getYoutubeNotesV2(params);
    return result;
  } catch (error: any) {
    console.error("Error in getYoutubeNotesAction:", error);
    // Return a structured error that the client can safely handle.
    return {
      error: 'SERVER_ERROR',
      message: 'An unexpected error occurred on the server. Please try again later.',
    };
  }
}
