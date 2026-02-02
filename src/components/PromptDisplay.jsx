
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PromptDisplay = ({ prompt, vibeTier, threadID, rarity, type }) => {
  const getVibeColor = () => {
    switch (vibeTier) {
      case 'Raw': return '#9c27b0';
      case 'Aspirational': return '#ffd700';
      case 'Methodical': return '#8d6e63';
      case 'Eldritch': return '#9c27b0';
      case 'Majestic': return '#ffd700';
      default: return '#8d6e63'; 
    }
  };

  const isLegacy = type === 'fixed_legacy';
  const isMythic = rarity === 'mythic' || isLegacy;
  const isRare = rarity === 'rare';

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="text-center relative inline-block p-8"
    >
      {/* Background Effects */}
      <div className={`absolute inset-0 rounded-full transform scale-x-150 transition-all duration-1000
        ${isMythic ? 'bg-[#ffd700] opacity-20 blur-2xl animate-pulse' : 
          isRare ? 'bg-[#e0e0e0] opacity-15 blur-xl' : 
          'bg-[#fbf5e6] opacity-10 blur-xl'}`} 
      />
      
      {/* Legacy Glow */}
      {isLegacy && (
          <div className="absolute inset-0 bg-[#ff9800] opacity-10 blur-3xl animate-pulse rounded-full" />
      )}
        
      {/* Vibe & Thread Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-2 flex flex-col items-center gap-1"
      >
          {vibeTier && !isLegacy && (
              <span 
                className="font-garamond uppercase tracking-[0.2em] text-xs font-bold border-b border-opacity-50 pb-1"
                style={{ color: getVibeColor(), borderColor: getVibeColor() }}
              >
                  {vibeTier} Atmosphere
              </span>
          )}
          
          {isLegacy && (
             <span className="font-garamond uppercase tracking-[0.3em] text-xs font-bold text-[#ff9800] border-b border-[#ff9800] pb-1 animate-pulse">
                Legacy Interruption
             </span>
          )}
          
          <AnimatePresence>
            {threadID && (
                <motion.span
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="font-garamond italic text-[#bcaaa4] text-xs"
                >
                    Following the thread of {threadID}...
                </motion.span>
            )}
          </AnimatePresence>
      </motion.div>

      <motion.h1 
        className={`font-playfair font-bold mb-3 relative z-10 italic transition-colors duration-500
            ${isLegacy ? 'text-5xl md:text-6xl lg:text-7xl text-[#ffcc80] drop-shadow-[0_0_20px_rgba(255,165,0,0.6)]' :
            isMythic ? 'text-4xl md:text-5xl lg:text-6xl text-[#ffcc80] drop-shadow-[0_0_15px_rgba(255,215,0,0.5)]' : 
              isRare ? 'text-4xl md:text-5xl lg:text-6xl text-[#f5f5f5] drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]' : 
              'text-4xl md:text-5xl lg:text-6xl text-[#eaddcf]'}`}
        style={{ 
          textShadow: isMythic ? undefined : '0 2px 10px rgba(0,0,0,0.8), 0 0 20px rgba(180, 150, 100, 0.2)',
        }}
        animate={isMythic ? { scale: [1, 1.02, 1] } : {}}
        transition={isMythic ? { repeat: Infinity, duration: 4 } : {}}
      >
        {prompt}
      </motion.h1>

      <motion.div 
        className={`h-px w-32 mx-auto my-2 opacity-50
            ${isLegacy ? 'bg-gradient-to-r from-transparent via-[#ff9800] to-transparent w-48 h-0.5' :
            isMythic ? 'bg-gradient-to-r from-transparent via-[#ffd700] to-transparent' : 
              'bg-gradient-to-r from-transparent via-[#8d6e63] to-transparent'}`}
        initial={{ width: 0 }}
        animate={{ width: isLegacy ? 192 : 128 }}
        transition={{ duration: 1, delay: 0.5 }}
      />
      
      <motion.p 
        className="font-garamond text-[#bcaaa4] text-lg md:text-xl relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        The archives await your mark.
      </motion.p>
    </motion.div>
  );
};

export default PromptDisplay;
