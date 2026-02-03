import React from 'react';
import { motion } from 'framer-motion';
import { ACHIEVEMENTS } from '../data/achievements';
import { UNLOCKABLE_PACKS } from '../data/lexicons';
import MasteryMeter from './MasteryMeter';
import { 
  Award, PenTool, Scroll, Book, Activity, Target, Gem, Crown, 
  Sparkles, Feather, Leaf, Hammer, Moon, Lock, Unlock // <--- Added Unlock here
} from 'lucide-react';
import { useHistory } from '../context/HistoryContext';

const icons = {
  Award, PenTool, Scroll, Book, Activity, Target, Gem, Crown, Sparkles, Feather, Leaf, Hammer, Moon
};

const TrophyCase = () => {
  const { achievements, history, masteryHistory, unlockedLexicons } = useHistory();
  
  const currentMastery = masteryHistory.length > 0 ? masteryHistory[masteryHistory.length - 1] : 0;
  
  const trend = masteryHistory.length >= 2 
    ? (masteryHistory[masteryHistory.length - 1] > masteryHistory[masteryHistory.length - 2] ? 'improving' : 'stable')
    : 'stable';

  const recentHistory = [...history].reverse().slice(0, 24);

  return (
    <div className="h-full flex flex-col p-2 space-y-6">
       
       {/* --- SECTION 1: MASTERY --- */}
       <div className="bg-[#fff8e1]/50 p-4 rounded-xl border border-[#d7ccc8] shadow-sm">
          <h3 className="font-playfair text-xl text-[#3e2723] mb-4 text-center border-b border-[#3e2723]/20 pb-2">Mastery & Form</h3>
          <MasteryMeter masteryScore={currentMastery} trend={trend} />
          
          <div className="mt-4 h-16 flex items-end gap-1 justify-center px-4">
              {masteryHistory.map((val, idx) => (
                  <div 
                    key={idx} 
                    className="w-2 bg-[#8d6e63]/50 rounded-t-sm"
                    style={{ height: `${val}%` }}
                  />
              ))}
          </div>
       </div>

       {/* --- SECTION 2: MOOD TRACKER --- */}
       <div className="bg-[#fff8e1]/50 p-4 rounded-xl border border-[#d7ccc8] shadow-sm">
          <h3 className="font-playfair text-xl text-[#3e2723] mb-2 text-center border-b border-[#3e2723]/20 pb-2">Wax Seal Mood Tracker</h3>
          
          {recentHistory.length === 0 ? (
              <p className="text-center text-xs text-gray-500 italic">No seals recorded yet.</p>
          ) : (
            <div className="grid grid-cols-6 gap-2 mt-2">
                {recentHistory.map((entry) => (
                    <motion.div 
                        key={entry.id}
                        whileHover={{ scale: 1.2 }}
                        className="relative group aspect-square rounded-full shadow-inner border border-black/10 flex items-center justify-center cursor-help"
                        style={{ backgroundColor: entry.sealColor || '#5d4037' }}
                    >
                         <div className="absolute bottom-full mb-2 hidden group-hover:block bg-[#3e2723] text-[#f4e4bc] text-[10px] p-2 rounded whitespace-nowrap z-50">
                             <p className="font-bold">{entry.sentimentData?.dominantColor || 'Unknown'}</p>
                             <p className="opacity-75">Intensity: {entry.sentimentData?.intensity || '?'}</p>
                         </div>
                    </motion.div>
                ))}
            </div>
          )}
          <p className="text-[10px] text-center mt-2 text-[#5d4037] opacity-60">Recent emotional imprints</p>
       </div>

       {/* --- SECTION 3: LEXICONS (IMPROVED) --- */}
       <div className="bg-[#e0f2f1]/50 p-4 rounded-xl border border-[#b2dfdb] shadow-sm">
           <h3 className="font-playfair text-lg text-[#004d40] mb-3 text-center border-b border-[#004d40]/10 pb-2">
               Lexicon Field Guide
           </h3>
           
           <div className="space-y-2">
               {/* Core Lexicon Entry (Always Unlocked) */}
               <div className="flex items-start gap-3 p-3 rounded-lg bg-[#004d40]/5 border border-[#004d40]/10">
                   <div className="p-2 bg-[#004d40] text-white rounded-md mt-1">
                       <Book size={14} />
                   </div>
                   <div>
                       <h4 className="font-bold text-[#004d40] text-sm uppercase tracking-wide">Core Lexicon</h4>
                       <p className="text-xs text-[#004d40]/70 italic">The foundation of all language. Simple, grounded, and essential.</p>
                   </div>
               </div>

               {/* Unlockable Packs */}
               {UNLOCKABLE_PACKS.map(pack => {
                   // Check against your context
                   const isUnlocked = unlockedLexicons.includes(pack.id);
                   
                   return (
                       <div 
                           key={pack.id} 
                           className={`
                               flex items-start gap-3 p-3 rounded-lg border transition-all
                               ${isUnlocked 
                                   ? 'bg-[#004d40] text-[#e0f2f1] border-[#004d40] shadow-md' 
                                   : 'bg-white/40 text-[#004d40]/40 border-[#004d40]/10 border-dashed'}
                           `}
                       >
                          {/* Icon & Status */}
                          <div className={`p-2 rounded-md mt-1 ${isUnlocked ? 'bg-[#e0f2f1]/20 text-[#e0f2f1]' : 'bg-[#004d40]/5'}`}>
                               {isUnlocked ? <Unlock size={14} /> : <Lock size={14} />}
                          </div>

                          {/* Text Info */}
                          <div className="flex-1">
                               <div className="flex justify-between items-start">
                                   <h4 className={`font-bold text-sm uppercase tracking-wide ${isUnlocked ? 'text-[#e0f2f1]' : ''}`}>
                                       {pack.name}
                                   </h4>
                                   {!isUnlocked && (
                                       <span className="text-[10px] font-mono opacity-60">
                                           REQ: {pack.unlockedAt}
                                       </span>
                                   )}
                               </div>
                               
                               <p className={`text-xs italic mt-0.5 ${isUnlocked ? 'text-[#e0f2f1]/80' : 'opacity-60'}`}>
                                   {pack.description}
                               </p>
                          </div>
                       </div>
                   );
               })}
           </div>
       </div>

       {/* --- SECTION 4: ACHIEVEMENTS --- */}
       <div className="flex-1 overflow-y-auto pr-2 ledger-scrollbar mt-4">
          <h3 className="font-playfair text-xl text-[#3e2723] mb-4 text-center border-b border-[#3e2723]/20 pb-2">Seals of Merit</h3>
          <div className="grid grid-cols-2 gap-3">
             {ACHIEVEMENTS.map(ach => {
                 const isUnlocked = achievements.some(a => a.id === ach.id);
                 const Icon = icons[ach.icon] || Award;
                 
                 return (
                    <motion.div 
                        key={ach.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`
                            relative p-3 rounded-lg border flex flex-col items-center text-center gap-2
                            ${isUnlocked 
                                ? 'bg-[#efebe9] border-[#d7ccc8] shadow-sm' 
                                : 'bg-[#d7ccc8]/20 border-dashed border-[#a1887f]/30 grayscale opacity-70'}
                        `}
                    >
                        <div className={`
                            p-2 rounded-full 
                            ${isUnlocked ? 'bg-[#3e2723] text-[#ffd700]' : 'bg-[#bcaaa4] text-[#efebe9]'}
                        `}>
                            {isUnlocked ? <Icon size={20} /> : <Lock size={20} />}
                        </div>
                        <div>
                            <p className="font-playfair text-xs font-bold text-[#3e2723] leading-tight">{ach.name}</p>
                            <p className="font-garamond text-[10px] text-[#5d4037] leading-none mt-1">{ach.description}</p>
                        </div>
                    </motion.div>
                 );
             })}
          </div>
       </div>
    </div>
  );
};

export default TrophyCase;