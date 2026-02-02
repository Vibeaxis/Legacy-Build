
import React from 'react';
import { motion } from 'framer-motion';

const AnimatedBackground = ({ className = "" }) => {
  return (
    <div className={`absolute inset-0 z-0 overflow-hidden bg-slate-900 ${className}`}>
        {/* Base Atmospheric Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1c2c] via-[#0f1016] to-[#120a1f] opacity-100"></div>
        
        {/* Subtle Radial Highlights */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_30%,rgba(76,29,149,0.15)_0%,transparent_50%)]"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_70%,rgba(56,189,248,0.08)_0%,transparent_50%)]"></div>

        {/* Floating Ink Particles/Dust */}
        <div className="absolute inset-0 opacity-20" style={{ 
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zzM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` 
        }}></div>

        {/* Animated SVG Strokes */}
        <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none">
            {/* Slow, elegant curve */}
            <motion.path
                d="M -100 600 Q 400 300 900 800"
                fill="none"
                stroke="#a78bfa"
                strokeWidth="2"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: [0, 1], opacity: [0, 0.5, 0] }}
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            />
            {/* Cross hatch suggestion */}
            <motion.path
                d="M 100 100 L 300 300"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="1"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: [0, 0.3, 0] }}
                transition={{ duration: 8, delay: 2, repeat: Infinity }}
            />
             <motion.path
                d="M 300 100 L 100 300"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="1"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: [0, 0.3, 0] }}
                transition={{ duration: 8, delay: 4, repeat: Infinity }}
            />
            
            {/* Circle motif */}
            <motion.circle
                cx="80%"
                cy="30%"
                r="150"
                stroke="#f472b6"
                strokeWidth="1"
                fill="none"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1.2, opacity: [0, 0.1, 0] }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            />
        </svg>

        {/* Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)] pointer-events-none"></div>
    </div>
  );
};

export default AnimatedBackground;
