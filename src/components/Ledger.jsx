import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Filter, ArrowUp, ArrowDown, Book, Award } from 'lucide-react';
import { useHistory } from '../context/HistoryContext';
import ThumbnailPreview from './ThumbnailPreview';
import TrophyCase from './TrophyCase';

const Ledger = ({ isOpen, onClose, onReplay, activeReplayId }) => {
  const { history } = useHistory();
  const [activeTab, setActiveTab] = useState('journal');
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [filter, setFilter] = useState('all'); 
  const [sortOrder, setSortOrder] = useState('newest');

  // Filter & Sort Logic
  const filteredHistory = useMemo(() => {
    let data = [...history];

    // 1. Filter
    if (filter !== 'all') {
      data = data.filter(entry => {
        if (filter === 'mythic') return entry.promptMetadata?.rarity === 'mythic';
        if (filter === 'rare') return entry.promptMetadata?.rarity === 'rare';
        if (filter === 'legacy') return entry.promptMetadata?.type === 'fixed_legacy';
        return true;
      });
    }

    // 2. Sort (assuming history comes in chronological order)
    if (sortOrder === 'newest') {
      return data.reverse(); 
    }
    return data;
  }, [history, filter, sortOrder]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-black/80 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-6xl h-[85vh] bg-[#f4e4bc] rounded shadow-2xl overflow-hidden flex flex-col border border-[#5d4037]"
        style={{ backgroundImage: `url("https://www.transparenttextures.com/patterns/aged-paper.png")` }}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-[#8d6e63]/30 bg-[#3e2723]/5">
            <div className="flex items-center gap-4">
                <h2 className="font-playfair text-2xl font-bold text-[#3e2723] tracking-widest uppercase">The Ledger</h2>
                <div className="h-6 w-px bg-[#8d6e63]/50 mx-2" />
                <div className="flex gap-2">
                    <TabButton active={activeTab === 'journal'} onClick={() => setActiveTab('journal')} icon={Book} label="Registry" />
                    <TabButton active={activeTab === 'trophy'} onClick={() => setActiveTab('trophy')} icon={Award} label="Trophies" />
                </div>
            </div>
            <button onClick={onClose} className="p-2 text-[#5d4037] hover:bg-[#3e2723]/10 rounded-full transition-colors"><X size={24} /></button>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
            {activeTab === 'journal' ? (
                <>
                    {/* Left Page: Grid */}
                    <div className="w-full md:w-2/3 flex flex-col border-r border-[#8d6e63]/30">
                        {/* Toolbar */}
                        <div className="p-3 flex justify-between items-center bg-[#f4e4bc] border-b border-[#8d6e63]/20">
                            <div className="flex gap-2">
                                <FilterButton active={filter === 'all'} onClick={() => setFilter('all')} label="All" />
                                <FilterButton active={filter === 'mythic'} onClick={() => setFilter('mythic')} label="Mythic" />
                                <FilterButton active={filter === 'rare'} onClick={() => setFilter('rare')} label="Rare" />
                            </div>
                            <button onClick={() => setSortOrder(s => s === 'newest' ? 'oldest' : 'newest')} className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#5d4037]">
                                {sortOrder === 'newest' ? <ArrowDown size={14}/> : <ArrowUp size={14}/>} {sortOrder}
                            </button>
                        </div>
                        
                        {/* Grid */}
                        <div className="flex-1 overflow-y-auto p-6 ledger-scrollbar">
                            <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-6 gap-4">
                                {filteredHistory.map((entry) => (
                                    <div 
                                        key={entry.id}
                                        onClick={() => setSelectedEntry(entry)}
                                        className={`
                                            relative aspect-square cursor-pointer transition-all duration-200 border-2 rounded bg-white p-2
                                            ${selectedEntry?.id === entry.id ? 'border-[#3e2723] ring-2 ring-[#3e2723]/20 scale-105 shadow-md z-10' : 'border-transparent hover:border-[#8d6e63]/50'}
                                            ${activeReplayId === entry.id ? 'ring-2 ring-green-500' : ''}
                                        `}
                                    >
                                        <ThumbnailPreview svgPath={entry.svgPath} inkColor={entry.inkColor} className="w-full h-full pointer-events-none" />
                                        {entry.promptMetadata?.rarity === 'mythic' && <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-yellow-500 shadow-sm animate-pulse" />}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Page: Details */}
                    <div className="w-full md:w-1/3 bg-[#ece0c6] flex flex-col border-l border-[#8d6e63]/10 shadow-inner relative z-10">
                        {selectedEntry ? (
                            <div className="p-8 flex flex-col h-full overflow-y-auto">
                                <div className="text-center mb-6">
                                    <p className="font-typewriter text-xs text-[#8d6e63] mb-2 uppercase tracking-widest">Entry #{selectedEntry.id.slice(0,6)}</p>
                                    <div className="w-48 h-48 mx-auto bg-white shadow-lg border border-[#d7ccc8] p-4 rounded-sm rotate-1 mb-6">
                                        <ThumbnailPreview svgPath={selectedEntry.svgPath} inkColor={selectedEntry.inkColor} className="w-full h-full" />
                                    </div>
                                    <h3 className="font-playfair text-xl font-bold text-[#3e2723] leading-tight mb-2">"{selectedEntry.promptTitle}"</h3>
                                </div>
                                
                                <div className="space-y-4 flex-1">
                                    <DetailBox title="Vibe Check">
                                        <div className="flex justify-between text-xs text-[#5d4037]">
                                            <span>Style</span><span className="font-bold">{selectedEntry.primaryStyle}</span>
                                        </div>
                                        <div className="flex justify-between text-xs text-[#5d4037] mt-1">
                                            <span>Confidence</span><span className="font-mono">{selectedEntry.styleConfidence}%</span>
                                        </div>
                                    </DetailBox>
                                    
                                    <DetailBox title="Components">
                                        <div className="flex flex-wrap gap-2">
                                            {selectedEntry.usedTags?.map(tag => (
                                                <span key={tag} className="text-[10px] px-2 py-1 bg-[#d7ccc8] text-[#5d4037] rounded-full font-mono">#{tag}</span>
                                            ))}
                                        </div>
                                    </DetailBox>
                                </div>

                                <button onClick={() => onReplay(selectedEntry.id)} className="mt-6 w-full py-3 bg-[#3e2723] text-[#f4e4bc] font-bold uppercase tracking-widest text-xs hover:bg-[#5d4037] transition-colors rounded shadow-lg">
                                    Replay Signature
                                </button>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-[#8d6e63] opacity-50 p-8 text-center">
                                <Search size={48} className="mb-4" />
                                <p className="font-playfair text-xl italic">Select a Record</p>
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <div className="w-full h-full overflow-hidden p-6 bg-[#e0f2f1]/20">
                    <TrophyCase />
                </div>
            )}
        </div>
      </motion.div>
    </div>
  );
};



export default Ledger;
