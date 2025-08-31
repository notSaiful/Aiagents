
'use server';

import { ai } from '@/ai/genkit';
import { app } from '@/lib/firebase';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { z } from 'zod';

const CheckUsernameInputSchema = z.object({
  username: z.string(),
});

const CheckUsernameOutputSchema = z.object({
  available: z.boolean(),
});

export const checkUsernameFlow = ai.defineFlow(
    {
        name: 'checkUsernameFlow',
        inputSchema: CheckUsernameInputSchema,
        outputSchema: CheckUsernameOutputSchema,
    },
    async ({ username }) => {
        const db = getFirestore(app);
        const usernameLower = username.toLowerCase();
        
        if (!/^[A-Za-z0-9_]{3,20}$/.test(username)) {
            return { available: false };
        }

        const reservationRef = doc(db, 'usernames', usernameLower);
        const resSnap = await getDoc(reservationRef);
        
        return { available: !resSnap.exists() };
    }
);

    