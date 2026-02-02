
import React, { createContext, useContext, useState, useEffect } from 'react';

const DEFAULT_SETTINGS = {
  audio: {
    masterVolume: 100,
    promptReveal: true,
    waxSeal: true,
    achievement: true,
    music: true,
    promptVolume: 100,
    sealVolume: 100,
    achievementVolume: 100
  },
  visual: {
    gamma: 1.0,
    uiScale: 1.0,
    theme: 'dark',
    animationSpeed: 1.0,
    particleEffects: true
  },
  accessibility: {
    highContrast: false,
    reducedMotion: false,
    fontSize: 'normal', // small, normal, large
    textToSpeech: false
  },
  gameplay: {
    autoSave: true,
    hapticFeedback: false,
    confirmSeal: false,
    showConsistency: true
  }
};

const SettingsContext = createContext({
  settings: DEFAULT_SETTINGS,
  updateSetting: () => {},
  resetToDefaults: () => {},
  exportData: () => {},
  importData: () => {},
  getVolume: () => 1.0
});

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('app_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  useEffect(() => {
    localStorage.setItem('app_settings', JSON.stringify(settings));
    applyGlobalStyles();
  }, [settings]);

  const applyGlobalStyles = () => {
    const root = document.documentElement;
    
    // Visual Settings
    root.style.setProperty('--gamma', settings.visual.gamma);
    root.style.setProperty('--ui-scale', settings.visual.uiScale);
    root.style.setProperty('--animation-speed', settings.accessibility.reducedMotion ? 0 : settings.visual.animationSpeed);
    
    // Font Scaling
    let fontScale = 1;
    if (settings.accessibility.fontSize === 'small') fontScale = 0.85;
    if (settings.accessibility.fontSize === 'large') fontScale = 1.15;
    root.style.setProperty('--font-scale', fontScale);

    // High Contrast
    if (settings.accessibility.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Theme (Placeholder for now, assuming dark is default/only)
    if (settings.visual.theme === 'light') {
      root.classList.add('light-theme');
    } else {
      root.classList.remove('light-theme');
    }
  };

  const updateSetting = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const resetToDefaults = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  const exportData = () => {
    const data = {
      settings,
      history: JSON.parse(localStorage.getItem('signature_history') || '[]'),
      achievements: JSON.parse(localStorage.getItem('achievements') || '[]'),
      unlockedLexicons: JSON.parse(localStorage.getItem('unlocked_lexicons') || '["core"]'),
      masteryHistory: JSON.parse(localStorage.getItem('mastery_history') || '[]'),
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `midnight_archivist_backup_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importData = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          
          if (data.settings) setSettings(data.settings);
          if (data.history) localStorage.setItem('signature_history', JSON.stringify(data.history));
          if (data.achievements) localStorage.setItem('achievements', JSON.stringify(data.achievements));
          if (data.unlockedLexicons) localStorage.setItem('unlocked_lexicons', JSON.stringify(data.unlockedLexicons));
          if (data.masteryHistory) localStorage.setItem('mastery_history', JSON.stringify(data.masteryHistory));
          
          resolve({ success: true, count: data.history?.length || 0 });
          // Force reload to apply data changes to other contexts which might not be listening to this function call directly
          // Ideally we would expose a refresh function in those contexts, but window.location.reload is safest for full state restore
          setTimeout(() => window.location.reload(), 1000);
        } catch (err) {
          reject(err);
        }
      };
      reader.readAsText(file);
    });
  };

  const getVolume = (type = 'master') => {
    const master = settings.audio.masterVolume / 100;
    if (type === 'master') return master;
    
    // specific types
    const volKey = `${type}Volume`; 
    const specific = (settings.audio[volKey] !== undefined ? settings.audio[volKey] : 100) / 100;
    
    return master * specific;
  };

  return (
    <SettingsContext.Provider value={{ 
      settings, 
      updateSetting, 
      resetToDefaults, 
      exportData, 
      importData,
      getVolume
    }}>
      {children}
    </SettingsContext.Provider>
  );
};
