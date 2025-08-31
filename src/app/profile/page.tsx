'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { getUserProfile } from '@/ai/flows/get-user-profile';
import { GetUserProfileOutput } from '@/ai/flows/get-user-profile';
import { LoaderCircle, Award, BarChart2, Star, Calendar, Pencil, BookCopy, FileText, Bot } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

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

  const quickStats = [
      { icon: FileText, label: 'Summaries', value: profile.stats.summariesGenerated },
      { icon: BookCopy, label: 'Flashcards', value: profile.stats.flashcardsCompleted },
      { icon: Bot, label: 'Games', value: profile.stats.gamesCompleted },
  ];

  return (
    <div className="container mx-auto max-w-2xl py-12 px-4">
      <Card className="w-full border-2 border-primary/20 shadow-xl rounded-2xl">
        <CardHeader className="items-center text-center relative">
          <Button variant="ghost" size="icon" className="absolute top-4 right-4">
            <Pencil className="w-5 h-5" />
          </Button>
          <Avatar className="w-28 h-28 mb-4 border-4 border-primary">
            <AvatarImage src={profile.photoURL} alt={profile.displayName} />
            <AvatarFallback className="text-4xl">
              {profile.displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <CardTitle className="text-4xl font-bold font-serif">{profile.displayName}</CardTitle>
          <CardDescription className="text-base">{profile.email}</CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          
          <div className="space-y-6">
            {/* Rank & Progress */}
            <div className="space-y-2">
                <div className="flex justify-between font-semibold">
                    <span>Level 1</span>
                    <span>{profile.points} / 1000 XP</span>
                </div>
                <Progress value={(profile.points / 1000) * 100} className="h-3" />
            </div>

            {/* Streak */}
            <div className="text-center">
                 <p className="text-5xl font-bold">{profile.streak}</p>
                 <p className="text-muted-foreground font-medium">Day Streak</p>
            </div>
            
             {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 text-center">
                {quickStats.map(stat => (
                    <div key={stat.label} className="p-4 bg-muted rounded-xl">
                        <stat.icon className="w-8 h-8 mx-auto text-primary mb-2" />
                        <p className="text-2xl font-bold">{stat.value}</p>
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </div>
                ))}
            </div>
          </div>
          
          <Separator className="my-8" />

          {/* Achievements */}
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

    