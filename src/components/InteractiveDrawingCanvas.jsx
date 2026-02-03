
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, animate } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { BookOpen } from 'lucide-react';
import PromptDisplay from './PromptDisplay';
import WaxSealButton from './WaxSealButton';
import Ledger from './Ledger';
import StyleToastNotification from './StyleToastNotification';
import StrokeReport from './StrokeReport';
import AnimatedBackground from './AnimatedBackground';
import AchievementToast from './AchievementToast';
import SettingsButton from './SettingsButton';
import SettingsModal from './SettingsModal';
import { useHistory } from '../context/HistoryContext';
import { useSettings } from '../context/SettingsContext'; // Added
import { 
    calculateVelocity, 
    calculateComplexity, 
    calculateDensity, 
    assignStyleTag, 
    calculateConsistency,
    calculateCurvature,
    calculatePenLifts,
    calculateContinuityRatio,
    calculateConsistencyAngles,
    calculateVelocityVariance,
    calculateScale,
    calculatePlacement
} from '../utils/SignatureAnalyzer';
import { 
    getAdaptivePrompt, 
    getAdaptivePromptWithSentiment, 
    VIBE_TIERS,
    getThreadFollowup,
    isThreadActive
} from '../utils/AdaptivePromptEngine';
import { generateReport } from '../utils/StrokeTelemetryAnalyzer';
import AtmosphereController from '../utils/AtmosphereController';
import { analyzeSentiment, determineSealColor } from '../utils/SentimentAnalyzer';

