
import { calculateVelocity, calculateComplexity } from './SignatureAnalyzer';

/**
 * Selects 1-3 signatures based on priority criteria:
 * 1. Mythic Rarity
 * 2. Fixed Legacy
 * 3. Consistency > 85
 * 4. Highest Consistency Scores
 */
export const selectLegacyMarks = (signatures) => {
  if (!signatures || signatures.length === 0) return [];

  // Create a copy to avoid mutating the original array
  const candidates = [...signatures];

  // Scoring function for sorting
  const getScore = (sig) => {
    let score = 0;
    const rarity = sig.promptMetadata?.rarity;
    const type = sig.promptMetadata?.type;
    const consistency = sig.consistency || 0;

    if (rarity === 'mythic') score += 1000;
    if (type === 'fixed_legacy') score += 500;
    if (consistency > 85) score += 100;
    score += consistency; // Add raw consistency as tie-breaker

    return score;
  };

  // Sort by score descending
  candidates.sort((a, b) => getScore(b) - getScore(a));

  // Take top 3
  const selected = candidates.slice(0, 3);

  // Sort selected chronologically for trend analysis
  return selected.sort((a, b) => a.id - b.id);
};

/**
 * Calculates telemetry metrics for a single signature
 */
export const calculateTelemetry = (signature) => {
  if (!signature) return null;

  const metrics = signature.metrics || {};
  
  // 1. Consistency
  const consistency = signature.consistency || 0;

  // 2. Pressure Variation (Estimated)
  // Heuristic: Higher velocity variance suggests dynamic pressure. 
  // Slower average velocity often correlates with higher pressure.
  const velocity = metrics.averageVelocity || 0;
  const variance = metrics.velocityVariance || 0;
  // Normalize to 0-100 scale.
  // Low velocity (heavy) + High variance (dynamic) = High Pressure Impact
  const pressureVariation = Math.min(100, Math.max(0, (variance * 1000) + ((1 - velocity) * 20)));

  // 3. Speed/Fluidity
  // Direct map from average velocity. 1.0 is very fast.
  const speedFluidity = Math.min(100, (velocity * 100));

  // 4. Complexity Score
  // Combine path length and discrete complexity count
  const rawComplexity = metrics.complexity || 0; // Curve/Line count
  // Normalize: 50 complexity points = 100 score roughly
  const complexityScore = Math.min(100, rawComplexity * 2);

  // 5. Confidence Level
  // Derived from consistency and stability (low pen lifts, high fluidity)
  const penLifts = metrics.penLifts || 0;
  const continuity = metrics.continuityRatio || 100;
  const confidence = (consistency * 0.4) + (speedFluidity * 0.3) + (continuity * 0.3) - (penLifts * 2);
  
  return {
    consistency: Math.round(consistency),
    pressureVariation: Math.round(pressureVariation),
    speedFluidity: Math.round(speedFluidity),
    complexityScore: Math.round(complexityScore),
    confidenceLevel: Math.round(Math.max(0, Math.min(100, confidence)))
  };
};

/**
 * Compares telemetry across selected marks to determine trends
 */
export const analyzeTrends = (selectedMarks) => {
  if (!selectedMarks || selectedMarks.length < 2) {
    return {
      consistencyTrend: 'stable',
      pressureTrend: 'stable',
      speedTrend: 'stable',
      complexityTrend: 'stable'
    };
  }

  const first = calculateTelemetry(selectedMarks[0]);
  const last = calculateTelemetry(selectedMarks[selectedMarks.length - 1]);

  const getTrend = (start, end, threshold = 5) => {
    const diff = end - start;
    if (diff > threshold) return 'increasing';
    if (diff < -threshold) return 'decreasing';
    return 'stable';
  };

  return {
    consistencyTrend: getTrend(first.consistency, last.consistency),
    pressureTrend: getTrend(first.pressureVariation, last.pressureVariation),
    speedTrend: getTrend(first.speedFluidity, last.speedFluidity),
    complexityTrend: getTrend(first.complexityScore, last.complexityScore)
  };
};

/**
 * Generates specific insights based on metrics and trends
 */
export const generateInsights = (selectedMarks, trends) => {
  const insights = [];
  const latest = calculateTelemetry(selectedMarks[selectedMarks.length - 1]);
  
  // Consistency Insight
  if (trends.consistencyTrend === 'increasing') {
    insights.push(`Your muscle memory is locking in. Consistency has improved by ${Math.round((latest.consistency - calculateTelemetry(selectedMarks[0]).consistency))}% across these marks.`);
  } else if (latest.consistency > 85) {
    insights.push(`You have achieved a Master's stability. Your consistency remains exceptionally high at ${latest.consistency}%.`);
  } else {
    insights.push("Your hand is still searching for its true form. Variation remains high.");
  }

  // Speed/Confidence Insight
  if (trends.speedTrend === 'increasing' && latest.confidenceLevel > 70) {
    insights.push("You are trusting your reflexes more. Velocity has increased, signaling growing confidence.");
  } else if (latest.speedFluidity < 30) {
    insights.push("You are drawing with deliberation and weight, prioritizing precision over speed.");
  }

  // Complexity/Style Insight
  if (trends.complexityTrend === 'decreasing') {
    insights.push("You are simplifying. Unnecessary flourishes are being shed in favor of efficiency.");
  } else if (latest.complexityScore > 70) {
    insights.push("Your signature is evolving into an intricate seal, rich with detail and structure.");
  }

  // Pressure Insight
  if (trends.pressureTrend === 'increasing') {
    insights.push("Your strokes are becoming more dynamic, showing a wider range of pressure and emphasis.");
  }

  // Fallback
  if (insights.length < 3) {
    insights.push(`Your mark has established a distinct ${latest.confidenceLevel > 80 ? 'commanding' : 'fluid'} presence on the page.`);
  }

  return insights.slice(0, 5);
};

/**
 * Orchestrates full report generation
 */
export const generateReport = (signatures) => {
  const selectedMarks = selectLegacyMarks(signatures);
  const trends = analyzeTrends(selectedMarks);
  const insights = generateInsights(selectedMarks, trends);
  
  // Generate telemetry for charts
  const markTelemetry = selectedMarks.map(sig => ({
    id: sig.id,
    title: sig.promptTitle,
    ...calculateTelemetry(sig)
  }));

  const summary = `Analysis of ${signatures.length} signatures reveals a ${trends.consistencyTrend} consistency trend. Your hand is ${trends.speedTrend === 'increasing' ? 'accelerating' : 'settling'}, while the structural complexity of your mark is ${trends.complexityTrend === 'increasing' ? 'growing' : (trends.complexityTrend === 'decreasing' ? 'refining' : 'holding steady')}.`;

  return {
    selectedMarks: selectedMarks,
    markTelemetry: markTelemetry,
    evolutionMetrics: trends,
    insights: insights,
    summary: summary,
    timestamp: Date.now()
  };
};
