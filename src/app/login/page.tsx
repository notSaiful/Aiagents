
'use client';

import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Chrome, Mail } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Add user to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        createdAt: serverTimestamp(),
      }, { merge: true });

      router.push('/');
    } catch (error: any) {
      // Don't show an error toast if the user simply closes the popup.
      if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
        return;
      }
      console.error('Error signing in with Google', error);
      toast({
        title: 'Sign-in Failed',
        description: 'Could not sign in with Google. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mx-auto w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Welcome Back</h1>
          <p className="text-muted-foreground">Choose how you'd like to sign in.</p>
        </div>
        <div className="flex flex-col space-y-4">
          <Button
            onClick={handleGoogleSignIn}
            variant="outline"
            className="w-full py-6 text-base"
          >
            <Chrome className="mr-2 h-5 w-5" />
            Sign Up with Google
          </Button>
          <Button
            onClick={() => router.push('/login/email')}
            variant="outline"
            className="w-full py-6 text-base"
          >
            <Mail className="mr-2 h-5 w-5" />
            Continue with Email
          </Button>
        </div>
      </div>
    </div>
  );
}
