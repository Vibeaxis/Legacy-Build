import React, { useEffect, useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHistory } from '../context/HistoryContext';
import ThumbnailPreview from './ThumbnailPreview';
import TrophyCase from './TrophyCase';
import { 
    Scroll, 
    Award, 
    BookOpen, 
    X, 
    ChevronRight, 
    Search, 
    ArrowDownUp, 
    Sparkles 
} from 'lucide-react';

const Ledger = ({ onReplay, activeReplayId, vibeTier }) => {
  const { history } = useHistory();
  const scrollRef = useRef(null);
  
  // State for Modal, Tabs, and Filters
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('journal'); // 'journal' or 'trophy'
  const [searchTerm, setSearchTerm] = useState('');
  const [sortType, setSortType] = useState('newest'); // 'newest', 'oldest', 'quality', 'rarity'

  // Scroll to bottom only on initial open if sorting is default
  useEffect(() => {
    if (isOpen && activeTab === 'journal' && scrollRef.current && sortType === 'newest') {
      // Small timeout to ensure DOM is rendered
      setTimeout(() => {
          if (scrollRef.current) scrollRef.current.scrollTop = 0; // Newest is at top now
      }, 100);
    }
  }, [isOpen, activeTab, sortType]);

  // Handle closing via Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  // --- Filtering & Sorting Logic ---
  const processedHistory = useMemo(() => {
      let data = [...history];

      // 1. Filter
      if (searchTerm) {
          const lowerTerm = searchTerm.toLowerCase();
          data = data.filter(entry => 
            entry.promptTitle.toLowerCase().includes(lowerTerm) ||
            (entry.primaryStyle && entry.primaryStyle.toLowerCase().includes(lowerTerm)) || 
            (entry.usedTags && entry.usedTags.some(t => t.toLowerCase().includes(lowerTerm)))
          );
      }

      // 2. Sort
      data.sort((a, b) => {
          switch(sortType) {
              case 'newest': return b.id - a.id;
              case 'oldest': return a.id - b.id;
              case 'quality': return (b.styleConfidence || 0) - (a.styleConfidence || 0);
              case 'rarity': 
                  const getRarityWeight = (r) => {
                      if (r === 'mythic') return 3;
                      if (r === 'rare') return 2;
                      return 1;
                  };
                  const rA = getRarityWeight(a.promptMetadata?.rarity);
                  const rB = getRarityWeight(b.promptMetadata?.rarity);
                  return rB - rA || b.id - a.id; // Fallback to time
              default: return b.id - a.id;
          }
      });

      return data;
  }, [history, searchTerm, sortType]);

  const handleEntryClick = (id) => {
      onReplay(id);
      setIsOpen(false); // <--- CLOSES MODAL AUTOMATICALLY
  };

  return (
    <>
      {/* --- 1. THE TINY LEFT TOGGLE (Visible when closed) --- */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            whileHover={{ x: 5 }}
            transition={{ duration: 0.3 }}
            onClick={() => setIsOpen(true)}
            className="fixed left-0 top-1/2 -translate-y-1/2 z-40 bg-[#3e2723] text-[#f4e4bc] p-3 rounded-r-lg shadow-xl border-y border-r border-[#5d4037] cursor-pointer hover:bg-[#5d4037] group"
          >
            <div className="flex flex-col items-center gap-2">
              <BookOpen size={20} />
              <span className="text-[10px] uppercase font-bold writing-vertical-lr tracking-widest opacity-80 group-hover:opacity-100">
                Ledger
              </span>
              <ChevronRight size={14} className="animate-pulse" />
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* --- 2. THE MODAL WRAPPER --- */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* A. Backdrop (Click to close) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
            />

            {/* B. The Ledger Panel */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 bottom-0 w-80 bg-[#f4e4bc] border-r-4 border-[#3e2723] shadow-2xl z-50 flex flex-col pointer-events-auto"
              style={{
                backgroundImage: `url("https://www.transparenttextures.com/patterns/aged-paper.png"), linear-gradient(to right, #e3d2a5, #f4e4bc 20%, #f4e4bc 90%, #dcc795)`,
              }}
            >
              {/* Header / Close Button Area */}
              <div className="relative p-6 border-b-2 border-double border-[#5d4037] bg-opacity-50">
                
                {/* Close Button */}
                <button 
                  onClick={() => setIsOpen(false)}
                  className="absolute top-4 right-4 text-[#5d4037] hover:text-[#3e2723] hover:rotate-90 transition-transform duration-300"
                >
                  <X size={20} />
                </button>

                <h2 className="font-playfair text-3xl font-bold text-[#3e2723] text-center tracking-widest uppercase mb-1 pt-2">The Ledger</h2>
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

              {/* SEARCH & SORT CONTROLS (Only for Journal) */}
              {activeTab === 'journal' && (
                <div className="px-4 py-3 border-b border-[#8d6e63] bg-[#efebe9]/50 flex flex-col gap-2">
                    {/* Search Input */}
                    <div className="relative">
                        <input 
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search marks..."
                            className="w-full bg-transparent border-b border-[#8d6e63] text-[#3e2723] text-xs py-1 pl-6 focus:outline-none focus:border-[#3e2723] placeholder-[#8d6e63]/50 font-typewriter"
                        />
                        <Search size={12} className="absolute left-0 top-1/2 -translate-y-1/2 text-[#8d6e63]" />
                    </div>

                    {/* Sort Buttons */}
                    <div className="flex justify-between items-center">
                        <span className="text-[9px] uppercase tracking-widest text-[#5d4037] font-bold">Sort By:</span>
                        <div className="flex gap-1">
                             <button 
                                onClick={() => setSortType('newest')}
                                title="Time"
                                className={`p-1 rounded ${sortType === 'newest' || sortType === 'oldest' ? 'bg-[#3e2723] text-[#f4e4bc]' : 'text-[#5d4037] hover:bg-[#d7ccc8]'}`}
                            >
                                <ArrowDownUp size={12} />
                             </button>
                             <button 
                                onClick={() => setSortType('quality')}
                                title="Confidence"
                                className={`p-1 rounded ${sortType === 'quality' ? 'bg-[#3e2723] text-[#f4e4bc]' : 'text-[#5d4037] hover:bg-[#d7ccc8]'}`}
                            >
                                <Award size={12} />
                             </button>
                             <button 
                                onClick={() => setSortType('rarity')}
                                title="Rarity"
                                className={`p-1 rounded ${sortType === 'rarity' ? 'bg-[#3e2723] text-[#f4e4bc]' : 'text-[#5d4037] hover:bg-[#d7ccc8]'}`}
                            >
                                <Sparkles size={12} />
                             </button>
                        </div>
                    </div>
                </div>
              )}

              {/* Scrollable Content */}
              <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 ledger-scrollbar relative"
                style={{
                  boxShadow: 'inset 0 0 40px rgba(62, 39, 35, 0.1)'
                }}
              >
                {activeTab === 'journal' ? (
                  <div className="grid grid-cols-4 gap-3 content-start">
                    <AnimatePresence mode='popLayout'>
                      {processedHistory.length === 0 && (
                        <motion.div 
                          initial={{ opacity: 0 }} 
                          animate={{ opacity: 0.5 }}
                          className="col-span-4 font-typewriter text-[#5d4037] text-center mt-10 text-sm"
                        >
                          {searchTerm ? 'No matches found.' : 'No records found.'}
                        </motion.div>
                      )}

                      {processedHistory.map((entry, index) => {
                        const isMythic = entry.promptMetadata?.rarity === 'mythic';
                        const isRare = entry.promptMetadata?.rarity === 'rare';
                        const isLegacy = entry.promptMetadata?.type === 'fixed_legacy';
                        const tags = entry.usedTags || [];
                        
                        // Check continuity (only visual relevant if sorted by time)
                        // If sorting by quality/rarity, continuity lines look weird, so we hide them unless sorting by ID
                        const isTimeSorted = sortType === 'newest' || sortType === 'oldest';
                        const prevEntry = index > 0 ? processedHistory[index-1] : null;
                        const prevTags = prevEntry?.usedTags || [];
                        const sharedTags = tags.filter(t => prevTags.includes(t));
                        const hasContinuity = isTimeSorted && sharedTags.length > 0;

                        return (
                          <motion.div
                            key={entry.id}
                            layout
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ type: "spring", stiffness: 200, damping: 20 }}
                            className="relative group cursor-pointer"
                            onClick={() => handleEntryClick(entry.id)}
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
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-3 bg-[#3e2723] text-[#f4e4bc] text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity w-64 pointer-events-none z-[60] border border-[#8d6e63] shadow-lg">
                              <div className={`font-bold mb-1 font-playfair leading-tight ${isLegacy ? 'text-[#ff9800]' : isMythic ? 'text-[#ffd700]' : 'text-[#ffcc80]'}`}>
                                "{entry.promptTitle}"
                              </div>
                              
                              {entry.promptMetadata && (
                                <div className="mb-2 text-[9px] text-gray-400 italic border-b border-gray-600 pb-1">
                                  {isLegacy ? 'LEGACY PROMPT' : `${entry.promptMetadata.category}-weighted`}
                                  {entry.promptMetadata.threadID && <span className="block text-[#e0e0e0]">Thread: {entry.promptMetadata.threadID}</span>}
                                </div>
                              )}

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

              {/* Footer */}
              <div className="p-4 border-t border-[#8d6e63] bg-[#efebe9] bg-opacity-30">
                <div className="w-full h-1 bg-[#3e2723] opacity-20 mb-1"></div>
                <div className="w-full h-px bg-[#3e2723] opacity-20"></div>
                <p className="text-center font-typewriter text-[10px] text-[#5d4037] mt-2 opacity-60">CONFIDENTIAL - EYES ONLY</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Ledger;