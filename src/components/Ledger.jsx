
import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHistory } from '../context/HistoryContext';
import ThumbnailPreview from './ThumbnailPreview';
import TrophyCase from './TrophyCase';
import { Tag, Scroll, Award } from 'lucide-react';

const Ledger = ({ onReplay, activeReplayId, vibeTier }) => {
  const { history } = useHistory();
  const scrollRef = useRef(null);
  const [activeTab, setActiveTab] = useState('journal'); // 'journal' or 'trophy'

  useEffect(() => {
    if (activeTab === 'journal' && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, activeTab]);

  return (
    <motion.div 
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
      className="fixed left-0 top-0 bottom-0 w-80 bg-[#f4e4bc] border-r-4 border-[#3e2723] shadow-2xl z-20 flex flex-col pointer-events-auto transform -rotate-1 origin-top-left"
      style={{
        backgroundImage: `url("https://www.transparenttextures.com/patterns/aged-paper.png"), linear-gradient(to right, #e3d2a5, #f4e4bc 20%, #f4e4bc 90%, #dcc795)`,
      }}
    >
      <div className="p-6 border-b-2 border-double border-[#5d4037] bg-opacity-50">
        <h2 className="font-playfair text-3xl font-bold text-[#3e2723] text-center tracking-widest uppercase mb-1">The Ledger</h2>
        <p className="font-garamond italic text-[#5d4037] text-center text-sm">Official Registry of Marks</p>
        
        {/* Tabs */}
        <div className="flex justify-center mt-4 gap-2">
            <button 
                onClick={() => setActiveTab('journal')}
                className={`flex items-center gap-1 px-3 py-1 rounded text-xs uppercase font-bold tracking-wider transition-colors
                    ${activeTab === 'journal' 
                        ? 'bg-[#3e2723] text-[#f4e4bc]' 
                        : 'bg-[#d7ccc8] text-[#5d4037] hover:bg-[#bcaaa4]'}
                `}
            >
                <Scroll size={12} /> Journal
            </button>
            <button 
                onClick={() => setActiveTab('trophy')}
                className={`flex items-center gap-1 px-3 py-1 rounded text-xs uppercase font-bold tracking-wider transition-colors
                    ${activeTab === 'trophy' 
                        ? 'bg-[#3e2723] text-[#f4e4bc]' 
                        : 'bg-[#d7ccc8] text-[#5d4037] hover:bg-[#bcaaa4]'}
                `}
            >
                <Award size={12} /> Trophy Case
            </button>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 ledger-scrollbar relative"
        style={{
          boxShadow: 'inset 0 0 40px rgba(62, 39, 35, 0.1)'
        }}
      >
        {activeTab === 'journal' ? (
            <div className="grid grid-cols-4 gap-3 content-start">
                <AnimatePresence>
                {history.length === 0 && (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 0.5 }}
                        className="col-span-4 font-typewriter text-[#5d4037] text-center mt-10 text-sm"
                    >
                    No records found.
                    <br/>
                    Awaiting signature...
                    </motion.div>
                )}

                {history.map((entry, index) => {
                    const isMythic = entry.promptMetadata?.rarity === 'mythic';
                    const isRare = entry.promptMetadata?.rarity === 'rare';
                    const isLegacy = entry.promptMetadata?.type === 'fixed_legacy';
                    const tags = entry.usedTags || [];
                    
                    // Check continuity with previous entry
                    const prevEntry = index > 0 ? history[index-1] : null;
                    const prevTags = prevEntry?.usedTags || [];
                    const sharedTags = tags.filter(t => prevTags.includes(t));
                    const hasContinuity = sharedTags.length > 0;

                    return (
                    <motion.div
                        key={entry.id}
                        layout
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 20 }}
                        className="relative group cursor-pointer"
                        onClick={() => onReplay(entry.id)}
                    >
                        {/* Continuity Line */}
                        {hasContinuity && (
                            <div className="absolute -left-1.5 top-1/2 w-3 h-0.5 bg-[#8d6e63] opacity-40 -translate-y-1/2 z-0" />
                        )}

                        <ThumbnailPreview 
                            svgPath={entry.svgPath} 
                            inkColor={entry.inkColor} 
                            isReplaying={activeReplayId === entry.id}
                            className={`
                                ${isLegacy ? "border-[#ff9800] ring-2 ring-[#ff9800]/50" : 
                                isMythic ? "border-[#ffd700] ring-1 ring-[#ffd700]/50" : 
                                isRare ? "border-gray-400" : ""}
                            `}
                        />
                        
                        {/* Badge */}
                        {(isMythic || isLegacy) && <div className={`absolute -top-1 -right-1 w-2 h-2 rounded-full shadow-md animate-pulse ${isLegacy ? 'bg-[#ff9800]' : 'bg-[#ffd700]'}`} />}
                        
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-3 bg-[#3e2723] text-[#f4e4bc] text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity w-64 pointer-events-none z-50 border border-[#8d6e63] shadow-lg">
                            <div className={`font-bold mb-1 font-playfair leading-tight ${isLegacy ? 'text-[#ff9800]' : isMythic ? 'text-[#ffd700]' : 'text-[#ffcc80]'}`}>
                            "{entry.promptTitle}"
                            </div>
                            
                            {entry.promptMetadata && (
                                <div className="mb-2 text-[9px] text-gray-400 italic border-b border-gray-600 pb-1">
                                    {isLegacy ? 'LEGACY PROMPT' : `${entry.promptMetadata.category}-weighted`}
                                    {entry.promptMetadata.threadID && <span className="block text-[#e0e0e0]">Thread: {entry.promptMetadata.threadID}</span>}
                                </div>
                            )}

                            {/* Tags Display */}
                            {tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-2">
                                    {tags.map(tag => (
                                        <span key={tag} className={`text-[8px] px-1 rounded ${sharedTags.includes(tag) ? 'bg-[#ffcc80] text-[#3e2723]' : 'bg-[#5d4037] text-[#bcaaa4]'}`}>
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}

                            <div className="italic text-[11px] text-gray-300 mb-1">
                            {entry.secondaryStyleLabel ? `${entry.secondaryStyleLabel} ` : ''}{entry.primaryStyle || entry.styleTag}
                            </div>
                            
                            <div className="flex justify-between items-center text-[9px] text-gray-500 border-t border-gray-600 pt-1 mt-1">
                                <span>Conf: {entry.styleConfidence || '?'}%</span>
                            </div>
                        </div>
                    </motion.div>
                    );
                })}
                </AnimatePresence>
            </div>
        ) : (
            <TrophyCase />
        )}
      </div>

      <div className="p-4 border-t border-[#8d6e63] bg-[#efebe9] bg-opacity-30">
        <div className="w-full h-1 bg-[#3e2723] opacity-20 mb-1"></div>
        <div className="w-full h-px bg-[#3e2723] opacity-20"></div>
        <p className="text-center font-typewriter text-[10px] text-[#5d4037] mt-2 opacity-60">CONFIDENTIAL - EYES ONLY</p>
      </div>
    </motion.div>
  );
};

export default Ledger;