const InteractiveDrawingCanvas = () => {
  const [currentStroke, setCurrentStroke] = useState([]);
  const [allStrokes, setAllStrokes] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [inkColor, setInkColor] = useState('#2c3e50'); 
  const [promptData, setPromptData] = useState({ prompt: 'Sign the Declaration', vibeTier: VIBE_TIERS.METHODICAL, metadata: {} });
  const [isStampPressed, setIsStampPressed] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false); // Settings Modal State
  
  // Real-time ink flow state
  const [inkFlowParams, setInkFlowParams] = useState({ blurValue: 1, opacity: 1 });
  const [currentVelocity, setCurrentVelocity] = useState(0);

  // Signature Metrics State
  const [startTime, setStartTime] = useState(null);
  
  // Toast State
  const [toastVisible, setToastVisible] = useState(false);
  const [currentStyleData, setCurrentStyleData] = useState({});
  
  // Replay State
  const [replayMode, setReplayMode] = useState(false);
  const [activeReplayId, setActiveReplayId] = useState(null);
  const [replayData, setReplayData] = useState(null);

  // Report State
  const [showReport, setShowReport] = useState(false);

  const svgRef = useRef(null);
  const lastPointTime = useRef(0);
  
  const { 
    addSignature, 
    history, 
    currentThread, 
    lastUsedTags, 
    setLastUsedTags,
    reportGenerated,
    setReportGenerated,
    generatedReport,
    setGeneratedReport,
    recentAchievementsQueue,
    clearAchievementQueue
  } = useHistory();
  
  const { settings } = useSettings(); // Use settings

  // Inkwell Color Palette
  const colorPalette = [
    { hex: '#2c3e50', name: 'Midnight Blue' }, 
    { hex: '#800020', name: 'Oxblood Red' }, 
    { hex: '#2F4F4F', name: 'Forest Green' }, 
    { hex: '#4B0082', name: 'Imperial Purple' },
    { hex: '#000000', name: 'Coal Black' }
  ];
  
  const [colorIndex, setColorIndex] = useState(0);

  const getLegacyVibeTier = (tier) => {
    switch(tier) {
        case VIBE_TIERS.RAW: return 'Eldritch';
        case VIBE_TIERS.ASPIRATIONAL: return 'Majestic';
        default: return 'Bureaucratic'; 
    }
  };

  const legacyVibe = getLegacyVibeTier(promptData.vibeTier);

  // Calculate Wax Color for Current Prompt
  const currentWaxColor = useMemo(() => {
    const sentiment = analyzeSentiment(promptData.prompt);
    const colorData = determineSealColor(sentiment);
    return colorData.hex;
  }, [promptData.prompt]);

  useEffect(() => {
    const initialData = getAdaptivePrompt();
    setPromptData(initialData);
    AtmosphereController.setVibeTier(getLegacyVibeTier(initialData.vibeTier));
  }, []);

  useEffect(() => {
    AtmosphereController.setVibeTier(legacyVibe);
  }, [legacyVibe]);

  const getNextColor = () => {
    const nextIndex = (colorIndex + 1) % colorPalette.length;
    setColorIndex(nextIndex);
    return colorPalette[nextIndex];
  };

  const calculateInkFlowFilter = (velocity) => {
    if (velocity < 0.05) {
      return { blurValue: 2.5, opacity: 1.1, effect: 'soaking' };
    }
    if (velocity > 0.15) {
      return { blurValue: 0.5, opacity: 0.95, effect: 'flowing', tapering: true };
    }
    return { blurValue: 1, opacity: 1, effect: 'balanced' };
  };
  
  const getStrokeStyle = (points) => {
      if (points.length < 2) return 3;
      
      let totalDist = 0;
      let totalTime = points[points.length-1].time - points[0].time;
      
      for(let i=1; i<points.length; i++) {
          const dx = points[i].x - points[i-1].x;
          const dy = points[i].y - points[i-1].y;
          totalDist += Math.sqrt(dx*dx + dy*dy);
      }
      
      const velocity = totalDist / (totalTime || 1); 
      
      let width = Math.max(1, Math.min(6, 8 - velocity * 5)); 

      if (velocity > 0.15) {
        width = Math.max(0.5, 3 - (velocity * 8)); 
      } else if (velocity < 0.05) {
        width = Math.min(8, 4 + (1 / (velocity + 0.1)));
      }

      return width;
  };

  const pathToString = (points) => {
    if (points.length < 2) return '';
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];
      const controlX = (current.x + next.x) / 2;
      const controlY = (current.y + next.y) / 2;
      path += ` Q ${current.x} ${current.y} ${controlX} ${controlY}`;
    }
    if (points.length > 1) {
      const last = points[points.length - 1];
      path += ` L ${last.x} ${last.y}`;
    }
    return path;
  };

  const getPointerPosition = (e) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      time: Date.now()
    };
  };

  const handlePointerDown = (e) => {
    if (replayMode) return;
    e.preventDefault();
    const point = getPointerPosition(e);
    if (point) {
      if (allStrokes.length === 0 && currentStroke.length === 0) {
          setStartTime(Date.now());
          AtmosphereController.init();
      }
      setIsDrawing(true);
      setCurrentStroke([point]);
      lastPointTime.current = Date.now();
      setInkFlowParams({ blurValue: 1, opacity: 1 }); 
    }
  };

  const handlePointerMove = (e) => {
    if (replayMode) return;
    e.preventDefault();
    if (!isDrawing) return;
    
    const point = getPointerPosition(e);
    if (point) {
      const lastPoint = currentStroke[currentStroke.length-1];
      const dx = point.x - (lastPoint?.x || 0);
      const dy = point.y - (lastPoint?.y || 0);
      const dist = Math.sqrt(dx*dx + dy*dy);
      const timeDelta = point.time - (lastPoint?.time || point.time - 1);
      
      const velocity = dist / (timeDelta || 1); 
      setCurrentVelocity(velocity);

      const flow = calculateInkFlowFilter(velocity);
      setInkFlowParams(prev => ({
          ...prev, 
          blurValue: flow.blurValue,
          opacity: flow.opacity
      }));

      AtmosphereController.playInkSound(dist);

      setCurrentStroke(prev => [...prev, point]);
    }
  };

  const handlePointerUp = (e) => {
    if (replayMode) return;
    e.preventDefault();
    if (!isDrawing) return;
    
    if (currentStroke.length > 0) {
      const strokeWidth = getStrokeStyle(currentStroke);
      setAllStrokes(prev => [...prev, {
        points: currentStroke,
        color: inkColor,
        width: strokeWidth,
        id: Date.now()
      }]);
    }
    setCurrentStroke([]);
    setIsDrawing(false);
  };

  const animateDryingEffect = () => {
    if (!svgRef.current) return;
    const paths = svgRef.current.querySelectorAll('path');
    if (paths.length > 0) {
        const lastPath = paths[paths.length - 1];
        animate(lastPath, {
            filter: ["brightness(1.2) saturate(1.2)", "brightness(0.8) saturate(0.9)"]
        }, { duration: 0.4, ease: "easeInOut" });
    }
  };

  const handleSealComplete = () => {
    if (allStrokes.length === 0 || replayMode) return;
    
    setIsStampPressed(true);
    // Sound played inside WaxSealButton
    animateDryingEffect();
    setTimeout(() => setIsStampPressed(false), 200);
    
    const endTime = Date.now();
    const timeTaken = startTime ? (endTime - startTime) : 1000;
    const combinedPath = allStrokes.map(stroke => pathToString(stroke.points)).join(' ');
    
    const tempSvgPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    tempSvgPath.setAttribute("d", combinedPath);
    const pathLength = tempSvgPath.getTotalLength() || 1;
    
    const allPoints = allStrokes.flatMap(s => s.points);
    const xs = allPoints.map(p => p.x);
    const ys = allPoints.map(p => p.y);
    const boundingBox = { 
        x: Math.min(...xs),
        y: Math.min(...ys),
        width: Math.max(...xs) - Math.min(...xs), 
        height: Math.max(...ys) - Math.min(...ys) 
    };

    // Metrics
    const velocity = calculateVelocity(pathLength, timeTaken);
    const complexity = calculateComplexity(combinedPath);
    const density = calculateDensity(pathLength, boundingBox);
    const curvature = calculateCurvature(allStrokes);
    const penLifts = calculatePenLifts(allStrokes);
    const continuityRatio = calculateContinuityRatio(allStrokes);
    const consistencyAngles = calculateConsistencyAngles(allStrokes);
    const velocityVariance = calculateVelocityVariance(allStrokes);

    const canvasRect = svgRef.current ? svgRef.current.getBoundingClientRect() : { width: 800, height: 600 };
    const scale = calculateScale(boundingBox, canvasRect);
    const placement = calculatePlacement(boundingBox, canvasRect);

    const { primaryStyle, styleConfidence } = assignStyleTag({
        velocity, complexity, density, curvature, penLifts, consistencyAngles, velocityVariance 
    });

    const last3 = history.slice(-3);
    const consistency = calculateConsistency({ pathLength, boundingBox }, last3);

    const fullMetrics = { 
        pathLength, boundingBox, averageVelocity: velocity, curvature, penLifts,
        continuityRatio, scale, placement, styleConfidence, velocityVariance, complexity
    };

    const secondaryStyleLabel = continuityRatio > 80 ? 'Fluid' : (continuityRatio < 40 ? 'Fragmented' : '');
    const displayStyle = secondaryStyleLabel ? `${secondaryStyleLabel} ${primaryStyle}` : primaryStyle;

    // Save with Wax Color
    addSignature(
        combinedPath, 
        inkColor, 
        promptData.prompt, 
        primaryStyle, 
        fullMetrics, 
        consistency,
        {
            styleConfidence, penLifts, continuityRatio, scale, placement,
            promptMetadata: promptData.metadata,
            sealColor: currentWaxColor
        }
    );
    
    // Update Memory with Tags
    if (promptData.metadata?.usedTags) {
        setLastUsedTags(promptData.metadata.usedTags);
    }

    // Toast
    setCurrentStyleData({
        styleTag: primaryStyle,
        secondaryStyle: displayStyle,
        styleConfidence,
        scale,
        placement,
        threadID: promptData.metadata?.threadID,
        rarity: promptData.metadata?.rarity,
        promptText: promptData.prompt
    });
    setToastVisible(true);

    // Reset & Next Prompt Logic
    setTimeout(() => {
        setAllStrokes([]);
        setCurrentStroke([]);
        
        const savedThreadID = promptData.metadata?.threadID;
        let nextData = null;

        if (savedThreadID && isThreadActive(savedThreadID, currentThread) && Math.random() > 0.3) {
            const followup = getThreadFollowup(savedThreadID);
            if (followup) {
                 nextData = {
                     prompt: followup.prompt,
                     vibeTier: promptData.vibeTier, 
                     metadata: followup.metadata
                 };
            }
        }

      // ... previous manual logic ...

        if (!nextData) {
            // UPDATED: Now passing 'currentThread' as the final argument
            // This ensures the engine knows we are inside a thread and generates relevant follow-ups
             nextData = getAdaptivePromptWithSentiment(
                fullMetrics,
                { primaryStyle, secondaryStyleLabel }, 
                consistency,
                lastUsedTags,
                history.length,
                currentThread // <--- ADD THIS!
            );
        }
        
        setPromptData(nextData);
        
        const nextCol = getNextColor();
        setInkColor(nextCol.hex);
        setStartTime(null);
    }, 600);
  };

  const replaySignature = (historyId) => {
    const record = history.find(h => h.id === historyId);
    if (!record) return;
    setReplayMode(true);
    setActiveReplayId(historyId);
    setReplayData(record);
    setAllStrokes([]);
    setCurrentStroke([]);
  };

  const exitReplay = () => {
      setReplayMode(false);
      setActiveReplayId(null);
      setReplayData(null);
  };

  const handleGenerateReport = () => {
    const report = generateReport(history);
    setGeneratedReport(report);
    setReportGenerated(true);
    setShowReport(true);
  };

  const handleAchievementClose = (id) => {
    clearAchievementQueue();
  };

  const canViewReport = history.length >= 30 && !reportGenerated;

  // Use CSS variable for scaling from settings
  const containerStyle = {
      transform: `scale(var(--ui-scale))`,
      transformOrigin: 'top center'
  };

  return (
    <motion.div 
      className="min-h-screen w-full flex flex-row overflow-hidden relative font-serif"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      style={containerStyle}
    >
      <Helmet>
        <title>The Writing Desk | Interactive Calligraphy</title>
        <meta name="description" content="Step into a historical writing desk environment." />
      </Helmet>
      
      {/* Settings UI */}
      <SettingsButton onClick={() => setIsSettingsOpen(true)} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      <StyleToastNotification 
        styleTag={currentStyleData.styleTag} 
        secondaryStyle={currentStyleData.secondaryStyle}
        styleConfidence={currentStyleData.styleConfidence}
        scale={currentStyleData.scale}
        placement={currentStyleData.placement}
        threadID={currentStyleData.threadID}
        rarity={currentStyleData.rarity}
        promptText={currentStyleData.promptText}
        isVisible={toastVisible} 
        onClose={() => setToastVisible(false)} 
      />
      
      <AchievementToast 
         achievements={recentAchievementsQueue} 
         onClose={handleAchievementClose} 
      />

      <StrokeReport 
        report={generatedReport} 
        isOpen={showReport} 
        onClose={() => setShowReport(false)} 
      />

      <AnimatedBackground />

      <div className="relative z-20 hidden md:block w-80 h-full">
          <Ledger onReplay={replaySignature} activeReplayId={activeReplayId} vibeTier={legacyVibe} />
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-between min-h-screen py-8 px-4 ml-0 md:ml-12">
          
          <motion.div 
            id="desk-container"
            animate={isStampPressed ? { x: [-1, 1, -1, 1, 0], y: [0, 1, 0] } : {}}
            transition={{ duration: 0.15, ease: "easeInOut" }}
            className={`w-full h-full flex flex-col items-center justify-between transition-shadow duration-150 ${isStampPressed ? 'drop-shadow-2xl' : ''}`}
          >
              <div className="py-6 mt-4 w-full text-center min-h-[160px] flex items-center justify-center relative">
                <AnimatePresence>
                    {canViewReport && (
                        <motion.button
                            initial={{ opacity: 0, y: -20, scale: 0.8 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            onClick={handleGenerateReport}
                            className="absolute top-0 right-0 md:right-10 bg-[#ff9800] text-[#3e2723] px-4 py-2 rounded-full shadow-lg flex items-center gap-2 font-bold uppercase tracking-wider text-xs border-2 border-[#3e2723] hover:bg-[#ffcc80] transition-colors z-50 animate-bounce"
                        >
                            <BookOpen size={16} />
                            Read Your Story
                        </motion.button>
                    )}
                </AnimatePresence>

                {replayMode && replayData ? (
                     <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center gap-2"
                     >
                         <h2 className="font-playfair text-2xl text-[#bcaaa4] italic">Replaying from Archives</h2>
                         <p className="font-playfair text-4xl text-[#eaddcf] font-bold">"{replayData.promptTitle}"</p>
                         <div className="flex flex-col items-center text-[#ffcc80] italic text-sm gap-1">
                            <p>Style: {replayData.styleTag}</p>
                            {replayData.promptMetadata && (
                                <p className="text-[#8d6e63] text-xs opacity-80">
                                   ({replayData.promptMetadata.category}-weighted, {replayData.promptMetadata.styleInfluence} influence)
                                </p>
                            )}
                         </div>
                         <button onClick={exitReplay} className="mt-2 px-4 py-1 text-xs border border-[#8d6e63] text-[#bcaaa4] rounded hover:bg-[#3e2723]/30 transition-colors">Stop Replay</button>
                     </motion.div>
                ) : (
                    <PromptDisplay 
                        prompt={promptData.prompt} 
                        vibeTier={promptData.vibeTier} 
                        threadID={promptData.metadata?.threadID}
                        rarity={promptData.metadata?.rarity}
                        type={promptData.metadata?.type}
                    />
                )}
              </div>

              <div className="flex-1 flex items-center justify-center w-full max-w-5xl my-4 relative">
                <div className="absolute inset-0 rounded-lg bg-white/5 blur-3xl opacity-20 pointer-events-none"></div>
                <div className={`relative w-full h-[500px] ${replayMode ? 'cursor-default' : 'cursor-none'}`}>
                  <svg
                    ref={svgRef}
                    className={`w-full h-full touch-none ${!replayMode && 'cursor-crosshair'}`}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerLeave={handlePointerUp}
                    style={{ 
                        touchAction: 'none',
                        filter: `drop-shadow(2px 2px 2px rgba(0,0,0,0.4))` 
                    }}
                  >
                    <defs>
                       <filter id="dynamic-ink-flow">
                          <feGaussianBlur in="SourceGraphic" stdDeviation={inkFlowParams.blurValue} />
                       </filter>
                      <filter id="ink-bleed">
                        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" result="noise" />
                        <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" />
                      </filter>
                    </defs>

                    <AnimatePresence mode='wait'>
                        {replayMode && replayData ? (
                            <motion.path
                                key={replayData.id}
                                d={replayData.svgPath}
                                stroke={replayData.inkColor}
                                strokeWidth="4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                fill="none"
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 0.9 }}
                                transition={{ type: "spring", stiffness: 50, damping: 15, duration: 2.5 }}
                            />
                        ) : (
                            <>
                                {allStrokes.map((stroke) => (
                                    <motion.path
                                    key={stroke.id}
                                    d={pathToString(stroke.points)}
                                    stroke={stroke.color}
                                    strokeWidth={stroke.width}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    fill="none"
                                    style={{ 
                                        opacity: 1
                                    }}
                                    initial={{ pathLength: 0, opacity: 0 }}
                                    animate={{ pathLength: 1, opacity: 1 }}
                                    />
                                ))}
                                {currentStroke.length > 0 && (
                                    <path
                                        d={pathToString(currentStroke)}
                                        stroke={inkColor}
                                        strokeWidth={getStrokeStyle(currentStroke)}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        fill="none"
                                        style={{ 
                                            filter: 'url(#dynamic-ink-flow)',
                                            opacity: inkFlowParams.opacity
                                        }}
                                    />
                                )}
                            </>
                        )}
                    </AnimatePresence>
                  </svg>
                </div>
              </div>

              <div className="py-8 pb-12 h-40 flex items-center justify-center relative">
                {!replayMode && (
                    <>
                         <WaxSealButton 
                            onSeal={handleSealComplete} 
                            disabled={allStrokes.length === 0} 
                            waxColor={currentWaxColor}
                        />
                         
                         {/* Consistency Score Indicator */}
                         {settings.gameplay.showConsistency && isDrawing && (
                             <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="absolute right-0 top-1/2 -translate-y-1/2 p-2 bg-black/40 rounded text-xs text-[#8d6e63]"
                             >
                                 Speed: {currentVelocity.toFixed(2)}
                             </motion.div>
                         )}
                    </>
                )}
              </div>
          </motion.div>

          <div className="absolute bottom-8 right-8 pointer-events-none opacity-90 hidden md:block">
             <div className="relative w-32 h-32">
                <img 
                    src="https://images.unsplash.com/photo-1478641300939-0ec5188d3802?q=80&w=200&auto=format&fit=crop" 
                    alt="Inkwell"
                    className="w-full h-full object-contain drop-shadow-2xl opacity-80 mix-blend-hard-light mask-image-gradient"
                    style={{ maskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)' }}
                />
                {!replayMode && (
                    <motion.div 
                        className="absolute top-1/2 left-1/2 w-8 h-8 rounded-full blur-xl transform -translate-x-1/2 -translate-y-1/2"
                        animate={{ backgroundColor: inkColor }}
                        transition={{ duration: 1 }}
                    />
                )}
             </div>
          </div>
        </div>
      </motion.div>
  );
};

export default InteractiveDrawingCanvas;
