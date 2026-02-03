
import { LEXICONS, CORE_LEXICON, UNLOCKABLE_PACKS } from '../data/lexicons';
// Add this to your file (or a new data file)
const PROMPT_TEMPLATES = [
    // format: string with placeholders. 
    // keys must match your lexicon categories: {noun}, {verb}, {sentiment}
    
    "To {verb} a {sentiment} {noun}",       // "To forgive a quiet year"
    "The {noun} {verb} {sentiment}",        // "The archive fades sharply"
    "A memory of {sentiment} {noun}",       // "A memory of broken glass"
    "We {verb} the {noun}",                 // "We watched the horizon"
    "{sentiment} {noun} remains",           // "Silent dust remains"
    "Where the {noun} {verb}",              // "Where the memory sleeps"
];
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
    
    // 1. HELPER: Pick a random word for a category
    const pick = (category) => {
        // 30% chance to use a fancy pack word if available
        const usePack = hasUnlockedPacks && Math.random() < 0.30; 
        
        if (usePack) {
            const pack = unlockedPacks[Math.floor(Math.random() * unlockedPacks.length)];
            const words = pack.words[category];
            // Safety check: if pack has words, use one. Else fall back to core.
            if (words && words.length > 0) return words[Math.floor(Math.random() * words.length)];
        }
        
        // Fallback to Core
        const core = CORE_LEXICON[category];
        return core[Math.floor(Math.random() * core.length)];
    };

    // 2. DEFINE TEMPLATES (The "Structure" you were missing)
    const templates = [
        "To {verb} the {sentiment} {noun}",
        "A {noun} {verb} {sentiment}",
        "{sentiment} {noun} awaits",
        "The {noun} {verb}",
        "Remember the {sentiment} {noun}",
        "We {verb} in {sentiment}",
        "{verb} your {noun}"
    ];

    // 3. PICK & FILL
    const template = templates[Math.floor(Math.random() * templates.length)];
    
    // Replace placeholders with actual words
    // We use a regex to find anything inside {} and replace it using the 'pick' function
    const promptPhrase = template.replace(/{(noun|verb|sentiment)}/g, (match, category) => {
        // 'category' will be 'noun', 'verb', or 'sentiment'
        // We pluralize 'sentiments' because your data likely uses the plural key
        const dataKey = category === 'sentiment' ? 'sentiments' : category + 's'; 
        return pick(dataKey);
    });

    return {
        text: promptPhrase, // The actual readable string
        // We still return the raw words in case you want to tag/highlight them in UI
        components: {
            noun: pick('nouns'), 
            verb: pick('verbs'), 
            sentiment: pick('sentiments')
        }
    };
};

export const checkNewUnlock = (previousCount, currentCount) => {
  // Check Packs
  return UNLOCKABLE_PACKS.find(pack => 
    previousCount < pack.unlockedAt && currentCount >= pack.unlockedAt
  ) || null;
};
