
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
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from '@/hooks/use-debounce';
import { checkUsernameAction } from '@/actions/check-username';
import { updateUsernameAction } from '@/actions/update-username';
import { cn } from '@/lib/utils';


type ProfileData = GetUserProfileOutput['profile'];

export default function ProfilePage() {
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
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    async function fetchProfile() {
      if (user) {
        try {
          const { profile: fetchedProfile } = await getUserProfile({ userId: user.uid });
          setProfile(fetchedProfile);
          if (fetchedProfile?.username) {
            setUsername(fetchedProfile.username);
            setOriginalUsername(fetchedProfile.username);
          } else {
             setUsername(fetchedProfile?.displayName || '');
             setOriginalUsername(fetchedProfile?.displayName || '');
          }
        } catch (error) {
          console.error('Failed to fetch profile:', error);
        } finally {
          setLoading(false);
        }
      }
    }
    if (!authLoading) {
      fetchProfile();
    }
  }, [user, authLoading]);

  const handleEditToggle = () => {
    if (isEditing) {
        // Cancel editing
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
        setOriginalUsername(newUsername!);
        setProfile(p => p ? { ...p, username: newUsername } : null);
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


  if (loading || authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return <div className="container mx-auto py-8 px-4 text-center">Could not load profile.</div>;
  }
  
  const isSaveDisabled = isPending || usernameStatus !== 'available';

  return (
    <div className="container mx-auto max-w-2xl py-12 px-4">
      <Card className="w-full border-2 border-primary/20 shadow-xl rounded-2xl">
        <CardHeader className="items-center text-center relative">
          <div className="absolute top-4 right-4 flex gap-2">
            {isEditing && (
              <Button onClick={handleSaveUsername} size="icon" disabled={isSaveDisabled}>
                {isPending ? <LoaderCircle className="animate-spin" /> : <Check />}
              </Button>
            )}
             <Button variant="ghost" size="icon" onClick={handleEditToggle}>
                {isEditing ? <X /> : <Pencil className="w-5 h-5" />}
            </Button>
          </div>

          <Avatar className="w-28 h-28 mb-4 border-4 border-primary">
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
                className="text-2xl font-bold font-serif text-center h-12"
                disabled={isPending}
              />
              <p className={cn("text-sm mt-1 h-5", getStatusColor())}>
                {usernameStatus === 'checking' ? 'Checking...' : usernameMessage}
              </p>
            </div>
          ) : (
             <>
              <CardTitle className="text-4xl font-bold font-serif">{profile.username || profile.displayName}</CardTitle>
              <CardDescription className="text-base">{profile.email}</CardDescription>
             </>
          )}

        </CardHeader>
        <CardContent className="px-6 pb-6">
          
          <div className="space-y-6">
            <div className="space-y-2">
                <div className="flex justify-between font-semibold">
                    <span>Level 1</span>
                    <span>{profile.points} / 1000 XP</span>
                </div>
                <Progress value={(profile.points / 1000) * 100} className="h-3" />
            </div>

            <div className="text-center">
                 <p className="text-5xl font-bold">{profile.streak}</p>
                 <p className="text-muted-foreground font-medium">Day Streak</p>
            </div>
          </div>
          
          <Separator className="my-8" />

          <div>
            <h3 className="text-2xl font-semibold mb-6 text-center font-serif">Achievements</h3>
            {profile.achievements.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                <TooltipProvider>
                  {profile.achievements.map((ach) => (
                    <Tooltip key={ach.id}>
                      <TooltipTrigger asChild>
                        <div className="flex flex-col items-center p-2 text-center transition-transform hover:scale-110">
                          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                              <Award className="w-8 h-8 text-primary" />
                          </div>
                          <p className="text-xs mt-2 font-semibold whitespace-nowrap">{ach.name}</p>
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
              <p className="text-muted-foreground text-center">No achievements unlocked yet. Keep going!</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

    