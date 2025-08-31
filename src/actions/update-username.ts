
'use server';

import { getAuth } from 'firebase-admin/auth';
import { changeUsernameFlow } from "@/ai/flows/change-username";
import { adminApp } from '@/lib/firebase-admin';

export async function updateUsernameAction(uid: string, desired: string) {
  try {
    const result = await changeUsernameFlow({ uid, desiredUsername: desired });
    
    // Check if the admin app was initialized before trying to use it
    if (adminApp) {
        // Use Firebase Admin SDK to update the Auth user
        const auth = getAuth(adminApp);
        await auth.updateUser(uid, {
            displayName: result.username,
        });
    } else {
        // This will happen in local dev if credentials are not set up.
        // It's not a critical failure, so we can warn and continue.
        console.warn("Firebase Admin not available. Skipping Auth display name update.");
    }
    
    return { ok: true, message: result.unchanged ? "No changes" : "Username updated", username: result.username };
  } catch (e: any) {
    return { ok: false, message: e?.message ?? "Failed to update username" };
  }
}
