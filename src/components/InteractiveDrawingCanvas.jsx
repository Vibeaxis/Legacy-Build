import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, animate } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { BookOpen, RefreshCw } from 'lucide-react'; // Added RefreshCw for subtle UI
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
import { useSettings } from '../context/SettingsContext';
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
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
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
  
  const { settings } = useSettings();

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

  // Updated to handle manual selection
  const selectColor = (index) => {
    setColorIndex(index);
    setInkColor(colorPalette[index].hex);
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
    
    if (promptData.metadata?.usedTags) {
        setLastUsedTags(promptData.metadata.usedTags);
    }

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

        if (!nextData) {
             nextData = getAdaptivePromptWithSentiment(
                fullMetrics,
                { primaryStyle, secondaryStyleLabel }, 
                consistency,
                lastUsedTags,
                history.length,
                currentThread
            );
        }
        
        setPromptData(nextData);
        
        // Don't auto-switch color anymore, let user decide, or just random
        // const nextCol = getNextColor(); 
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

      <div className="relative z-20 hidden md:block w-0">
          <Ledger onReplay={replaySignature} activeReplayId={activeReplayId} vibeTier={legacyVibe} />
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center min-h-screen p-4">
          
          <motion.div 
            id="desk-container"
            animate={isStampPressed ? { y: [0, 2, 0] } : {}}
            transition={{ duration: 0.15, ease: "easeInOut" }}
            className="w-full h-full max-w-6xl flex flex-col items-center justify-center gap-6"
          >
              
              {/* --- 1. PROMPT AREA (Floating above paper) --- */}
              <div className="w-full text-center relative z-20 -mb-4">
                 <AnimatePresence>
                    {canViewReport && (
                        <motion.button
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            onClick={handleGenerateReport}
                            className="absolute -top-12 right-0 bg-[#ff9800] text-[#3e2723] px-4 py-2 rounded-full shadow-lg flex items-center gap-2 font-bold uppercase tracking-wider text-xs border-2 border-[#3e2723] hover:bg-[#ffcc80] transition-colors animate-bounce"
                        >
                            <BookOpen size={16} /> Read Your Story
                        </motion.button>
                    )}
                </AnimatePresence>

                {replayMode && replayData ? (
                     <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center gap-1 mb-6"
                      >
                          <h2 className="font-playfair text-xl text-[#bcaaa4] italic">Replaying from Archives</h2>
                          <p className="font-playfair text-3xl text-[#eaddcf] font-bold">"{replayData.promptTitle}"</p>
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

              {/* --- 2. THE PAPER (Defined Workspace) --- */}
              <div className="relative w-full max-w-4xl aspect-[1.5/1] md:aspect-[1.8/1] shadow-2xl rounded-sm z-10">
                {/* Paper Visual Layer */}
                <div 
                    className="absolute inset-0 bg-[#f4e4bc] rounded-sm pointer-events-none"
                    style={{
                        backgroundImage: `url("https://www.transparenttextures.com/patterns/aged-paper.png"), linear-gradient(to bottom right, #f4e4bc, #eaddcf)`,
                        boxShadow: '0 20px 50px -12px rgba(0, 0, 0, 0.5), inset 0 0 100px rgba(62, 39, 35, 0.1)'
                    }}
                />
                
                {/* Faint Grid Lines */}
                <div 
                    className="absolute inset-8 border border-[#3e2723] border-opacity-5 pointer-events-none" 
                    style={{ backgroundImage: 'radial-gradient(#3e2723 0.5px, transparent 0)', backgroundSize: '20px 20px', opacity: 0.1 }}
                />

                {/* The SVG Interaction Layer */}
                <div className={`relative w-full h-full ${replayMode ? 'cursor-default' : 'cursor-none'}`}>
                  <svg
                    ref={svgRef}
                    className={`w-full h-full touch-none ${!replayMode && 'cursor-crosshair'}`}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerLeave={handlePointerUp}
                    style={{ 
                        touchAction: 'none',
                        filter: `drop-shadow(1px 1px 2px rgba(0,0,0,0.3))` 
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

              {/* --- 3. BOTTOM TOOLS (Seal & Ink) --- */}
              <div className="flex flex-col-reverse md:flex-row items-center justify-between w-full max-w-4xl gap-6 md:gap-0 z-20">
                
                {/* Ink Palette */}
                <div className="flex items-center gap-3 bg-black/20 p-2 rounded-full backdrop-blur-sm border border-[#5d4037]/30">
                     <span className="text-[10px] text-[#eaddcf] uppercase tracking-widest pl-2 font-bold opacity-60">Ink</span>
                     {colorPalette.map((color, idx) => (
                         <button
                            key={color.hex}
                            onClick={() => selectColor(idx)}
                            className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 relative group
                                ${colorIndex === idx ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-70 hover:opacity-100'}
                            `}
                            style={{ backgroundColor: color.hex }}
                            title={color.name}
                         >
                            {/* Tooltip */}
                            <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#3e2723] text-[#f4e4bc] text-[9px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">
                                {color.name}
                            </span>
                         </button>
                     ))}
                </div>

                {/* Seal Button (Centered relative to group roughly) */}
                <div className="relative">
                    {!replayMode && (
                        <WaxSealButton 
                            onSeal={handleSealComplete} 
                            disabled={allStrokes.length === 0} 
                            waxColor={currentWaxColor}
                        />
                    )}
                </div>

                {/* Right Side Info / Inkwell Image */}
                <div className="flex items-center justify-end w-[240px]">
                    {settings.gameplay.showConsistency && isDrawing && (
                        <div className="text-right">
                            <span className="text-xs text-[#bcaaa4] font-mono block">Velocity</span>
                            <span className="text-xl text-[#ffcc80] font-mono">{currentVelocity.toFixed(2)}</span>
                        </div>
                    )}
                     <div className="relative w-16 h-16 ml-4 opacity-80 mix-blend-hard-light">
                        <img 
                            src="https://images.unsplash.com/photo-1478641300939-0ec5188d3802?q=80&w=200&auto=format&fit=crop" 
                            alt="Inkwell"
                            className="w-full h-full object-contain"
                        />
                        {/* Dynamic ink color in the well */}
                        <div 
                            className="absolute top-[40%] left-[10%] right-[10%] bottom-[20%] rounded-full blur-md opacity-60 transition-colors duration-500"
                            style={{ backgroundColor: inkColor }}
                        />
                     </div>
                </div>

              </div>
          </motion.div>

        </div>
    </motion.div>
  );
};

export default InteractiveDrawingCanvas;