
'use server';

import { ai } from '@/ai/genkit';
import { app } from '@/lib/firebase';
import { getFirestore, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { z } from 'zod';

const LookupUserInputSchema = z.object({
  username: z.string(),
});

const LookupUserOutputSchema = z.object({
  email: z.string().email().nullable(),
});

export const lookupUserByUsernameFlow = ai.defineFlow(
    {
        name: 'lookupUserByUsernameFlow',
        inputSchema: LookupUserInputSchema,
        outputSchema: LookupUserOutputSchema,
    },
    async ({ username }) => {
        const db = getFirestore(app);
        const usernameLower = username.toLowerCase();
        
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('usernameLower', '==', usernameLower), limit(1));

        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return { email: null };
        }
        
        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();
        
        return { email: userData.email || null };
    }
);
