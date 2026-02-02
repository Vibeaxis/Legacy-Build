
import React, { createContext, useContext, useState, useEffect } from 'react';
import { checkNewUnlock } from '../utils/LexiconManager';
import { checkAchievements } from '../utils/AchievementChecker';
import { calculateRecentMastery } from '../utils/MasteryCalculator';
import { ACHIEVEMENTS } from '../data/achievements';
import { analyzeSentiment, determineSealColor, getSentimentIntensity } from '../utils/SentimentAnalyzer';

// Create the context
export const HistoryContext = createContext({
  history: [],
  currentThread: null,
  threadHistory: [],
  lastUsedTags: [],
  reportGenerated: false,
  generatedReport: null,
  unlockedLexicons: ["core"],
  achievements: [],
  masteryHistory: [],
  recentAchievementsQueue: [],
  addSignature: () => {},
  getHistory: () => [],
  clearHistory: () => {},
  getLastThreeStyles: () => [],
  isThreadActive: () => false,
  getThreadHistory: () => [],
  setLastUsedTags: () => {},
  setReportGenerated: () => {},
  setGeneratedReport: () => {},
  clearAchievementQueue: () => {}
});

// Custom hook for using the history context
export const useHistory = () => {
  const context = useContext(HistoryContext);
  if (!context) {
    throw new Error('useHistory must be used within a HistoryProvider');
  }
  return context;
};

