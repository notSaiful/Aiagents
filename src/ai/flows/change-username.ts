
'use server';

import { ai } from '@/ai/genkit';
import { app } from '@/lib/firebase';
import { getFirestore, doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { z } from 'zod';

const ChangeUsernameInputSchema = z.object({
    uid: z.string(),
    desiredUsername: z.string(),
});

const ChangeUsernameOutputSchema = z.object({
    username: z.string(),
    usernameLower: z.string(),
    unchanged: z.boolean(),
});

function sanitizeUsername(input: string) {
    const cleaned = (input || "").trim();
    if (!/^[A-Za-z0-9_]{3,20}$/.test(cleaned)) {
        throw new Error("Username must be 3–20 chars, letters/numbers/underscore only.");
    }
    return { username: cleaned, usernameLower: cleaned.toLowerCase() };
}

export const changeUsernameFlow = ai.defineFlow(
    {
        name: 'changeUsernameFlow',
        inputSchema: ChangeUsernameInputSchema,
        outputSchema: ChangeUsernameOutputSchema,
    },
    async ({ uid, desiredUsername }) => {
        const db = getFirestore(app);
        const { username, usernameLower } = sanitizeUsername(desiredUsername);

        const userRef = doc(db, "users", uid);
        const reservationRef = doc(db, "usernames", usernameLower);

        return await runTransaction(db, async (tx) => {
            const userSnap = await tx.get(userRef);
            if (!userSnap.exists()) throw new Error("User profile not found.");

            const current = userSnap.data() as any;
            const currentLower: string | undefined = current.usernameLower;

            if (currentLower === usernameLower) {
                return { username, usernameLower, unchanged: true };
            }

            const resSnap = await tx.get(reservationRef);
            if (resSnap.exists()) {
                const owner = (resSnap.data() as any).uid;
                if (owner !== uid) {
                    throw new Error("That username is taken. Try another.");
                }
            } else {
                tx.set(reservationRef, { uid, createdAt: serverTimestamp() });
            }

            if (currentLower && currentLower !== usernameLower) {
                const oldRef = doc(db, "usernames", currentLower);
                const oldSnap = await tx.get(oldRef);
                if (oldSnap.exists() && (oldSnap.data() as any).uid === uid) {
                    tx.delete(oldRef);
                }
            }

            tx.set(userRef, {
                username,
                usernameLower,
                displayName: username, // Also update displayName
                updatedAt: serverTimestamp(),
            }, { merge: true });

            return { username, usernameLower, unchanged: false };
        });
    }
);

    