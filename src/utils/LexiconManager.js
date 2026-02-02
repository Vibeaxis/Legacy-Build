
import { LEXICONS, CORE_LEXICON, UNLOCKABLE_PACKS } from '../data/lexicons';

export const getCoreLexicon = () => {
  return CORE_LEXICON;
};

export const getUnlockedPacks = (signatureCount) => {
  return UNLOCKABLE_PACKS.filter(pack => signatureCount >= pack.unlockedAt);
};

export const getUnlockedLexicons = (signatureCount) => {
    // Wrapper for backward compatibility if needed, but primarily returns IDs
    const packs = getUnlockedPacks(signatureCount);
    return ["common", ...packs.map(p => p.id)];
};

export const getAvailableWords = (signatureCount, category) => {
  // Category should be 'nouns', 'verbs', or 'sentiments'
  const coreWords = CORE_LEXICON[category] || [];
  const unlockedPacks = getUnlockedPacks(signatureCount);
  const packWords = unlockedPacks.flatMap(pack => pack.words[category] || []);
  
  // Return unique words combining core and unlocked
  return [...new Set([...coreWords, ...packWords])];
};

export const selectPromptWords = (signatureCount) => {
    const unlockedPacks = getUnlockedPacks(signatureCount);
    const hasUnlockedPacks = unlockedPacks.length > 0;
    
    // Helper to pick word
    const pick = (category) => {
        const usePack = hasUnlockedPacks && Math.random() < 0.20; // 20% chance to use pack word
        
        if (usePack) {
            const pack = unlockedPacks[Math.floor(Math.random() * unlockedPacks.length)];
            const words = pack.words[category];
            if (words && words.length > 0) return words[Math.floor(Math.random() * words.length)];
        }
        
        // Default to Core (80% chance or if no packs)
        const core = CORE_LEXICON[category];
        return core[Math.floor(Math.random() * core.length)];
    };

    return {
        noun: pick('nouns'),
        verb: pick('verbs'),
        sentiment: pick('sentiments')
    };
};

export const checkNewUnlock = (previousCount, currentCount) => {
  // Check Packs
  return UNLOCKABLE_PACKS.find(pack => 
    previousCount < pack.unlockedAt && currentCount >= pack.unlockedAt
  ) || null;
};
