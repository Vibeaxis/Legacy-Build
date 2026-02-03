import React from 'react';
import { motion } from 'framer-motion';
import { Stamp } from 'lucide-react';
import useAudio from '../hooks/useAudio';
import { useSettings } from '../context/SettingsContext';

const WaxSealButton = ({ onSeal, waxColor = '#b71c1c', disabled = false }) => {
  const { play: playThud } = useAudio('/assets/sounds/thunk.mp3', 'seal');
  const { settings } = useSettings();
  
  // Safety check in case settings aren't fully loaded
  const confirmSeal = settings?.gameplay?.confirmSeal ?? false;

  const handleStamp = () => {
    if (disabled) return;
    
    // Immediate audio feedback
    playThud();
    
    // Haptic feedback for mobile (adds physical sensation)
    if (navigator.vibrate) navigator.vibrate(50);

    if (confirmSeal) {
      // Small timeout to allow the 'press' animation to render before the alert blocks the thread
      setTimeout(() => {
        if (window.confirm("Seal this signature?")) {
          onSeal();
        }
      }, 50);
    } else {
      onSeal();
    }
  };

  return (
    <div className="relative flex flex-col items-center">
      <motion.button
        onClick={handleStamp}
        disabled={disabled}
        initial={{ y: 0, scale: 1 }}
        // Lift the stamp high on hover (Anticipation)
        whileHover={!disabled ? { 
          y: -15, 
          scale: 1.05,
          boxShadow: `0 25px 25px -5px ${waxColor}60, 0 10px 10px -5px rgba(0,0,0,0.4)`
        } : {}}
        // Slam down on click (Impact)
        whileTap={!disabled ? { 
          y: 2, 
          scale: 0.95,
          boxShadow: `0 2px 5px -2px ${waxColor}80` 
        } : {}}
        // Heavy spring physics for the "weighty" feel
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        className={`
          relative w-24 h-24 rounded-full flex flex-col items-center justify-center 
          border-4 border-[#3e2723]/40 z-10 transition-colors
          ${disabled ? 'bg-[#5d4037] opacity-50 cursor-not-allowed' : 'bg-[#3e2723] cursor-pointer'}
        `}
        style={{
          // Idle shadow
          boxShadow: disabled ? 'none' : `0 10px 15px -3px ${waxColor}40`
        }}
      >
        {/* 3D Highlight for roundness */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/10 to-black/30 pointer-events-none" />
        
        <div className="relative z-10 text-[#f4e4bc] flex flex-col items-center gap-1">
          <Stamp size={32} strokeWidth={2.5} />
          <span className="text-[10px] font-black uppercase tracking-widest leading-none opacity-90">
            Seal
          </span>
        </div>
      </motion.button>

      <motion.p 
        layout
        className="mt-6 font-mono text-xs text-[#5d4037] opacity-60 uppercase tracking-widest select-none"
      >
        {disabled ? "Signature Required" : "Click to Stamp"}
      </motion.p>
    </div>
  );
};

export default WaxSealButton;