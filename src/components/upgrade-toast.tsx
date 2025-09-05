
'use client';

import { useRouter } from 'next/navigation';
import { Button } from './ui/button';
import { Progress } from './ui/progress';

interface UpgradeToastProps {
  featureName: string;
  usage: number;
  limit: number;
}

export default function UpgradeToast({ featureName, usage, limit }: UpgradeToastProps) {
  const router = useRouter();
  const percentage = (usage / limit) * 100;

  return (
    <div className="grid gap-2 w-full">
      <p className="font-semibold">You're approaching your {featureName} limit</p>
      <Progress value={percentage} className="h-2" />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{usage} / {limit} used</span>
        <Button
          variant="link"
          className="p-0 h-auto"
          onClick={() => router.push('/pricing')}
        >
          Upgrade Plan
        </Button>
      </div>
    </div>
  );
}
