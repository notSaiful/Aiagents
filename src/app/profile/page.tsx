
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { getUserProfile } from '@/ai/flows/get-user-profile';
import { GetUserProfileOutput } from '@/ai/flows/get-user-profile';
import { LoaderCircle, Award, BarChart2, Calendar, Star, HelpCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';

type ProfileData = GetUserProfileOutput['profile'];

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4">
      <Card className="w-full">
        <CardHeader className="flex flex-col items-center text-center">
          <Avatar className="w-24 h-24 mb-4 border-4 border-primary">
            <AvatarImage src={profile.photoURL} alt={profile.displayName} />
            <AvatarFallback className="text-3xl">
              {profile.displayName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <CardTitle className="text-3xl">{profile.displayName}</CardTitle>
          <CardDescription>{profile.email}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-2 gap-6 text-center my-8">
            <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-muted">
              <Star className="w-8 h-8 text-yellow-400 mb-2" />
              <p className="text-3xl font-bold">{profile.points}</p>
              <p className="text-sm text-muted-foreground">Total Points</p>
            </div>
            <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-muted">
              <Calendar className="w-8 h-8 text-red-500 mb-2" />
              <p className="text-3xl font-bold">{profile.streak}</p>
              <p className="text-sm text-muted-foreground">Day Streak</p>
            </div>
          </div>
          
          <Separator className="my-8" />

          <div>
            <h3 className="text-2xl font-semibold mb-6 text-center font-serif">Achievements</h3>
            {profile.achievements.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                <TooltipProvider>
                  {profile.achievements.map((ach) => (
                    <Tooltip key={ach.id}>
                      <TooltipTrigger asChild>
                        <div className="flex flex-col items-center p-2 text-center">
                          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                              <Award className="w-8 h-8 text-primary" />
                          </div>
                          <p className="text-xs mt-2 font-semibold">{ach.name}</p>
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
