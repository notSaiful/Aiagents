'use client';

import { cn } from '@/lib/utils';
import type { MindMapNodeData } from '@/types';

interface MindMapNodeProps {
  node: MindMapNodeData;
  isRoot?: boolean;
}

const MindMapNode = ({ node, isRoot = false }: MindMapNodeProps) => {
  return (
    <div className={cn("flex items-start", !isRoot && "ml-8 mt-4")}>
      {!isRoot && (
        <div className="mr-4 h-px w-8 bg-border translate-y-5"></div>
      )}
      <div className="relative">
        {!isRoot && (
          <div className="absolute -left-8 bottom-1/2 h-full w-px bg-border"></div>
        )}
        <div className="relative z-10 rounded-lg border bg-card px-4 py-2 shadow-sm">
          <p>{node.name}</p>
        </div>
        {node.children && node.children.length > 0 && (
          <div className="mt-4">
            {node.children.map((child, index) => (
              <MindMapNode key={index} node={child} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

interface MindMapProps {
  data: MindMapNodeData;
}

export default function MindMap({ data }: MindMapProps) {
  if (!data) {
    return <p className="text-muted-foreground">No mind map data available.</p>;
  }

  return (
    <div className="p-4 overflow-x-auto">
      <MindMapNode node={data} isRoot={true} />
    </div>
  );
}
