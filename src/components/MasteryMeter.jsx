
import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Sparkles } from 'lucide-react';
import { getMasteryLevel } from '../utils/MasteryCalculator';

const MasteryMeter = ({ masteryScore, trend }) => {
  const { name, color } = getMasteryLevel(masteryScore);
  const isHighLevel = masteryScore >= 90;

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-[#efebe9]/50 rounded-lg border border-[#d7ccc8] shadow-inner">
      <div className="relative mb-2">
        {/* Ink Pot Visual */}
        <div className="w-16 h-16 rounded-full border-4 border-[#3e2723] bg-white flex items-center justify-center overflow-hidden shadow-lg relative">
             <motion.div 
               className="absolute bottom-0 left-0 right-0 w-full"
               initial={{ height: 0 }}
               animate={{ height: `${masteryScore}%`, backgroundColor: color }}
               transition={{ duration: 1.5, ease: "easeOut" }}
             />
             <span className={`relative z-10 font-playfair font-bold text-lg ${masteryScore > 50 ? 'text-white' : 'text-[#3e2723]'}`}>
               {masteryScore}%
             </span>
        </div>
        {isHighLevel && (
           <motion.div 
             animate={{ rotate: 360 }}
             transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
             className="absolute -top-1 -right-1 text-[#ffd700]"
           >
             <Sparkles size={16} fill="#ffd700" />
           </motion.div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <span className="font-garamond text-[#3e2723] uppercase tracking-widest text-xs font-bold">
          {name} Mastery
        </span>
        
        {trend === 'improving' && <TrendingUp size={14} className="text-green-600" />}
        {trend === 'declining' && <TrendingDown size={14} className="text-red-500" />}
        {trend === 'stable' && <Minus size={14} className="text-gray-500" />}
      </div>
      
      <p className="text-[10px] text-[#8d6e63] italic mt-1 text-center">
        {trend === 'improving' ? 'Your hand is growing steadier.' : 
         trend === 'declining' ? 'Consistency is drifting.' : 
         'Your form is established.'}
      </p>
    </div>
  );
};

export default MasteryMeter;
