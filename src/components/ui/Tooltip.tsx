import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      className="relative inline-flex items-center"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onClick={() => setIsVisible(!isVisible)} // Mobile support
    >
      {children}
      {isVisible && (
        <div
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 p-3 text-xs text-zinc-100 bg-zinc-900/95 backdrop-blur-md rounded-lg shadow-xl border border-white/10 z-50 animate-in fade-in zoom-in-95 duration-200"
        >
          {content}
          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-900/95" />
        </div>
      )}
    </div>
  );
};
