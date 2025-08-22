
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, LoaderCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { auth, db } from '@/lib/firebase';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

type FormData = z.infer<typeof formSchema>;

export default function EmailLoginPage() {
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
      // Try to sign in first
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/');
    } catch (signInError: any) {
      if (signInError.code === 'auth/user-not-found' || signInError.code === 'auth/invalid-credential') {
        // If user not found, try to create a new account
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const user = userCredential.user;
          
          const displayName = email.split('@')[0];
          await updateProfile(user, { displayName });

          // Add user to Firestore
          await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            email: user.email,
            displayName,
            createdAt: serverTimestamp(),
          });

          toast({
            title: 'Account Created!',
            description: "Welcome! We've created your account and signed you in.",
          });
          router.push('/');
        } catch (signUpError: any) {
          toast({
            title: 'Sign-up Failed',
            description: signUpError.message || 'Could not create an account. Please try again.',
            variant: 'destructive',
          });
        }
      } else {
        toast({
          title: 'Sign-in Failed',
          description: signInError.message || 'An unexpected error occurred. Please try again.',
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
       <Button asChild variant="ghost" className="absolute top-4 left-4">
        <Link href="/login">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
        </Link>
      </Button>
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Email Sign In</h1>
          <p className="text-muted-foreground">Enter your email and password to continue. If you don't have an account, we'll create one for you.</p>
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
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              'Continue'
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
