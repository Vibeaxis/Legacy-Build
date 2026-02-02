
import React, { useState, useEffect } from 'react';
import { HistoryContext } from '../context/HistoryContext';

export const HistoryProvider = ({ children }) => {
  const [history, setHistory] = useState([]);

  // Load from sessionStorage on mount
  useEffect(() => {
    try {
      const storedHistory = sessionStorage.getItem('signatureHistory');
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error('Failed to load history from sessionStorage:', error);
    }
  }, []);

  // Save to sessionStorage whenever history changes
  useEffect(() => {
    try {
      sessionStorage.setItem('signatureHistory', JSON.stringify(history));
    } catch (error) {
      console.error('Failed to save history to sessionStorage:', error);
    }
  }, [history]);

  const addSignature = (svgPath, inkColor, promptTitle, styleTag, metrics, consistency) => {
    const newRecord = {
      id: Date.now().toString(),
      svgPath,
      inkColor,
      promptTitle,
      styleTag,
      metrics,      // Store raw metrics { pathLength, boundingBox }
      consistency,  // Store consistency score
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toLocaleDateString()
    };
    
    setHistory(prev => [...prev, newRecord]);
  };

  const getHistory = () => history;

  const clearHistory = () => {
    setHistory([]);
    sessionStorage.removeItem('signatureHistory');
  };

  const getLastThreeStyles = () => {
    // Get the last 3 entries, map to their style tags
    return history.slice(-3).map(entry => entry.styleTag).filter(Boolean);
  };

  const value = {
    history,
    addSignature,
    getHistory,
    clearHistory,
    getLastThreeStyles
  };

  return (
    <HistoryContext.Provider value={value}>
      {children}
    </HistoryContext.Provider>
  );
};

export default HistoryProvider;
