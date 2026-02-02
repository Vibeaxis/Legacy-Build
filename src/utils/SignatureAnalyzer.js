
export const calculateVelocity = (pathLength, timeTaken) => {
  if (timeTaken <= 0) return 0;
  return pathLength / timeTaken; // pixels per millisecond
};

export const calculateComplexity = (pathData) => {
  const curves = (pathData.match(/Q/g) || []).length;
  const lines = (pathData.match(/L/g) || []).length;
  return curves + lines;
};

export const calculateDensity = (pathLength, boundingBox) => {
  const area = boundingBox.width * boundingBox.height;
  if (area <= 0) return 0;
  return pathLength / Math.sqrt(area);
};

export const calculateCurvature = (strokes) => {
  if (!strokes || strokes.length === 0) return 0;
  
  let totalCurvature = 0;
  let totalPoints = 0;

  strokes.forEach(stroke => {
      const points = stroke.points;
      if (points.length < 3) return;
      
      for (let i = 1; i < points.length - 1; i++) {
        const p1 = points[i-1];
        const p2 = points[i];
        const p3 = points[i+1];
        
        const angle1 = Math.atan2(p2.y - p1.y, p2.x - p1.x);
        const angle2 = Math.atan2(p3.y - p2.y, p3.x - p2.x);
        let diff = Math.abs(angle2 - angle1);
        if (diff > Math.PI) diff = 2 * Math.PI - diff;
        
        totalCurvature += diff;
      }
      totalPoints += points.length;
  });

  if (totalPoints === 0) return 0;
  // Normalize: average angle change per point * factor
  return Math.min(100, (totalCurvature / totalPoints) * 500);
};

export const calculatePenLifts = (strokes) => {
  return Math.max(0, strokes.length - 1);
};

export const calculateContinuityRatio = (strokes) => {
    if (!strokes || strokes.length <= 1) return 100;
    
    let strokeLen = 0;
    strokes.forEach(stroke => {
        const points = stroke.points;
        for(let i=1; i<points.length; i++) {
             const dx = points[i].x - points[i-1].x;
             const dy = points[i].y - points[i-1].y;
             strokeLen += Math.sqrt(dx*dx + dy*dy);
        }
    });

    let gapLen = 0;
    for(let i=1; i<strokes.length; i++) {
        const p1 = strokes[i-1].points[strokes[i-1].points.length-1];
        const p2 = strokes[i].points[0];
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        gapLen += Math.sqrt(dx*dx + dy*dy);
    }
    
    if (strokeLen + gapLen === 0) return 100;
    return (strokeLen / (strokeLen + gapLen)) * 100;
};

export const calculateConsistencyAngles = (strokes) => {
    // Check if stroke angles are consistent (e.g., similar slant)
    let angles = [];
    strokes.forEach(stroke => {
        const points = stroke.points;
        if (points.length < 2) return;
        // Overall stroke angle
        const start = points[0];
        const end = points[points.length-1];
        const angle = Math.atan2(end.y - start.y, end.x - start.x);
        angles.push(angle);
    });

    if (angles.length < 2) return 1; // Highly consistent if single stroke

    const mean = angles.reduce((a,b) => a+b, 0) / angles.length;
    const variance = angles.reduce((a,b) => a + Math.pow(b-mean, 2), 0) / angles.length;
    
    // Low variance = High consistency
    return 1 / (1 + variance * 10);
};

export const calculateVelocityVariance = (strokes) => {
    if (strokes.length < 2) return 0;
    
    const velocities = strokes.map(stroke => {
        const points = stroke.points;
        let dist = 0;
        for(let i=1; i<points.length; i++) dist += Math.hypot(points[i].x-points[i-1].x, points[i].y-points[i-1].y);
        const time = points[points.length-1].time - points[0].time;
        return time > 0 ? dist/time : 0;
    });

    const mean = velocities.reduce((a,b)=>a+b, 0)/velocities.length;
    const variance = velocities.reduce((a,b)=>a+Math.pow(b-mean, 2), 0)/velocities.length;
    return Math.sqrt(variance);
};

export const calculateScale = (boundingBox, canvasSize) => {
    if (!canvasSize || canvasSize.width === 0) return 'Medium';
    const boxArea = boundingBox.width * boundingBox.height;
    const canvasArea = canvasSize.width * canvasSize.height;
    const ratio = boxArea / canvasArea;
    
    if (ratio < 0.05) return 'Small';
    if (ratio > 0.25) return 'Large';
    return 'Medium';
};

