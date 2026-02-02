
import { 
  TEMPORAL_SENTIMENTS
} from './SentimentLexicon';
import { THREAD_FOLLOWUPS, THREAD_KEYWORDS } from './ThreadFollowups';
import { FIXED_LEGACY_PROMPTS } from './FixedLegacyPrompts';
import { selectPromptWords } from './LexiconManager';

// Vibe tiers kept for UI compatibility
export const VIBE_TIERS = {
  METHODICAL: 'Methodical',
  RAW: 'Raw',
  ASPIRATIONAL: 'Aspirational'
};

const CATEGORIES = {
  NOSTALGIA: { name: 'Nostalgia', vibeTier: VIBE_TIERS.METHODICAL },
  AMBITION: { name: 'Ambition', vibeTier: VIBE_TIERS.ASPIRATIONAL },
  DOMESTICITY: { name: 'Domesticity', vibeTier: VIBE_TIERS.METHODICAL },
  SOLITUDE: { name: 'Solitude', vibeTier: VIBE_TIERS.RAW },
  CREATION: { name: 'Creation', vibeTier: VIBE_TIERS.ASPIRATIONAL }
};

const getRandomItem = (arr) => {
    if (!arr || arr.length === 0) return "something";
    return arr[Math.floor(Math.random() * arr.length)];
};

export const generateFixedLegacyPrompt = () => {
    return getRandomItem(FIXED_LEGACY_PROMPTS);
};

// Helper: Detect Thread
export const detectThread = (promptText) => {
  if (!promptText) return null;
  const lowerText = promptText.toLowerCase();
  
  for (const [threadID, keywords] of Object.entries(THREAD_KEYWORDS)) {
    if (keywords.some(k => lowerText.includes(k.toLowerCase()))) {
      return threadID;
    }
  }
  return null;
};

// Helper: Check if Thread is Active
export const isThreadActive = (threadID, activeThreadID) => {
  if (!threadID || !activeThreadID) return false;
  return threadID === activeThreadID;
};

// Helper: Get Thread Followup
export const getThreadFollowup = (threadID) => {
  const followups = THREAD_FOLLOWUPS[threadID];
  if (!followups) return null;
  
  const text = getRandomItem(followups);
  return { 
    prompt: text, 
    metadata: {
      category: 'Thread',
      threadID: threadID,
      rarity: 'rare', 
      components: { action: 'Thread', object: 'Followup', sentiment: threadID }
    }
  };
};

export const PromptAssembler = (primaryStyle, continuityModifier, scaleStr, consistencyScore = 50, lastUsedTags = [], signatureCount = 0) => {
  
  // 10% chance for Fixed Legacy Prompt
  if (Math.random() < 0.10) {
      const fixedPrompt = generateFixedLegacyPrompt();
      return {
          prompt: fixedPrompt.text,
          vibeTier: VIBE_TIERS.RAW, // Fixed prompts feel Raw/Mythic
          metadata: {
              category: 'Legacy',
              rarity: fixedPrompt.rarity,
              type: fixedPrompt.type
          }
      };
  }

  // 1. Calculate Weights for Vibe/Category (Standard Logic)
  let weights = {
    [CATEGORIES.NOSTALGIA.name]: 0,
    [CATEGORIES.AMBITION.name]: 0,
    [CATEGORIES.DOMESTICITY.name]: 0,
    [CATEGORIES.SOLITUDE.name]: 0,
    [CATEGORIES.CREATION.name]: 0
  };

  switch (primaryStyle) {
    case 'Whispered': weights[CATEGORIES.SOLITUDE.name] += 60; weights[CATEGORIES.NOSTALGIA.name] += 40; break;
    case 'Architectural': weights[CATEGORIES.AMBITION.name] += 50; weights[CATEGORIES.CREATION.name] += 50; break;
    case 'Flourished': weights[CATEGORIES.AMBITION.name] += 40; weights[CATEGORIES.CREATION.name] += 40; weights[CATEGORIES.DOMESTICITY.name] += 20; break;
    case 'Staccato': weights[CATEGORIES.SOLITUDE.name] += 50; weights[CATEGORIES.CREATION.name] += 50; break;
    case 'Monastic': weights[CATEGORIES.SOLITUDE.name] += 50; weights[CATEGORIES.NOSTALGIA.name] += 30; weights[CATEGORIES.DOMESTICITY.name] += 20; break;
    default: Object.keys(weights).forEach(k => weights[k] = 20); break;
  }

  // Select Category
  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
  let randomVal = Math.random() * totalWeight;
  let selectedCategoryName = Object.keys(weights)[0];
  
  for (const [name, weight] of Object.entries(weights)) {
    randomVal -= weight;
    if (randomVal <= 0) { selectedCategoryName = name; break; }
  }

  const categoryKey = Object.keys(CATEGORIES).find(key => CATEGORIES[key].name === selectedCategoryName);
  const selectedCategory = CATEGORIES[categoryKey];

  // 2. Fetch Words using new Selection Logic (80/20 Core/Pack)
  const { noun, verb, sentiment } = selectPromptWords(signatureCount);

  const promptString = `${verb} ${noun} ${sentiment}`;
  
  // Detect Thread
  const detectedThread = detectThread(promptString);

  return {
    prompt: promptString,
    vibeTier: selectedCategory.vibeTier,
    metadata: {
      category: selectedCategory.name,
      styleInfluence: primaryStyle,
      scaleInfluence: scaleStr,
      threadID: detectedThread,
      rarity: 'common',
      type: "template",
      usedTags: [],
      components: {
        action: verb,
        object: noun,
        sentiment: sentiment
      }
    }
  };
};

export const getAdaptivePrompt = () => {
  return PromptAssembler('Monastic', 'Fluid', 'Medium', 50, [], 0);
};

export const getAdaptivePromptWithSentiment = (metrics, styleData, consistency, lastUsedTags = [], signatureCount = 0) => {
  const primaryStyle = styleData?.primaryStyle || 'Monastic';
  const continuityLabel = styleData?.secondaryStyleLabel || 'Fluid';
  const scale = metrics?.scale || 'Medium';

  return PromptAssembler(primaryStyle, continuityLabel, scale, consistency, lastUsedTags, signatureCount);
};
