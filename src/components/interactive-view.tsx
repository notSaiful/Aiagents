
'use client';

import { useState, useRef, WheelEvent, MouseEvent } from 'react';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InteractiveViewProps {
  children: React.ReactNode;
  className?: string;
}

export default function InteractiveView({ children, className }: InteractiveViewProps) {
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
    
    if (containerRef.current) {
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
    if(containerRef.current) containerRef.current.style.cursor = 'grabbing';
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
    if(containerRef.current) containerRef.current.style.cursor = 'grab';
  };

  const handleMouseLeave = (e: MouseEvent<HTMLDivElement>) => {
    if (isDragging) {
      handleMouseUp(e);
    }
  };
  
  const zoom = (direction: 'in' | 'out') => {
    const scaleAmount = direction === 'in' ? 0.2 : -0.2;
    const newScale = Math.max(0.1, Math.min(3, scale + scaleAmount));
    
    if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const newX = centerX - (centerX - position.x) * (newScale / scale);
        const newY = centerY - (centerY - position.y) * (newScale / scale);
        
        setScale(newScale);
        setPosition({ x: newX, y: newY });
    }
  };
  
  const resetView = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };


  return (
    <div 
      ref={containerRef}
      className={cn("relative w-full h-full overflow-hidden border rounded-lg bg-muted/20 cursor-grab", className)}
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
        className="absolute top-0 left-0 w-full h-full flex items-center justify-center"
      >
        {children}
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
