'use client';

import Mermaid from './mermaid';

interface MindMapProps {
  data: string;
}

export default function MindMap({ data }: MindMapProps) {
  if (!data) {
    return <p className="text-muted-foreground">No mind map data available.</p>;
  }

  return (
    <div className="p-4 overflow-x-auto w-full">
      <Mermaid chart={data} />
    </div>
  );
}
