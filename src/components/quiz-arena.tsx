
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { QuizQuestion } from '@/types';
import { Shield, Sword, Heart, Trophy, RefreshCw } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { updateUserStats } from '@/ai/flows/update-user-stats';
import { useToast } from '@/hooks/use-toast';
import StreakToast from '@/components/streak-toast';
import VictoryAnimation from './victory-animation';


interface QuizArenaProps {
  questions: QuizQuestion[];
  style: string;
}

const INITIAL_HEALTH = 100;
const TIMER_SECONDS = 15;

export default function QuizArena({ questions, style }: QuizArenaProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [playerHealth, setPlayerHealth] = useState(INITIAL_HEALTH);
  const [aiHealth, setAiHealth] = useState(INITIAL_HEALTH);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | 'miss' | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [timer, setTimer] = useState(TIMER_SECONDS);
  const [popScore, setPopScore] = useState(false);
  const [popStreak, setPopStreak] = useState(false);
  
  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    if (gameOver || !currentQuestion) return;

    const interval = setInterval(() => {
        setTimer(prev => {
            if (prev > 1) {
                return prev - 1;
            } else {
                handleAnswer(null); // Time's up
                return TIMER_SECONDS;
            }
        });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentQuestionIndex, gameOver, currentQuestion]);

  const handleAnswer = async (answer: string | null) => {
    if (selectedAnswer || !currentQuestion) return; // Prevent multiple answers

    setSelectedAnswer(answer);
    let isCorrect = false;

    if (answer === null) {
        setFeedback('miss');
        setPlayerHealth(prev => Math.max(0, prev - 10)); // Penalty for running out of time
        setStreak(0);
    } else {
        isCorrect = answer === currentQuestion.answer;
        if (isCorrect) {
            const damage = 10 + (currentQuestion.difficulty * 5); // Difficulty-based damage
            const pointsGained = 15;
            setAiHealth(prev => Math.max(0, prev - damage));
            
            setScore(prev => prev + 10 * currentQuestion.difficulty);
            setPopScore(true);
            setTimeout(() => setPopScore(false), 300);

            setStreak(prev => prev + 1);
            setPopStreak(true);
            setTimeout(() => setPopStreak(false), 300);

            setFeedback('correct');
            if (user) {
                const { streakMilestone } = await updateUserStats({ userId: user.uid, action: 'quizCorrectAnswer' });
                if (streakMilestone) {
                    toast({
                        duration: 5000,
                        component: () => <StreakToast streakDays={streakMilestone} />,
                    });
                }
                toast({
                    title: 'Correct!',
                    description: `You earned ${pointsGained} points.`,
                });
            }
        } else {
            setPlayerHealth(prev => Math.max(0, prev - 15));
            setStreak(0);
            setFeedback('incorrect');
        }
    }
    
    setTimeout(() => {
      const isPlayerDefeated = playerHealth <= 15 && !isCorrect;
      const isAIDefeated = aiHealth <= (10 + (currentQuestion.difficulty * 5)) && isCorrect;
      const isLastQuestion = currentQuestionIndex === questions.length - 1;

      if (isPlayerDefeated || isAIDefeated || isLastQuestion) {
        if(user && (isAIDefeated || isPlayerDefeated)) {
            updateUserStats({ userId: user.uid, action: 'quizCompleted' });
        }
        setGameOver(true);
      } else {
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedAnswer(null);
        setFeedback(null);
        setTimer(TIMER_SECONDS);
      }
    }, 1500);
  };

  const handleRestart = () => {
    setPlayerHealth(INITIAL_HEALTH);
    setAiHealth(INITIAL_HEALTH);
    setCurrentQuestionIndex(0);
    setScore(0);
    setStreak(0);
    setGameOver(false);
    setFeedback(null);
    setSelectedAnswer(null);
    setTimer(TIMER_SECONDS);
  }

  if (gameOver) {
    const victory = aiHealth <= 0;
    return (
      <div className="text-center p-4 relative min-h-[350px] flex flex-col justify-center items-center">
        {victory ? (
            <VictoryAnimation score={score} onRestart={handleRestart} />
        ) : (
            <>
                <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                <h2 className="text-3xl font-bold font-serif mb-2">Defeat!</h2>
                <p className="text-lg text-muted-foreground">Your final score: {score}</p>
                <Button onClick={handleRestart} className="mt-6">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Play Again
                </Button>
            </>
        )}
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
        {/* Health Bars */}
        <div className="flex justify-between gap-4 mb-4">
            <div className="w-full">
                <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-semibold">Player</span>
                    <span className="flex items-center"><Heart className="w-4 h-4 mr-1 text-red-500" />{playerHealth}</span>
                </div>
                <Progress value={playerHealth} className="h-4 [&>div]:bg-green-500" />
            </div>
            <div className="w-full">
                 <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-semibold">AI Opponent</span>
                    <span className="flex items-center"><Heart className="w-4 h-4 mr-1 text-red-500" />{aiHealth}</span>
                </div>
                <Progress value={aiHealth} className="h-4" />
            </div>
        </div>
        
        {/* Timer and Question Card */}
        {currentQuestion && (
            <>
                <Card className="relative overflow-hidden shadow-lg">
                    <div className="absolute top-2 right-2 font-bold text-lg bg-background/80 px-2 rounded-md">{timer}s</div>
                    <CardContent className="p-6">
                        <p className="text-sm text-muted-foreground mb-2">Question {currentQuestionIndex + 1} of {questions.length}</p>
                        <h3 className="text-xl font-semibold text-center min-h-[80px] flex items-center justify-center">
                            {currentQuestion.question}
                        </h3>
                    </CardContent>
                </Card>
                
                {/* Answer Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                    {currentQuestion.options.map((option, index) => {
                        const isCorrect = option === currentQuestion.answer;
                        const isSelected = selectedAnswer === option;
                        return (
                            <Button
                                key={index}
                                onClick={() => handleAnswer(option)}
                                disabled={!!selectedAnswer}
                                variant={'outline'}
                                className={cn(
                                    "h-auto py-3 text-base whitespace-normal text-center justify-center transition-all duration-300",
                                    selectedAnswer && isCorrect && 'bg-green-600 border-green-600 text-white animate-correct-glow',
                                    selectedAnswer && isSelected && !isCorrect && 'bg-destructive border-destructive text-destructive-foreground'
                                )}
                            >
                                {option}
                            </Button>
                        )
                    })}
                </div>
            </>
        )}

        {/* Score and Streak */}
         <div className="flex justify-between items-center mt-6 text-lg">
            <div className={cn('font-semibold', popScore && 'animate-pop')}>Score: <span className="text-primary">{score}</span></div>
            <div className={cn('font-semibold', popStreak && 'animate-pop')}>Streak: <span className="text-accent">{streak}x 🔥</span></div>
        </div>
    </div>
  );
}
