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

  // SAFETY FIX: If parent doesn't pass isOpen, default to TRUE so it shows up.
  const showLedger = isOpen === undefined ? true : isOpen;

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

    // 2. Sort
    if (sortOrder === 'newest') {
      return [...data].reverse(); 
    }
    return data;
  }, [history, filter, sortOrder]);

  if (!showLedger) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 bg-black/80 backdrop-blur-sm">
      {/* Close on click outside */}
      <div className="absolute inset-0" onClick={onClose} />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-6xl h-[85vh] bg-[#f4e4bc] rounded shadow-2xl overflow-hidden flex flex-col border border-[#5d4037]"
        style={{ backgroundImage: `url("https://www.transparenttextures.com/patterns/aged-paper.png")` }}
      >
        {/* Header & Tabs */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-[#8d6e63]/30 bg-[#3e2723]/5">
            <div className="flex items-center gap-6">
                <h2 className="font-playfair text-2xl font-bold text-[#3e2723] tracking-widest uppercase">The Ledger</h2>
                
                {/* NAVIGATION TABS */}
                <div className="flex gap-2 bg-[#8d6e63]/10 p-1 rounded-lg">
                    <button 
                        onClick={() => setActiveTab('journal')}
                        className={`flex items-center gap-2 px-4 py-1.5 rounded text-xs uppercase font-bold tracking-widest transition-all
                            ${activeTab === 'journal' 
                                ? 'bg-[#3e2723] text-[#f4e4bc] shadow-md' 
                                : 'text-[#5d4037] hover:bg-[#3e2723]/10'}
                        `}
                    >
                        <Book size={14} /> Registry
                    </button>
                    <button 
                        onClick={() => setActiveTab('trophy')}
                        className={`flex items-center gap-2 px-4 py-1.5 rounded text-xs uppercase font-bold tracking-widest transition-all
                            ${activeTab === 'trophy' 
                                ? 'bg-[#3e2723] text-[#f4e4bc] shadow-md' 
                                : 'text-[#5d4037] hover:bg-[#3e2723]/10'}
                        `}
                    >
                        <Award size={14} /> Trophies
                    </button>
                </div>
            </div>

            <button onClick={onClose} className="p-2 text-[#5d4037] hover:bg-[#3e2723]/10 rounded-full transition-colors">
                <X size={24} />
            </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
            {activeTab === 'journal' ? (
                <>
                    {/* LEFT PAGE: GRID */}
                    <div className="w-full md:w-2/3 flex flex-col border-r border-[#8d6e63]/30">
                        {/* Filters Toolbar */}
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
                        
                        {/* Signature Grid */}
                        <div className="flex-1 overflow-y-auto p-6 ledger-scrollbar">
                            <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-6 gap-4">
                                {filteredHistory.map((entry) => {
                                    const isMythic = entry.promptMetadata?.rarity === 'mythic';
                                    const isLegacy = entry.promptMetadata?.type === 'fixed_legacy';
                                    
                                    return (
                                        <div 
                                            key={entry.id}
                                            onClick={() => setSelectedEntry(entry)}
                                            className={`
                                                relative aspect-square cursor-pointer transition-all duration-200 border-2 rounded bg-white p-2
                                                ${selectedEntry?.id === entry.id ? 'border-[#3e2723] ring-2 ring-[#3e2723]/20 scale-105 shadow-md z-10' : 'border-transparent hover:border-[#8d6e63]/50'}
                                                ${activeReplayId === entry.id ? 'ring-2 ring-green-500' : ''}
                                                ${isLegacy ? 'border-orange-400' : isMythic ? 'border-yellow-400' : ''}
                                            `}
                                        >
                                            <ThumbnailPreview 
                                                svgPath={entry.svgPath} 
                                                inkColor={entry.inkColor} 
                                                isReplaying={activeReplayId === entry.id}
                                                className="w-full h-full pointer-events-none" 
                                            />
                                            {isMythic && <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-yellow-500 shadow-sm animate-pulse" />}
                                        </div>
                                    );
                                })}
                            </div>
                            
                            {filteredHistory.length === 0 && (
                                <div className="flex flex-col items-center justify-center h-full text-[#8d6e63] opacity-50 min-h-[200px]">
                                    <Book size={48} className="mb-2 stroke-1" />
                                    <p className="font-typewriter text-sm">No records found.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT PAGE: INSPECTION */}
                    <div className="w-full md:w-1/3 bg-[#ece0c6] flex flex-col border-l border-[#8d6e63]/10 shadow-inner relative z-10">
                        {/* Background Texture Overlay */}
                        <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-multiply" style={{ backgroundImage: `url("https://www.transparenttextures.com/patterns/paper-fibers.png")` }} />

                        {selectedEntry ? (
                            <div className="p-8 flex flex-col h-full overflow-y-auto relative z-20">
                                <div className="text-center mb-6">
                                    <p className="font-typewriter text-xs text-[#8d6e63] mb-2 uppercase tracking-widest">
                                        Entry #{selectedEntry.id.substring(0,6)}
                                    </p>
                                    
                                    {/* Large Preview Card */}
                                    <div className="w-48 h-48 mx-auto bg-white shadow-lg border border-[#d7ccc8] p-4 rounded-sm rotate-1 mb-6">
                                        <ThumbnailPreview 
                                            svgPath={selectedEntry.svgPath} 
                                            inkColor={selectedEntry.inkColor} 
                                            className="w-full h-full" 
                                        />
                                    </div>
                                    <h3 className="font-playfair text-xl font-bold text-[#3e2723] leading-tight mb-2">
                                        "{selectedEntry.promptTitle}"
                                    </h3>
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
                                            {(!selectedEntry.usedTags || selectedEntry.usedTags.length === 0) && <span className="text-xs italic opacity-50">No tags</span>}
                                        </div>
                                    </DetailBox>
                                </div>

                                <button 
                                    onClick={() => onReplay(selectedEntry.id)} 
                                    className="mt-6 w-full py-3 bg-[#3e2723] text-[#f4e4bc] font-bold uppercase tracking-widest text-xs hover:bg-[#5d4037] transition-colors rounded shadow-lg"
                                >
                                    Replay Signature
                                </button>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-[#8d6e63] opacity-50 p-8 text-center relative z-20">
                                <Search size={48} className="mb-4 stroke-1" />
                                <p className="font-playfair text-xl italic">Select a Record</p>
                                <p className="text-xs font-typewriter mt-2 max-w-[200px]">Choose a signature from the registry to inspect its properties.</p>
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

// --- SUBCOMPONENTS ---

const FilterButton = ({ active, onClick, label }) => (
    <button 
        onClick={onClick}
        className={`px-3 py-1 rounded text-[10px] uppercase font-bold tracking-wider border transition-colors
            ${active 
                ? 'bg-[#5d4037] text-white border-[#5d4037]' 
                : 'bg-transparent text-[#5d4037] border-[#8d6e63]/30 hover:border-[#5d4037]'}
        `}
    >
        {label}
    </button>
);

const DetailBox = ({ title, children }) => (
    <div className="bg-[#f4e4bc] p-4 rounded border border-[#d7ccc8]">
        <h4 className="font-bold text-xs uppercase text-[#5d4037] mb-2 tracking-wide border-b border-[#8d6e63]/20 pb-1">
            {title}
        </h4>
        {children}
    </div>
);

export default Ledger;