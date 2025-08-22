'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import NextLink from 'next/link';
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { LoaderCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { auth, db } from '@/lib/firebase';
import { cn } from '@/lib/utils';

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
      
      // Run user profile update and Firestore document creation in parallel
      await Promise.all([
        updateProfile(user, { displayName }),
        setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          displayName,
          createdAt: serverTimestamp(),
        })
      ]);

      toast({
        title: 'Account Created!',
        description: "Welcome! We've created your account and signed you in.",
      });
      router.push('/');
    } catch (error: any) { {
        let errorMessage = 'An unexpected error occurred. Please try again.';
        if (error.code === 'auth/email-already-in-use') {
            errorMessage = 'This email is already in use. Please sign in instead.';
        }
        toast({
            title: 'Sign Up Failed',
            description: errorMessage,
            variant: 'destructive',
        });
    }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Create an Account</h1>
          <p className="text-muted-foreground">Get started with NotesGPT.</p>
        </div>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              {...register('email')}
              className={cn(errors.email && 'border-destructive')}
              disabled={loading}
              autoComplete="email"
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register('password')}
              className={cn(errors.password && 'border-destructive')}
              disabled={loading}
              autoComplete="new-password"
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              'Sign Up'
            )}
          </Button>
        </form>
        <div className="mt-6 text-center text-sm">
            <p className="text-muted-foreground">
                Already have an account?{' '}
                <NextLink href="/login" className="font-medium text-primary-foreground hover:underline">
                    Sign in
                </NextLink>
            </p>
        </div>
      </div>
    </div>
  );
}
