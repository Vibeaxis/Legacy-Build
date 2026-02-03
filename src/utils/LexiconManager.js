
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
    // This logic mixes the "Core" words with any "Pack" words you've unlocked
    const pick = (category) => {
        // 30% chance to use a fancy pack word if available
        const usePack = hasUnlockedPacks && Math.random() < 0.30; 
        
        if (usePack) {
            const pack = unlockedPacks[Math.floor(Math.random() * unlockedPacks.length)];
            const words = pack.words[category]; // e.g. pack.words.nouns
            
            // Safety: If pack has words, return one. Else fallback.
            if (words && words.length > 0) {
                return words[Math.floor(Math.random() * words.length)];
            }
        }
        
        // Default to Core Lexicon
        const core = CORE_LEXICON[category];
        return core[Math.floor(Math.random() * core.length)];
    };

    // 2. DEFINE TEMPLATES
    // These ensure grammar is correct.
    // {noun} = a person/place/thing
    // {verb} = an action
    // {sentiment} = an adverb/adjective describing how it happens
    const templates = [
        "To {verb} a {sentiment} {noun}",       // "To find a quiet home"
        "The {noun} {verb} {sentiment}",        // "The mountain rises fiercely"
        "A memory of {sentiment} {noun}",       // "A memory of distant stars"
        "We {verb} the {noun}",                 // "We build the bridge"
        "{sentiment}, the {noun} {verb}",       // "Quietly, the river flows"
        "Where the {noun} {verb}",              // "Where the shadow falls"
        "A {noun} to {verb}"                    // "A key to unlock"
    ];

    // 3. PICK & FILL
    const template = templates[Math.floor(Math.random() * templates.length)];
    
    // Pick the words first so we can return them as components too
    const n = pick('nouns');
    const v = pick('verbs');
    const s = pick('sentiments');

    // Replace placeholders with the picked words
    const promptPhrase = template
        .replace('{noun}', n)
        .replace('{verb}', v)
        .replace('{sentiment}', s);

    return {
        text: promptPhrase, // The readable sentence: "The mountain rises fiercely"
        
        // We return the raw components in case your UI wants to color-code them
        // (e.g. make nouns blue, verbs red)
        components: {
            noun: n,
            verb: v,
            sentiment: s
        }
    };
};

export const checkNewUnlock = (previousCount, currentCount) => {
  // Check Packs
  return UNLOCKABLE_PACKS.find(pack => 
    previousCount < pack.unlockedAt && currentCount >= pack.unlockedAt
  ) || null;
};
