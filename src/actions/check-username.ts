
'use server';

import { checkUsernameFlow } from "@/ai/flows/check-username";

export async function checkUsernameAction(username: string) {
  try {
    const result = await checkUsernameFlow({ username });
    return { available: result.available };
  } catch (e) {
    return { available: false };
  }
}

    