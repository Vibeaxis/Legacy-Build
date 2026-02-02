
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const StyleToastNotification = ({ 
  styleTag, 
  secondaryStyle,
  styleConfidence, 
  scale, 
  placement,
  threadID,
  rarity,
  promptText,
  isVisible, 
  onClose 
}) => {
  
  React.useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  const getTagline = (style) => {
    switch(style) {
      case 'Whispered': return "A mark of quiet intention";
      case 'Architectural': return "A mark of structure and precision";
      case 'Flourished': return "A mark of great spirit";
      case 'Staccato': return "A mark of rhythm and pause";
      case 'Monastic': return "A mark of deliberate stillness";
      default: return "A mark of distinct character";
    }
  };

  const displayStyle = secondaryStyle || styleTag; 
  const tagline = getTagline(styleTag);
  const isMythic = rarity === 'mythic';
  const isRare = rarity === 'rare';

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed top-24 right-4 z-50 md:right-8 md:top-8 w-80"
        >
          <div className={`p-1 rounded-lg shadow-2xl border backdrop-blur-md relative overflow-hidden
            ${isMythic ? 'bg-gradient-to-br from-[#2d241e] to-[#4a3b2a] border-[#ffd700]/50' : 
              'bg-gradient-to-br from-[#1a120b] to-[#2d241e] border-[#5d4037]/50'}`}>
             
             {/* Mythic Glow */}
             {isMythic && (
                 <div className="absolute inset-0 bg-[#ffd700] opacity-10 animate-pulse pointer-events-none"></div>
             )}

             <div className="border border-[#8d6e63]/30 rounded p-5 flex flex-col items-center text-center bg-[#1a120b]/80 relative overflow-hidden">
                 
                 {/* Decorative background accent */}
                 <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent to-transparent opacity-50
                    ${isMythic ? 'via-[#ffd700]' : 'via-[#ffb74d]'}`}></div>

                 <div className="flex items-center justify-center mb-2">
                     <span className="text-2xl filter drop-shadow-md">{isMythic ? '✨' : (isRare ? '💎' : '🖋️')}</span>
                 </div>
                 
                 <h4 className={`font-playfair font-bold text-2xl tracking-wide mb-1
                    ${isMythic ? 'text-[#ffd700]' : 'text-[#ffcc80]'}`}>
                    {displayStyle}
                 </h4>
                 
                 <p className="font-garamond italic text-[#bcaaa4] text-sm mb-3 border-b border-[#8d6e63]/30 pb-2 w-full">
                    {tagline}
                 </p>

                 {/* Rarity/Thread Feedback */}
                 {(threadID || rarity) && (
                     <div className="mb-2 text-xs font-garamond text-[#eaddcf] flex flex-col items-center">
                         {threadID && <span className="italic">Following thread: {threadID}</span>}
                         {isMythic && <span className="text-[#ffd700] font-bold uppercase tracking-widest text-[10px] mt-1">Mythic Resonance</span>}
                         {isRare && <span className="text-[#e0e0e0] font-bold uppercase tracking-widest text-[10px] mt-1">Rare Discovery</span>}
                     </div>
                 )}

                 {/* Metrics Visualization */}
                 <div className="w-full flex justify-between items-center text-xs font-sans text-[#8d6e63] mt-1 px-2">
                    <span className="uppercase tracking-wider">Confidence</span>
                    <div className="flex gap-1">
                        {[1,2,3,4,5].map(i => (
                            <div 
                                key={i} 
                                className={`w-1.5 h-1.5 rounded-full ${styleConfidence >= i*20 ? 'bg-[#ffb74d]' : 'bg-[#3e2723]'}`}
                            />
                        ))}
                    </div>
                 </div>

                 {(scale || placement) && (
                     <div className="text-[10px] text-[#5d4037] mt-2 font-mono uppercase tracking-widest opacity-70">
                        {scale} • {placement}
                     </div>
                 )}
             </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StyleToastNotification;
