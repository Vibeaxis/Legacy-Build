
export const SENTIMENT_COLORS = {
  RED: { hex: '#b71c1c', name: 'Passionate', keywords: ['fire', 'burn', 'blood', 'fierce', 'wild', 'sharp', 'rage', 'love', 'heat', 'intense', 'fast', 'scream', 'anger', 'brave', 'fight', 'war'] },
  BLUE: { hex: '#1a237e', name: 'Melancholy', keywords: ['sad', 'tear', 'rain', 'lost', 'cold', 'blue', 'fading', 'whisper', 'grief', 'alone', 'silent', 'deep', 'ocean', 'river', 'drift', 'cry'] },
  GOLD: { hex: '#ffb300', name: 'Hopeful', keywords: ['sun', 'light', 'bright', 'gold', 'shine', 'hope', 'joy', 'smile', 'warm', 'day', 'dawn', 'rise', 'glow', 'laugh', 'peace', 'glory'] },
  PURPLE: { hex: '#4a148c', name: 'Mystical', keywords: ['dream', 'night', 'star', 'void', 'magic', 'soul', 'spirit', 'purple', 'dark', 'mystery', 'shadow', 'moon', 'vision', 'secret', 'ether', 'phantom'] },
  GREEN: { hex: '#1b5e20', name: 'Natural', keywords: ['tree', 'leaf', 'root', 'grow', 'earth', 'green', 'forest', 'life', 'bloom', 'seed', 'moss', 'nature', 'heal', 'spring', 'garden', 'wild'] },
  GRAY: { hex: '#455a64', name: 'Contemplative', keywords: ['stone', 'gray', 'fog', 'mist', 'still', 'calm', 'quiet', 'dust', 'ash', 'old', 'ancient', 'wait', 'time', 'rock', 'iron', 'neutral'] }
};

export const analyzeSentiment = (promptWords) => {
  // promptWords is a string or array of words
  const words = Array.isArray(promptWords) ? promptWords : promptWords.toLowerCase().split(/\s+/);
  
  const scores = {
    RED: 0,
    BLUE: 0,
    GOLD: 0,
    PURPLE: 0,
    GREEN: 0,
    GRAY: 0
  };

  words.forEach(word => {
    for (const [key, data] of Object.entries(SENTIMENT_COLORS)) {
      if (data.keywords.some(k => word.includes(k))) {
        scores[key] += 1;
      }
    }
  });

  return scores;
};

export const determineSealColor = (sentimentScores) => {
  let maxScore = 0;
  let bestColor = SENTIMENT_COLORS.GRAY; // Default

  for (const [key, score] of Object.entries(sentimentScores)) {
    if (score > maxScore) {
      maxScore = score;
      bestColor = SENTIMENT_COLORS[key];
    } else if (score === maxScore && maxScore > 0) {
        // Tie-breaker: Randomize or stick with first found?
        // Let's bias slightly towards more "emotional" colors if tied with Gray
        if (key !== 'GRAY' && Math.random() > 0.5) {
            bestColor = SENTIMENT_COLORS[key];
        }
    }
  }

  // If absolutely no keywords matched, default to a random non-gray color for variety sometimes?
  // Or stick to Gray (Contemplative) which fits the theme well.
  // Let's add a bit of randomness if score is 0
  if (maxScore === 0) {
      const keys = Object.keys(SENTIMENT_COLORS);
      // Bias towards Gray/Blue/Purple for this app
      const randomKey = keys[Math.floor(Math.random() * keys.length)];
      return SENTIMENT_COLORS[randomKey];
  }

  return bestColor;
};

export const getSentimentIntensity = (promptText) => {
  // Simple heuristic: length of words + exclamation marks + specific intense words
  const words = promptText.split(' ');
  let intensity = 50; // Base
  
  if (promptText.includes('!')) intensity += 20;
  
  const intenseWords = ['wild', 'fierce', 'burn', 'scream', 'forever', 'never', 'always', 'broken', 'shatter'];
  words.forEach(w => {
      if (intenseWords.some(iw => w.toLowerCase().includes(iw))) intensity += 10;
  });

  return Math.min(100, Math.max(0, intensity));
};
