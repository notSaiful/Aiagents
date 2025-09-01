'use client';

import Mermaid from './mermaid';
import InteractiveView from './interactive-view';

interface MindMapProps {
  data: string;
}

export default function MindMap({ data }: MindMapProps) {
  if (!data) {
    return <p className="text-muted-foreground">No mind map data available.</p>;
  }

  return (
    <InteractiveView className="h-[450px]">
        <Mermaid chart={data} />
    </InteractiveView>
  );
}
