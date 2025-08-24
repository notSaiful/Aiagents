
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { auth, db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import AuthForm from '@/components/auth-form';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

type FormData = z.infer<typeof formSchema>;

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const handleFormSubmit = async ({ email, password }: FormData) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      const displayName = email.split('@')[0];
      
      await Promise.all([
        updateProfile(user, { displayName }),
        setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          displayName,
          createdAt: serverTimestamp(),
          settings: {
            preferredStyle: 'Minimalist',
          },
        })
      ]);

      toast({
        title: 'Account Created!',
        description: "Welcome! We've created your account and signed you in.",
      });
      router.push('/');
    } catch (error: any) {
      let errorMessage = 'An unexpected error occurred. Please try again.';
      if (error.code === 'auth/email-already-in-use') {
          errorMessage = 'This email is already in use. Please sign in instead.';
      }
      toast({
          title: 'Sign Up Failed',
          description: errorMessage,
          variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return <AuthForm mode="signup" />;
}
