
import React from 'react';
import { motion } from 'framer-motion';
import { ACHIEVEMENTS } from '../data/achievements';
import { LEXICONS, UNLOCKABLE_PACKS } from '../data/lexicons';
import MasteryMeter from './MasteryMeter';
import { Award, PenTool, Scroll, Book, Activity, Target, Gem, Crown, Sparkles, Feather, Leaf, Hammer, Moon, Lock } from 'lucide-react';
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

  // Sort history for Mood Tracker (newest first for list, oldest for trends?)
  // Let's take last 20 for mood visualization
  const recentHistory = [...history].reverse().slice(0, 24);

  return (
    <div className="h-full flex flex-col p-2 space-y-6">
       {/* Top Section: Mastery */}
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

       {/* Mood Tracker Section */}
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
                         {/* Tooltip */}
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

       {/* Achievements Grid */}
       <div className="flex-1 overflow-y-auto pr-2 ledger-scrollbar">
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

       {/* Unlocked Lexicons List */}
       <div className="bg-[#e0f2f1]/50 p-4 rounded-xl border border-[#b2dfdb] shadow-sm mt-4">
           <h3 className="font-playfair text-lg text-[#004d40] mb-2 text-center">Known Tongues</h3>
           <div className="flex flex-wrap justify-center gap-2">
               {/* Always show Core */}
               <span className="text-[10px] px-2 py-1 rounded-full border bg-[#004d40] text-[#e0f2f1] border-[#004d40]">
                   Core Lexicon
               </span>

               {UNLOCKABLE_PACKS.map(pack => {
                   // Logic: if current signature count > unlockedAt or pack ID in unlockedLexicons context
                   const isUnlocked = unlockedLexicons.includes(pack.id);
                   return (
                       <span 
                           key={pack.id}
                           className={`
                               text-[10px] px-2 py-1 rounded-full border
                               ${isUnlocked 
                                   ? 'bg-[#004d40] text-[#e0f2f1] border-[#004d40]' 
                                   : 'bg-transparent text-[#004d40]/40 border-[#004d40]/20 dashed'}
                           `}
                       >
                           {pack.name}
                       </span>
                   );
               })}
           </div>
       </div>
    </div>
  );
};

export default TrophyCase;
