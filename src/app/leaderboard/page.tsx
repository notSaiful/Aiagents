
'use client';

import { useEffect, useState } from 'react';
import { getLeaderboard, GetLeaderboardOutput } from '@/ai/flows/get-leaderboard';
import { LoaderCircle, Trophy, Award } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';


type LeaderboardData = GetLeaderboardOutput['leaderboard'];

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardData>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const { leaderboard: fetchedData } = await getLeaderboard({ filter: 'all-time' });
        setLeaderboard(fetchedData);
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4">
        <div className="flex flex-col items-center text-center mb-8">
            <Trophy className="w-16 h-16 text-yellow-400 mb-4" />
            <h1 className="text-4xl font-bold font-serif">Leaderboard</h1>
            <p className="text-muted-foreground mt-2">See who is topping the charts!</p>
        </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px] text-center">Rank</TableHead>
                <TableHead>User</TableHead>
                <TableHead className="text-center">Points</TableHead>
                <TableHead className="text-center">Streak</TableHead>
                <TableHead className="text-center">Achievements</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaderboard.map((player) => (
                <TableRow key={player.uid} className={cn(user?.uid === player.uid && "bg-primary/30")}>
                  <TableCell className="font-bold text-lg text-center">
                    <div className="flex items-center justify-center">
                      {player.rank === 1 && <Trophy className="w-6 h-6 text-yellow-400" />}
                      {player.rank === 2 && <Trophy className="w-6 h-6 text-gray-400" />}
                      {player.rank === 3 && <Trophy className="w-6 h-6 text-orange-400" />}
                      <span className="ml-2">{player.rank}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={player.photoURL} />
                        <AvatarFallback>{player.displayName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{player.displayName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-semibold text-lg">{player.points.toLocaleString()}</TableCell>
                  <TableCell className="text-center font-semibold">{player.streak} 🔥</TableCell>
                  <TableCell className="text-center">
                    <TooltipProvider>
                       <div className="flex justify-center gap-1.5">
                            {player.achievements.slice(0, 3).map(ach => (
                                <Tooltip key={ach.id}>
                                    <TooltipTrigger>
                                        <Award className="w-6 h-6 text-yellow-500 hover:scale-110 transition-transform" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{ach.name}</p>
                                    </TooltipContent>
                                </Tooltip>
                            ))}
                            {player.achievements.length > 3 && (
                                <Tooltip>
                                    <TooltipTrigger>
                                        <div className="text-xs font-bold bg-muted px-1.5 py-0.5 rounded-full">+{player.achievements.length - 3}</div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Plus {player.achievements.length - 3} more achievements</p>
                                    </TooltipContent>
                                </Tooltip>
                            )}
                            {player.achievements.length === 0 && (
                                <span className="text-muted-foreground text-xs">-</span>
                            )}
                       </div>
                    </TooltipProvider>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
