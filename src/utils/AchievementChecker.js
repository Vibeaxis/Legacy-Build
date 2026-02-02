
import { ACHIEVEMENTS } from '../data/achievements';

/**
 * Checks all achievements against current state
 * Returns array of newly earned achievements
 */
export const checkAchievements = (signature, history, unlockedLexicons, currentAchievements) => {
  const earnedIds = currentAchievements.map(a => a.id);
  const newEarned = [];
  const signatureCount = history.length;

  ACHIEVEMENTS.forEach(achievement => {
    // Skip if already earned
    if (earnedIds.includes(achievement.id)) return;

    let passed = false;

    switch (achievement.conditionType) {
      case 'count':
        passed = signatureCount >= achievement.threshold;
        break;
        
      case 'consistency':
        passed = (signature.consistency || 0) >= achievement.threshold;
        break;
        
      case 'rarity':
        passed = signature.promptMetadata?.rarity === achievement.target;
        break;
        
      case 'type':
        passed = signature.promptMetadata?.type === achievement.target;
        break;
        
      case 'lexicon_unlock':
        passed = unlockedLexicons.includes(achievement.target);
        break;
        
      case 'lexicon_mix':
        // Check if words from different lexicons are present in prompt
        // Simplified check based on promptMetadata if we store origin
        // Or check unlocked count if assuming mix is possible with >1 unlocked
        if (achievement.target === 'mixed') {
           // Heuristic: If we have > 1 lexicon unlocked, we are "weaving" narratives implicitly
           // Better: check if we have > 1 lexicon unlocked.
           passed = unlockedLexicons.length >= 2;
        }
        break;
        
      default:
        passed = false;
    }

    if (passed) {
      newEarned.push({
        id: achievement.id,
        earnedAt: Date.now()
      });
    }
  });

  return newEarned;
};