export const calculatePlacement = (boundingBox, canvasSize) => {
    if (!canvasSize || canvasSize.width === 0) return 'Center';
    
    const centerX = boundingBox.x + boundingBox.width / 2;
    const centerY = boundingBox.y + boundingBox.height / 2;
    
    const canvasCenterX = canvasSize.width / 2;
    const canvasCenterY = canvasSize.height / 2;
    
    // Normalize -0.5 to 0.5
    const xDiff = (centerX - canvasCenterX) / canvasSize.width; 
    const yDiff = (centerY - canvasCenterY) / canvasSize.height; 
    
    let vertical = 'Centered';
    if (yDiff < -0.15) vertical = 'Top';
    if (yDiff > 0.15) vertical = 'Bottom';
    
    let horizontal = 'Center';
    if (xDiff < -0.15) horizontal = 'Left';
    if (xDiff > 0.15) horizontal = 'Right';
    
    if (vertical === 'Centered' && horizontal === 'Center') return 'Centered';
    if (vertical === 'Centered') return horizontal;
    if (horizontal === 'Center') return vertical;
    
    return `${vertical} ${horizontal}`;
};

export const assignStyleTag = (metrics) => {
  const { velocity, complexity, density, curvature, penLifts, consistencyAngles, velocityVariance } = metrics;
  
  let scores = {
      Whispered: 0,
      Architectural: 0,
      Flourished: 0,
      Staccato: 0,
      Monastic: 0
  };

  // Whispered
  if (velocity < 0.4) scores.Whispered += 30;
  if (complexity < 15) scores.Whispered += 30;
  if (density < 0.3) scores.Whispered += 40;

  // Architectural
  if (velocity >= 0.4 && velocity <= 0.7) scores.Architectural += 20;
  if (complexity >= 20 && complexity <= 40) scores.Architectural += 20;
  if (density > 0.6) scores.Architectural += 30;
  if (consistencyAngles > 0.8) scores.Architectural += 30;

  // Flourished
  if (velocity > 0.5 && velocity < 0.9) scores.Flourished += 20;
  if (complexity > 35) scores.Flourished += 30;
  if (curvature > 60) scores.Flourished += 50;

  // Staccato
  if (penLifts > 5) scores.Staccato += 60;
  if (velocityVariance > 0.2) scores.Staccato += 40; // Adjusted threshold
  if (complexity > 10) scores.Staccato += 10;

  // Monastic
  if (velocity < 0.5) scores.Monastic += 30;
  if (complexity < 20) scores.Monastic += 20;
  if (density < 0.4) scores.Monastic += 20;
  if (density < 0.5) scores.Monastic += 30; 

  let bestStyle = 'Monastic'; // Default
  let maxScore = -1;
  
  Object.entries(scores).forEach(([style, score]) => {
      if (score > maxScore) {
          maxScore = score;
          bestStyle = style;
      }
  });
  
  // Tie-breaker or fallback logic
  if (maxScore === 0) {
      if (velocity > 0.8) bestStyle = 'Flourished';
      else bestStyle = 'Monastic';
  }

  return {
      primaryStyle: bestStyle,
      styleConfidence: Math.min(100, Math.max(20, maxScore)),
  };
};

export const calculateConsistency = (currentMetrics, last3Signatures) => {
  if (!last3Signatures || last3Signatures.length === 0) return 100;

  let totalLength = 0;
  let totalArea = 0;
  let count = 0;

  last3Signatures.forEach(sig => {
      if (sig.metrics) {
          totalLength += sig.metrics.pathLength;
          totalArea += (sig.metrics.boundingBox.width * sig.metrics.boundingBox.height);
          count++;
      }
  });

  if (count === 0) return 100;

  const avgLength = totalLength / count;
  const avgArea = totalArea / count;

  const currentArea = currentMetrics.boundingBox.width * currentMetrics.boundingBox.height;

  // Calculate deviation (simplified)
  const lengthRatio = Math.min(currentMetrics.pathLength, avgLength) / Math.max(currentMetrics.pathLength, avgLength);
  const areaRatio = Math.min(currentArea, avgArea) / Math.max(currentArea, avgArea);

  const consistency = (lengthRatio + areaRatio) / 2;
  return Math.round(consistency * 100);
};