export const HistoryProvider = ({ children }) => {
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('signature_history');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [currentThread, setCurrentThread] = useState(null);
  const [threadHistory, setThreadHistory] = useState([]);
  const [lastUsedTags, setLastUsedTags] = useState([]);
  
  // Gamification State
  const [unlockedLexicons, setUnlockedLexicons] = useState(() => {
    const saved = localStorage.getItem('unlocked_lexicons');
    return saved ? JSON.parse(saved) : ["core"];
  });

  const [achievements, setAchievements] = useState(() => {
    const saved = localStorage.getItem('achievements');
    return saved ? JSON.parse(saved) : [];
  });

  const [masteryHistory, setMasteryHistory] = useState(() => {
    const saved = localStorage.getItem('mastery_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [recentAchievementsQueue, setRecentAchievementsQueue] = useState([]);
  
  // Track report status
  const [reportGenerated, setReportGenerated] = useState(() => {
    return localStorage.getItem('report_generated') === 'true';
  });
  
  const [generatedReport, setGeneratedReport] = useState(() => {
    const savedReport = localStorage.getItem('generated_report');
    return savedReport ? JSON.parse(savedReport) : null;
  });

  // Persistence Effects
  useEffect(() => { localStorage.setItem('signature_history', JSON.stringify(history)); }, [history]);
  useEffect(() => { localStorage.setItem('unlocked_lexicons', JSON.stringify(unlockedLexicons)); }, [unlockedLexicons]);
  useEffect(() => { localStorage.setItem('achievements', JSON.stringify(achievements)); }, [achievements]);
  useEffect(() => { localStorage.setItem('mastery_history', JSON.stringify(masteryHistory)); }, [masteryHistory]);
  useEffect(() => { localStorage.setItem('report_generated', reportGenerated); }, [reportGenerated]);
  useEffect(() => { 
    if (generatedReport) localStorage.setItem('generated_report', JSON.stringify(generatedReport)); 
  }, [generatedReport]);

  // Track thread progression when history updates
  useEffect(() => {
    if (history.length > 0) {
        const lastEntry = history[history.length - 1];
        const newThreadID = lastEntry.threadID || lastEntry.promptMetadata?.threadID;

        if (newThreadID && newThreadID !== currentThread) {
            setCurrentThread(newThreadID);
            setThreadHistory(prev => {
                const newHist = [...prev, { id: newThreadID, timestamp: Date.now() }];
                return newHist.slice(-3); // Keep last 3
            });
        }
    }
  }, [history]);

  const addSignature = (svgPath, inkColor, promptTitle, styleTag, metrics, consistency, extraData = {}) => {
    
    // Logic for secondary style based on continuity
    let secondaryStyle = '';
    const continuity = extraData.continuityRatio || 100;
    
    if (continuity > 80) secondaryStyle = `Fluid ${styleTag}`;
    else if (continuity < 40) secondaryStyle = `Fragmented ${styleTag}`;
    else secondaryStyle = styleTag; 
    
    const threadID = extraData.promptMetadata?.threadID;
    const usedTags = extraData.promptMetadata?.usedTags || [];

    // Analyze Sentiment for Seal Data if not provided (though interactive canvas should typically pass sealColor)
    // We calculate it here just in case or to store metadata
    const sentimentScores = analyzeSentiment(promptTitle);
    const calculatedSealColor = determineSealColor(sentimentScores);
    const sentimentIntensity = getSentimentIntensity(promptTitle);

    // Prefer passed sealColor if available (from UI interaction), otherwise calculated
    const sealColor = extraData.sealColor || calculatedSealColor.hex;

    const newEntry = {
      id: Date.now(),
      svgPath,
      inkColor,
      promptTitle,
      styleTag: secondaryStyle,
      primaryStyle: styleTag,
      secondaryStyleLabel: continuity > 80 ? 'Fluid' : (continuity < 40 ? 'Fragmented' : ''),
      metrics,
      consistency,
      timestamp: new Date().toISOString(),
      threadID,
      usedTags,
      sealColor: sealColor,
      sentimentData: {
          scores: sentimentScores,
          intensity: sentimentIntensity,
          dominantColor: calculatedSealColor.name
      },
      ...extraData
    };

    const newHistory = [...history, newEntry];
    setHistory(newHistory);

    // --- Gamification Logic Start ---
    const prevCount = history.length;
    const currentCount = newHistory.length;

    // 1. Check Lexicon Unlocks
    const newLexicon = checkNewUnlock(prevCount, currentCount);
    let currentUnlockedLexicons = [...unlockedLexicons];
    if (newLexicon && !unlockedLexicons.includes(newLexicon.id)) {
        currentUnlockedLexicons = [...unlockedLexicons, newLexicon.id];
        setUnlockedLexicons(currentUnlockedLexicons);
    }

    // 2. Check Achievements
    const newEarned = checkAchievements(newEntry, newHistory, currentUnlockedLexicons, achievements);
    if (newEarned.length > 0) {
        // Enriched achievement data
        const enriched = newEarned.map(ea => {
            const def = ACHIEVEMENTS.find(a => a.id === ea.id);
            return { ...ea, ...def };
        });
        
        setAchievements(prev => [...prev, ...enriched]);
        setRecentAchievementsQueue(prev => [...prev, ...enriched]);
    }

    // 3. Update Mastery History
    const currentMastery = calculateRecentMastery(newHistory);
    setMasteryHistory(prev => {
        const updated = [...prev, currentMastery];
        return updated.slice(-20); // Keep last 20 points
    });
    // --- Gamification Logic End ---

    // Check for milestone crossing
    if (newHistory.length > 0 && newHistory.length % 30 === 0) {
      setReportGenerated(false);
    }
  };

  const clearHistory = () => {
    setHistory([]);
    setCurrentThread(null);
    setThreadHistory([]);
    setLastUsedTags([]);
    setReportGenerated(false);
    setGeneratedReport(null);
    // Reset Gamification
    setUnlockedLexicons(["core"]);
    setAchievements([]);
    setMasteryHistory([]);
    
    localStorage.clear(); 
  };
  
  const clearAchievementQueue = () => setRecentAchievementsQueue([]);

  const getHistory = () => history;

  const getLastThreeStyles = () => {
    return history.slice(-3).map(h => ({
        styleTag: h.primaryStyle || h.styleTag, 
        metrics: h.metrics 
    }));
  };

  const isThreadActive = (threadID) => currentThread === threadID;
  const getThreadHistory = () => threadHistory;

  return (
    <HistoryContext.Provider value={{ 
        history, 
        addSignature, 
        getHistory, 
        clearHistory, 
        getLastThreeStyles,
        currentThread,
        threadHistory,
        isThreadActive,
        getThreadHistory,
        lastUsedTags,
        setLastUsedTags,
        reportGenerated,
        setReportGenerated,
        generatedReport,
        setGeneratedReport,
        unlockedLexicons,
        achievements,
        masteryHistory,
        recentAchievementsQueue,
        clearAchievementQueue
    }}>
      {children}
    </HistoryContext.Provider>
  );
};
