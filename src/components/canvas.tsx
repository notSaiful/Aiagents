
'use client';

import Image from 'next/image';

interface CanvasProps {
  imageUrl: string;
}

export default function Canvas({ imageUrl }: CanvasProps) {
  if (!imageUrl) {
    return <p className="text-muted-foreground">No image available.</p>;
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg">
      <Image
        src={imageUrl}
        alt="AI-generated art representing the notes"
        fill
        className="object-contain"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </div>
  );
}
