'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileDown, Image, Link as LinkIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ShareDialogProps {
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCopyLink: () => void;
}

export default function ShareDialog({ children, open, onOpenChange, onCopyLink }: ShareDialogProps) {
  const { toast } = useToast();

  const handlePlaceholderClick = (feature: string) => {
    toast({
      title: 'Coming Soon!',
      description: `${feature} functionality is not yet implemented.`,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export & Share</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col space-y-4">
          <Button variant="outline" onClick={() => handlePlaceholderClick('PDF export')}>
            <FileDown className="mr-2 h-4 w-4" />
            Export as PDF
          </Button>
          <Button variant="outline" onClick={() => handlePlaceholderClick('Image export')}>
            <Image className="mr-2 h-4 w-4" />
            Export as Image
          </Button>
          <Button variant="outline" onClick={onCopyLink}>
            <LinkIcon className="mr-2 h-4 w-4" />
            Share Link
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
