
export const calculateRecentMastery = (signatures, windowSize = 10) => {
  if (!signatures || signatures.length === 0) return 0;
  
  // Take the last N signatures
  const recent = signatures.slice(-windowSize);
  
  // Sum consistency scores
  const sum = recent.reduce((acc, sig) => acc + (sig.consistency || 0), 0);
  
  return Math.round(sum / recent.length);
};

export const getMasteryLevel = (masteryScore) => {
  if (masteryScore >= 90) return { name: "Gold", color: "#FFD700" }; // Gold
  if (masteryScore >= 70) return { name: "Silver", color: "#C0C0C0" }; // Silver
  if (masteryScore >= 40) return { name: "Ink", color: "#000000" }; // Black
  return { name: "Muddy", color: "#5d4037" }; // Muddy Gray/Brown
};

export const getMasteryTrend = (signatures, windowSize = 10) => {
  if (!signatures || signatures.length < windowSize) return "stable";

  const recent = signatures.slice(-windowSize);
  const midPoint = Math.floor(recent.length / 2);
  
  const firstHalf = recent.slice(0, midPoint);
  const secondHalf = recent.slice(midPoint);

  const avgFirst = firstHalf.reduce((acc, sig) => acc + (sig.consistency || 0), 0) / firstHalf.length;
  const avgSecond = secondHalf.reduce((acc, sig) => acc + (sig.consistency || 0), 0) / secondHalf.length;

  if (avgSecond > avgFirst + 3) return "improving";
  if (avgSecond < avgFirst - 3) return "declining";
  return "stable";
};
