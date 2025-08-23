
'use client';

import Image from 'next/image';

interface ArtProps {
  imageUrl: string;
}

export default function Art({ imageUrl }: ArtProps) {
  if (!imageUrl) {
    return <p className="text-muted-foreground">No artwork available.</p>;
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg">
      <Image
        src={imageUrl}
        alt="AI-generated artwork based on the notes"
        layout="fill"
        objectFit="contain"
        className="bg-muted"
      />
    </div>
  );
}
