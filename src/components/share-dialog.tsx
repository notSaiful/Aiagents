
'use client';

import { RefObject } from 'react';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileDown, Image, Link as LinkIcon, LoaderCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCopyLink: () => void;
  isSharing: boolean;
  activeTab: string;
  refs: {
    summary: RefObject<HTMLDivElement>;
    flashcards: RefObject<HTMLDivElement>;
    'mind-map': RefObject<HTMLDivElement>;
  };
}

export default function ShareDialog({ 
  open, 
  onOpenChange, 
  onCopyLink,
  isSharing,
  activeTab,
  refs,
}: ShareDialogProps) {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const getActiveRef = () => {
    switch (activeTab) {
      case 'summary':
        return refs.summary;
      case 'flashcards':
        return refs.flashcards;
      case 'mind-map':
        return refs['mind-map'];
      default:
        return null;
    }
  };

  const exportContent = async (format: 'png' | 'pdf') => {
    const elementRef = getActiveRef();
    if (!elementRef?.current) {
        toast({
            title: 'Export Failed',
            description: 'Could not find the content to export.',
            variant: 'destructive',
        });
        return;
    }

    setIsExporting(true);
    toast({
        title: 'Exporting...',
        description: `Your ${activeTab} is being converted to a ${format.toUpperCase()} file.`,
    });

    try {
        const dataUrl = await toPng(elementRef.current, { 
            cacheBust: true, 
            pixelRatio: 2,
            style: {
                backgroundColor: 'white',
            }
        });

        if (format === 'png') {
            const link = document.createElement('a');
            link.download = `notes-gpt-${activeTab}.png`;
            link.href = dataUrl;
            link.click();
        } else if (format === 'pdf') {
            const img = new window.Image();
            img.src = dataUrl;
            img.onload = () => {
                const pdf = new jsPDF({
                    orientation: img.width > img.height ? 'landscape' : 'portrait',
                    unit: 'px',
                    format: [img.width, img.height],
                });
                pdf.addImage(dataUrl, 'PNG', 0, 0, img.width, img.height);
                pdf.save(`notes-gpt-${activeTab}.pdf`);
            };
            img.onerror = () => {
              throw new Error('Failed to load image for PDF generation.');
            }
        }
        toast({
            title: 'Export Successful!',
            description: `Your file has been downloaded.`,
        });
    } catch (error) {
        console.error('Export failed:', error);
        toast({
            title: 'Export Failed',
            description: 'An unexpected error occurred during the export. Please try again.',
            variant: 'destructive',
        });
    } finally {
        setIsExporting(false);
        onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export & Share</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col space-y-4">
          <Button variant="outline" onClick={() => exportContent('pdf')} disabled={isExporting || isSharing}>
            {isExporting ? <LoaderCircle className="mr-2 animate-spin" /> : <FileDown className="mr-2 h-4 w-4" />}
            Export as PDF
          </Button>
          <Button variant="outline" onClick={() => exportContent('png')} disabled={isExporting || isSharing}>
            {isExporting ? <LoaderCircle className="mr-2 animate-spin" /> : <Image className="mr-2 h-4 w-4" />}
            Export as Image
          </Button>
          <Button variant="outline" onClick={onCopyLink} disabled={isExporting || isSharing}>
            {isSharing ? <LoaderCircle className="mr-2 animate-spin" /> : <LinkIcon className="mr-2 h-4 w-4" />}
            Share Link
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
