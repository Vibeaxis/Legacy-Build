
import React from 'react';
import { cn } from '@/lib/utils';

const ThumbnailPreview = ({ svgPath, inkColor, isReplaying, className }) => {
  return (
    <div 
      className={cn(
        "relative w-10 h-10 rounded-sm overflow-hidden transition-all duration-300",
        "bg-[#fbf5e6]", 
        isReplaying ? "ring-2 ring-offset-1 scale-110 z-10" : "border border-[#8d6e63]/30 hover:border-[#8d6e63]",
        className
      )}
      style={{
        boxShadow: isReplaying 
          ? `0 0 10px ${inkColor}, inset 0 0 5px rgba(0,0,0,0.1)` 
          : 'inset 0 0 10px rgba(139, 69, 19, 0.05)',
        borderColor: isReplaying ? inkColor : undefined
      }}
    >
      {/* Wood grain background simulation */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
           backgroundImage: `url("https://www.transparenttextures.com/patterns/wood-pattern.png")`,
           backgroundSize: 'cover'
        }}
      />
      
      <svg 
        viewBox="0 0 1000 600" 
        className="w-full h-full p-1"
        preserveAspectRatio="xMidYMid meet"
      >
        <path
          d={svgPath}
          fill="none"
          stroke={inkColor}
          strokeWidth="20"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

export default ThumbnailPreview;
