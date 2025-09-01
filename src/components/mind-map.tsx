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
    <div className="w-full h-[450px] p-4">
      <InteractiveView>
        <Mermaid chart={data} />
      </InteractiveView>
    </div>
  );
}
