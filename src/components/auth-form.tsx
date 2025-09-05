
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import NextLink from 'next/link';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { LoaderCircle, Chrome } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { auth, db } from '@/lib/firebase';
import { cn } from '@/lib/utils';
import { lookupUserByUsernameFlow } from '@/ai/flows/lookup-user';
import { updateUsernameAction } from '@/actions/update-username';
import { checkUsernameAction } from '@/actions/check-username';


const loginSchema = z.object({
  emailOrUsername: z.string().min(1, { message: 'Please enter your email or username.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

const signupSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  username: z.string()
    .min(3, { message: 'Username must be at least 3 characters.'})
    .max(20, { message: 'Username must be at most 20 characters.'})
    .regex(/^[A-Za-z0-9_]+$/, { message: 'Username can only contain letters, numbers, and underscores.'}),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters.' }),
});

type LoginFormData = z.infer<typeof loginSchema>;
type SignupFormData = z.infer<typeof signupSchema>;


interface AuthFormProps {
  mode: 'login' | 'signup';
}

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(mode === 'login' ? loginSchema : signupSchema),
  });

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        const username = user.email?.split('@')[0] || `user_${Date.now()}`;
        
        // With Google Sign-In, we can attempt to set the username directly.
        // We'll rely on the transactional `updateUsernameAction` to ensure uniqueness.
        // If it fails (highly unlikely for Google-generated names), the user can change it later.
        await setDoc(userDocRef, {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || username,
            photoURL: user.photoURL,
            createdAt: serverTimestamp(),
            points: 0,
            streak: 0,
            lastActivityDate: null,
            achievements: [],
            stats: {
                summariesGenerated: 0, flashcardsCompleted: 0, mindmapsCreated: 0,
                podcastsListened: 0, gamesCompleted: 0,
            }
        });
        
        await updateUsernameAction(user.uid, username);
      }

      toast({
        title: 'Signed In!',
        description: 'Welcome back!',
      });
      router.push('/');
    } catch (error: any) {
      console.error(error);
      toast({
        title: 'Google Sign-In Failed',
        description: 'Could not sign in with Google. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleLoginSubmit = async ({ emailOrUsername, password }: LoginFormData) => {
    setLoading(true);
    let email = emailOrUsername;
    
    if (!emailOrUsername.includes('@')) {
      try {
        const result = await lookupUserByUsernameFlow({ username: emailOrUsername });
        if (result.email) {
          email = result.email;
        } else {
          throw new Error("User not found.");
        }
      } catch (e) {
        toast({ title: 'Sign In Failed', description: 'Invalid username or password.', variant: 'destructive' });
        setLoading(false);
        return;
      }
    }
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/');
    } catch (error: any) {
        toast({ title: 'Sign In Failed', description: 'Invalid email/username or password.', variant: 'destructive' });
    } finally {
        setLoading(false);
    }
  }

  const handleSignupSubmit = async ({ email, username, password }: SignupFormData) => {
    setLoading(true);
    try {
        const usernameCheck = await checkUsernameAction(username);
        if (!usernameCheck.available) {
            toast({
                title: 'Sign Up Failed',
                description: 'That username is already taken. Please choose another.',
                variant: 'destructive',
            });
            setLoading(false);
            return;
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        await updateProfile(user, { displayName: username });

        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, {
            uid: user.uid,
            email: user.email,
            displayName: username,
            username: username,
            usernameLower: username.toLowerCase(),
            photoURL: user.photoURL,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            points: 0,
            streak: 0,
            lastActivityDate: null,
            currentPlan: 'Free',
            achievements: [],
            stats: {
                summariesGenerated: 0, flashcardsCompleted: 0, mindmapsCreated: 0,
                podcastsListened: 0, gamesCompleted: 0,
            }
        });

        const { ok, message } = await updateUsernameAction(user.uid, username);
        if (!ok) {
            throw new Error(message);
        }

        toast({
            title: 'Account Created!',
            description: "Welcome! We've created your account and signed you in.",
        });
        router.push('/');

    } catch (error: any) {
        let errorMessage = 'An unexpected error occurred. Please try again.';
        if (error.code === 'auth/email-already-in-use') {
            errorMessage = 'This email is already in use. Please sign in instead.';
        } else if (error.message) {
            errorMessage = error.message;
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


  const isLoading = loading || googleLoading;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <motion.div 
        className="w-full max-w-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            {mode === 'login' ? 'Welcome Back' : 'Create an Account'}
          </h1>
          <p className="text-muted-foreground">
            {mode === 'login'
              ? 'Sign in to your account to continue.'
              : 'Get started with NotesGPT.'}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <Button
            variant="outline"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            {googleLoading ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Chrome className="mr-2 h-4 w-4" />
                Sign in with Google
              </>
            )}
          </Button>
        </div>

        <div className="my-4 flex items-center">
            <div className="flex-grow border-t border-muted" />
            <span className="mx-4 flex-shrink text-xs uppercase text-muted-foreground">Or continue with</span>
            <div className="flex-grow border-t border-muted" />
        </div>

        <form onSubmit={form.handleSubmit(mode === 'login' ? handleLoginSubmit : handleSignupSubmit)} className="space-y-6">
          {mode === 'login' ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="emailOrUsername">Email or Username</Label>
                <Input
                  id="emailOrUsername"
                  placeholder="you@example.com or your_username"
                  {...form.register('emailOrUsername')}
                  className={cn(form.formState.errors.emailOrUsername && 'border-destructive')}
                  disabled={isLoading}
                  autoComplete="username"
                />
                {form.formState.errors.emailOrUsername && (
                  <p className="text-sm text-destructive">{form.formState.errors.emailOrUsername.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...form.register('password')}
                  className={cn(form.formState.errors.password && 'border-destructive')}
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                {form.formState.errors.password && (
                  <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  {...form.register('email')}
                  className={cn(form.formState.errors.email && 'border-destructive')}
                  disabled={isLoading}
                  autoComplete="email"
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
                )}
              </div>
               <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="your_username"
                  {...form.register('username')}
                  className={cn(form.formState.errors.username && 'border-destructive')}
                  disabled={isLoading}
                  autoComplete="username"
                />
                {form.formState.errors.username && (
                  <p className="text-sm text-destructive">{form.formState.errors.username.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...form.register('password')}
                  className={cn(form.formState.errors.password && 'border-destructive')}
                  disabled={isLoading}
                  autoComplete="new-password"
                />
                {form.formState.errors.password && (
                  <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
                )}
              </div>
            </>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {loading ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : mode === 'login' ? (
              'Sign In'
            ) : (
              'Sign Up'
            )}
          </Button>
        </form>
        <div className="mt-6 text-center text-sm">
          <p className="text-muted-foreground">
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
            <NextLink
              href={mode === 'login' ? '/signup' : '/login'}
              className="font-medium text-primary-foreground hover:underline"
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </NextLink>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

    
