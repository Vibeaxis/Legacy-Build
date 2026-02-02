
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Stamp } from 'lucide-react';
import useAudio from '../hooks/useAudio';
import WaxDripAnimation from './WaxDripAnimation';
import { useSettings } from '../context/SettingsContext';

const WaxSealButton = ({ onSeal, waxColor = '#b71c1c', disabled = false }) => {
    const [isHeld, setIsHeld] = useState(false);
    const [progress, setProgress] = useState(0);
    const intervalRef = useRef(null);
    const { play: playThud } = useAudio('/assets/sounds/thunk.mp3', 'seal'); // Pass type 'seal'
    const { settings } = useSettings();
    
    // Check constraints
    const confirmBeforeSeal = settings.gameplay.confirmSeal;
    
    // Adjust hold duration by animation speed (slower animation = slower fill, logic inverse speed)
    // Actually, hold duration should probably remain constant in gameplay, but let's scale it for feel
    // If speed is 2x, hold is faster.
    const speed = settings.visual.animationSpeed || 1;
    const HOLD_DURATION = 1500 / speed;

    const startHold = (e) => {
        if (disabled) return;
        // e.preventDefault(); 
        setIsHeld(true);
        setProgress(0);

        const startTime = Date.now();
        intervalRef.current = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const newProgress = Math.min((elapsed / HOLD_DURATION) * 100, 100);
            setProgress(newProgress);
        }, 16);
    };

    const endHold = () => {
        if (disabled) return;
        if (intervalRef.current) clearInterval(intervalRef.current);
        
        setIsHeld(false);
        
        if (progress >= 100) {
            if (confirmBeforeSeal) {
                if (window.confirm("Seal this signature?")) {
                     playThud();
                     onSeal();
                }
            } else {
                playThud();
                onSeal();
            }
            setProgress(0);
        } else {
            setProgress(0);
        }
    };

    useEffect(() => {
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    return (
        <div className="relative flex flex-col items-center">
            <motion.div
                className="relative cursor-pointer select-none"
                onMouseDown={startHold}
                onMouseUp={endHold}
                onMouseLeave={endHold}
                onTouchStart={startHold}
                onTouchEnd={endHold}
                whileHover={{ scale: disabled ? 1 : 1.05 }}
                whileTap={{ scale: disabled ? 1 : 0.95 }}
            >
                 {/* Outer Ring / Progress Indicator */}
                 <svg className="w-24 h-24 absolute -top-2 -left-2 rotate-[-90deg] pointer-events-none z-0">
                    <circle
                        cx="48" cy="48" r="46"
                        stroke={waxColor}
                        strokeWidth="4"
                        fill="none"
                        opacity="0.2"
                    />
                    <motion.circle
                        cx="48" cy="48" r="46"
                        stroke={waxColor}
                        strokeWidth="4"
                        fill="none"
                        strokeDasharray="289" // 2 * pi * 46
                        strokeDashoffset={289 - (289 * progress) / 100}
                    />
                </svg>

                {/* Main Button Body */}
                <div 
                    className={`
                        w-20 h-20 rounded-full flex items-center justify-center shadow-lg relative overflow-hidden transition-colors
                        ${disabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#3e2723]'}
                    `}
                    style={{
                        boxShadow: isHeld 
                            ? `0 0 15px ${waxColor}, inset 0 0 10px rgba(0,0,0,0.5)` 
                            : '0 4px 6px rgba(0,0,0,0.3)'
                    }}
                >
                    {/* Wax Drip Animation Layer */}
                    <WaxDripAnimation waxColor={waxColor} isActive={isHeld} />

                    {/* Icon */}
                    <div className="relative z-20 text-[#f4e4bc] flex flex-col items-center">
                        <Stamp size={32} />
                        <span className="text-[10px] uppercase font-bold tracking-widest mt-1">
                            {progress >= 100 ? "Release" : "Hold"}
                        </span>
                    </div>

                    {/* Wax Pool Effect at bottom filling up */}
                    <motion.div 
                        className="absolute bottom-0 left-0 right-0 z-10 opacity-80"
                        style={{ backgroundColor: waxColor }}
                        initial={{ height: "0%" }}
                        animate={{ height: `${progress}%` }}
                    />
                </div>
            </motion.div>
            
            <p className="mt-4 font-mono text-xs text-[#5d4037] opacity-60">
                {disabled ? "Draw to seal" : "Hold to seal"}
            </p>
        </div>
    );
};

export default WaxSealButton;
