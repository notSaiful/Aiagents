
import { Lock } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function LockIcon() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Lock className="w-3 h-3 text-yellow-500" />
        </TooltipTrigger>
        <TooltipContent>
          <p>This is a premium feature. Upgrade to unlock.</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
