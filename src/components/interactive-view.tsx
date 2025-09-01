
'use client';

import { useState, useRef, WheelEvent, MouseEvent } from 'react';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InteractiveViewProps {
  children: React.ReactNode;
}

export default function InteractiveView({ children }: InteractiveViewProps) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef({ x: 0, y: 0 });

  const handleWheel = (e: WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const scaleAmount = -e.deltaY * 0.001;
    const newScale = Math.max(0.1, Math.min(3, scale + scaleAmount));
    
    if (containerRef.current && contentRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const newX = mouseX - (mouseX - position.x) * (newScale / scale);
        const newY = mouseY - (mouseY - position.y) * (newScale / scale);

        setScale(newScale);
        setPosition({ x: newX, y: newY });
    }
  };

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    containerRef.current?.classList.add('cursor-grabbing');
    dragStartRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    e.preventDefault();
    const newX = e.clientX - dragStartRef.current.x;
    const newY = e.clientY - dragStartRef.current.y;
    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    containerRef.current?.classList.remove('cursor-grabbing');
  };

  const handleMouseLeave = (e: MouseEvent<HTMLDivElement>) => {
    if (isDragging) {
      handleMouseUp(e);
    }
  };
  
  const zoom = (direction: 'in' | 'out') => {
    const scaleAmount = direction === 'in' ? 0.1 : -0.1;
    const newScale = Math.max(0.1, Math.min(3, scale + scaleAmount));
    setScale(newScale);
  };
  
  const resetView = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };


  return (
    <div className="relative w-full h-full overflow-hidden border rounded-lg bg-muted/20">
      <div 
        ref={containerRef}
        className="w-full h-full cursor-grab"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        <div
          ref={contentRef}
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
            transformOrigin: 'top left'
          }}
          className="w-full h-full flex items-center justify-center"
        >
          {children}
        </div>
      </div>
      <div className="absolute bottom-4 right-4 flex gap-2">
        <Button size="icon" variant="outline" onClick={() => zoom('in')}>
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="outline" onClick={() => zoom('out')}>
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="outline" onClick={resetView}>
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
