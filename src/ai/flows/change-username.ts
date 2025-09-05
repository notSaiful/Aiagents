
'use server';

import { ai } from '@/ai/genkit';
import { app } from '@/lib/firebase';
import { getFirestore, doc, runTransaction, serverTimestamp, DocumentSnapshot } from 'firebase/firestore';
import { z } from 'zod';
import { adminAuth } from '@/lib/firebase-admin';

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
        const newUsernameRef = doc(db, "usernames", usernameLower);

        return await runTransaction(db, async (tx) => {
            // --- All READ operations must come before all WRITE operations ---

            // Read 1: Get the current user's profile
            const userSnap = await tx.get(userRef);
            if (!userSnap.exists()) {
                throw new Error("User profile not found.");
            }

            const currentUserData = userSnap.data() as any;
            const currentUsernameLower: string | undefined = currentUserData.usernameLower;

            // If the username hasn't changed, we can exit early.
            if (currentUsernameLower === usernameLower) {
                return { username, usernameLower, unchanged: true };
            }

            // Read 2: Check if the desired new username is already taken
            const newUsernameSnap = await tx.get(newUsernameRef);
            
            // Read 3 (optional): Get the old username document if it exists, so we can delete it later
            let oldUsernameRef: any = null;
            if (currentUsernameLower && currentUsernameLower !== usernameLower) {
                oldUsernameRef = doc(db, "usernames", currentUsernameLower);
            }
            const oldUsernameSnap = oldUsernameRef ? await tx.get(oldUsernameRef) : null;
            

            // --- All WRITE operations must come after this point ---

            // Logic check: Is the new username taken by someone else?
            if (newUsernameSnap.exists() && (newUsernameSnap.data() as any).uid !== uid) {
                throw new Error("That username is taken. Try another.");
            }
            
            // Write 1: Reserve the new username if it's not already reserved by this user.
            if (!newUsernameSnap.exists()) {
                tx.set(newUsernameRef, { uid, createdAt: serverTimestamp() });
            }
            
            // Write 2: Delete the old username reservation if it exists and belongs to the current user.
            if (oldUsernameSnap && oldUsernameSnap.exists() && (oldUsernameSnap.data() as any).uid === uid) {
                tx.delete(oldUsernameSnap.ref);
            }

            // Write 3: Update the user's profile with the new username.
            tx.set(userRef, {
                username,
                usernameLower,
                displayName: username,
                updatedAt: serverTimestamp(),
            }, { merge: true });

            return { username, usernameLower, unchanged: false };
        });
    }
);
