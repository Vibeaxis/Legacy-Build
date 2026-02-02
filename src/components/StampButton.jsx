
import React from 'react';
import { motion } from 'framer-motion';

const StampButton = ({ onClick, disabled, isPressed, vibeTier }) => {
  return (
    <div className="relative group">
       {/* Button Container */}
      <motion.button
        onClick={onClick}
        disabled={disabled}
        className={`
          relative w-28 h-28 rounded-full flex items-center justify-center
          transition-all duration-300
          ${disabled ? 'opacity-50 cursor-not-allowed grayscale' : 'cursor-pointer'}
        `}
        whileHover={!disabled ? { scale: 1.05 } : {}}
        whileTap={!disabled ? { scale: 0.8 } : {}}
        transition={{ type: "spring", stiffness: 600, damping: 20 }}
      >
        {/* Glow Effect */}
         <motion.div 
            className="absolute inset-0 rounded-full bg-white opacity-0 blur-lg"
            animate={isPressed ? { opacity: [0, 0.6, 0] } : { opacity: 0 }}
            transition={{ duration: 0.3 }}
         />

        {/* Wax Seal Graphic */}
        <div className="absolute inset-0 rounded-full shadow-2xl bg-[#8B0000] border-4 border-[#600000] overflow-hidden"
             style={{
               boxShadow: '0 10px 25px rgba(0,0,0,0.5), inset 0 2px 10px rgba(255,255,255,0.2)',
               background: vibeTier === 'Eldritch' 
                  ? 'radial-gradient(circle at 30% 30%, #4a148c, #311b92, #000000)' // Dark purple/black for Eldritch
                  : vibeTier === 'Majestic'
                  ? 'radial-gradient(circle at 30% 30%, #d32f2f, #b71c1c, #8B0000)' // Richer red for Majestic
                  : 'radial-gradient(circle at 30% 30%, #b71c1c, #8B0000, #4a0000)'  // Default Red
             }}
        >
             {/* Flash Effect Overlay */}
            <motion.div 
                className="absolute inset-0 bg-white"
                initial={{ opacity: 0 }}
                animate={isPressed ? { opacity: [0, 0.4, 0] } : { opacity: 0 }}
                transition={{ duration: 0.15 }}
            />

             {/* Inner Ring */}
            <div className="absolute inset-2 rounded-full border border-black opacity-30"></div>
            
            {/* Wax Texture Overlay */}
            <div className="absolute inset-0 rounded-full opacity-30 bg-blend-overlay"
                 style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/concrete-wall.png")' }}>
            </div>
        </div>

        {/* Icon/Text */}
        <div className="relative z-10 flex flex-col items-center justify-center text-[#ffcdd2]">
            <motion.div
                animate={isPressed ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.2 }}
                className="mb-1"
            >
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <path d="M8 11h8" />
                    <path d="M12 7v8" />
                </svg>
            </motion.div>
            <span className="font-playfair text-xs font-bold tracking-widest uppercase drop-shadow-md">SEAL</span>
        </div>
      </motion.button>
      
      {/* Tooltip hint */}
      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <span className="text-[#d7ccc8] font-playfair text-sm italic whitespace-nowrap">Stamp to Confirm</span>
      </div>
    </div>
  );
};

export default StampButton;
