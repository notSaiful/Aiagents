
'use client';

import { useEffect, useState, useTransition, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { getUserProfile, GetUserProfileOutput } from '@/ai/flows/get-user-profile';
import { LoaderCircle, Award, Pencil, Check, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from '@/hooks/use-debounce';
import { checkUsernameAction } from '@/actions/check-username';
import { updateUsernameAction } from '@/actions/update-username';
import { cn } from '@/lib/utils';
import Link from 'next/link';


type ProfileData = GetUserProfileOutput['profile'];


export default function UserProfile() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [username, setUsername] = useState('');
  const [originalUsername, setOriginalUsername] = useState('');
  
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
  const [usernameMessage, setUsernameMessage] = useState('');

  const debouncedUsername = useDebounce(username, 500);

  const validateUsername = (name: string) => {
    if (name.length === 0) return { isValid: false, message: '' };
    if (!/^[A-Za-z0-9_]{3,20}$/.test(name)) {
      return { isValid: false, message: 'Must be 3-20 chars (letters, numbers, _).' };
    }
    return { isValid: true, message: '' };
  };

  const checkUsername = useCallback(async (name: string) => {
    if (name.toLowerCase() === originalUsername.toLowerCase()) {
        setUsernameStatus('idle');
        setUsernameMessage('');
        return;
    }
    
    const { isValid, message } = validateUsername(name);
    if (!isValid) {
        setUsernameStatus('invalid');
        setUsernameMessage(message);
        return;
    }

    setUsernameStatus('checking');
    try {
        const res = await checkUsernameAction(name);
        if (res.available) {
            setUsernameStatus('available');
            setUsernameMessage('✅ Available');
        } else {
            setUsernameStatus('taken');
            setUsernameMessage('❌ Username is taken');
        }
    } catch (e) {
        setUsernameStatus('idle');
    }
  }, [originalUsername]);


  useEffect(() => {
    if (debouncedUsername && isEditing) {
      checkUsername(debouncedUsername);
    }
  }, [debouncedUsername, isEditing, checkUsername]);


  useEffect(() => {
    async function fetchProfile(uid: string) {
      setLoading(true);
      try {
        const { profile: fetchedProfile } = await getUserProfile({ userId: uid });
        if (fetchedProfile) {
          setProfile(fetchedProfile);
          const currentUsername = fetchedProfile.username || fetchedProfile.displayName || '';
          setUsername(currentUsername);
          setOriginalUsername(currentUsername);
        } else {
           setProfile(null);
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        toast({
          title: 'Error',
          description: 'Could not load your profile data.',
          variant: 'destructive',
        });
        setProfile(null);
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) {
      if (user) {
        fetchProfile(user.uid);
      } else {
        router.push('/login');
      }
    }
  }, [user, authLoading, router, toast]);

  const handleEditToggle = () => {
    if (isEditing) {
        setUsername(originalUsername);
        setUsernameStatus('idle');
        setUsernameMessage('');
    }
    setIsEditing(!isEditing);
  };

  const handleSaveUsername = () => {
    if (!user || usernameStatus !== 'available') return;
    
    startTransition(async () => {
      const { ok, message, username: newUsername } = await updateUsernameAction(user.uid, username);
      if (ok) {
        toast({ title: 'Success', description: message });
        setIsEditing(false);
        if(newUsername) {
          setOriginalUsername(newUsername);
          setProfile(p => p ? { ...p, username: newUsername, displayName: newUsername } : null);
        }
        setUsernameStatus('idle');
      } else {
        toast({ title: 'Error', description: message, variant: 'destructive' });
      }
    });
  }

  const getStatusColor = () => {
    switch (usernameStatus) {
        case 'available': return 'text-green-600';
        case 'taken':
        case 'invalid': return 'text-red-600';
        default: return 'text-muted-foreground';
    }
  }


  if (authLoading || loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!profile) {
    return (
        <div className="container mx-auto max-w-4xl py-12 px-4 text-center">
            <h1 className="text-2xl font-bold">Could not load profile.</h1>
            <p className="text-muted-foreground">Please try logging in again.</p>
            <Button asChild className="mt-4"><Link href="/login">Go to Login</Link></Button>
        </div>
    );
  }
  
  const isSaveDisabled = isPending || usernameStatus !== 'available';

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4 space-y-8">
      <Card className="w-full">
        <CardHeader className="items-center text-center relative">
          <div className="absolute top-4 right-4 flex gap-2">
            {isEditing && (
              <Button onClick={handleSaveUsername} size="icon" disabled={isSaveDisabled}>
                {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              </Button>
            )}
             <Button variant="outline" size="icon" onClick={handleEditToggle}>
                {isEditing ? <X className="h-4 w-4" /> : <Pencil className="w-4 h-4" />}
              </Button>
          </div>

          <Avatar className="w-24 h-24 mb-4 border-4 border-primary">
            <AvatarImage src={profile.photoURL} alt={profile.displayName} />
            <AvatarFallback className="text-4xl">
              {profile.displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          {isEditing ? (
            <div className="w-full max-w-xs">
              <Input 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="text-2xl font-bold text-center h-10"
                disabled={isPending}
              />
              <p className={cn("text-sm mt-1 h-5 flex items-center justify-center gap-1.5", getStatusColor())}>
                {usernameStatus === 'checking' && <LoaderCircle className="h-3 w-3 animate-spin" />}
                {usernameStatus === 'checking' ? 'Checking...' : usernameMessage}
              </p>
            </div>
          ) : (
             <>
              <CardTitle className="text-3xl font-bold">{profile.username || profile.displayName}</CardTitle>
              <CardDescription>{profile.email}</CardDescription>
             </>
          )}

        </CardHeader>
        <CardContent>
          
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
                 <p className="text-2xl font-bold">{profile.points}</p>
                 <p className="text-sm text-muted-foreground">Points</p>
            </div>
             <div>
                 <p className="text-2xl font-bold">{profile.streak} 🔥</p>
                 <p className="text-sm text-muted-foreground">Day Streak</p>
            </div>
          </div>
          
          <Separator className="my-6" />

          <div>
            <h3 className="text-lg font-semibold mb-4 text-center">Achievements</h3>
            {profile.achievements.length > 0 ? (
              <div className="flex flex-wrap justify-center gap-4">
                <TooltipProvider>
                  {profile.achievements.map((ach) => (
                    <Tooltip key={ach.id}>
                      <TooltipTrigger asChild>
                        <div className="p-2 rounded-full bg-primary/20 transition-transform hover:scale-110">
                          <Award className="w-8 h-8 text-primary" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="font-bold">{ach.name}</p>
                        <p>{ach.description}</p>
                        <p className="text-xs text-muted-foreground">Unlocked: {new Date(ach.dateUnlocked).toLocaleDateString()}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </TooltipProvider>
              </div>
            ) : (
              <p className="text-muted-foreground text-center text-sm">No achievements unlocked yet. Keep going!</p>
            )}
          </div>
        </CardContent>
      </Card>
      
    </div>
  );
}
