
import React from 'react';
import { motion } from 'framer-motion';
import { useSettings } from '../context/SettingsContext';

const WaxDripAnimation = ({ waxColor, isActive }) => {
  const { settings } = useSettings();
  const speed = settings?.visual?.animationSpeed || 1;
  const reducedMotion = settings?.accessibility?.reducedMotion || false;

  if (reducedMotion) {
      // Static representation for reduced motion
      return isActive ? (
           <div className="absolute inset-0 z-10 rounded-full flex items-end justify-center pb-2 pointer-events-none">
               <div style={{ backgroundColor: waxColor, width: '20%', height: '80%', borderRadius: '10px' }} />
           </div>
      ) : null;
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-10 rounded-full">
      {isActive && (
        <svg viewBox="0 0 100 100" className="w-full h-full opacity-90">
            {/* Main Drip */}
            <motion.path
                d="M50 0 C 60 10, 65 30, 50 100"
                fill={waxColor}
                initial={{ d: "M50 0 C 55 5, 55 10, 50 10" }}
                animate={{ 
                    d: [
                        "M50 0 C 55 5, 55 10, 50 10", 
                        "M50 0 C 65 20, 65 40, 50 60", 
                        "M50 0 C 70 40, 70 80, 50 100" 
                    ] 
                }}
                transition={{ duration: 1.5 / speed, ease: "easeIn" }}
            />
            
            {/* Side Splatters */}
            <motion.circle
                cx="50" cy="10" r="0"
                fill={waxColor}
                animate={{ cy: 90, r: 8, opacity: [1, 1, 0] }}
                transition={{ duration: 1.2 / speed, delay: 0.2 / speed, ease: "easeIn" }}
            />
             <motion.circle
                cx="50" cy="10" r="0"
                fill={waxColor}
                animate={{ cy: 85, r: 5, opacity: [1, 1, 0], x: -15 }}
                transition={{ duration: 1.4 / speed, delay: 0.4 / speed, ease: "easeIn" }}
            />
             <motion.circle
                cx="50" cy="10" r="0"
                fill={waxColor}
                animate={{ cy: 95, r: 6, opacity: [1, 1, 0], x: 10 }}
                transition={{ duration: 1.3 / speed, delay: 0.3 / speed, ease: "easeIn" }}
            />
        </svg>
      )}
    </div>
  );
};

export default WaxDripAnimation;
