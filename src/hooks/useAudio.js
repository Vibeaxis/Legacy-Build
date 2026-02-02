
import { useEffect, useRef } from 'react';
import { useSettings } from '../context/SettingsContext';

const useAudio = (audioPath, type = 'master') => {
  const audioRef = useRef(null);
  const { getVolume } = useSettings();

  useEffect(() => {
    if (audioPath) {
      audioRef.current = new Audio(audioPath);
      audioRef.current.preload = 'auto';
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [audioPath]);

  const play = () => {
    if (audioRef.current) {
      // Calculate volume just before playing to ensure latest setting
      audioRef.current.volume = getVolume(type);
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(error => {
        // Suppress errors for missing files or autoplay restrictions
        // console.log('Audio play blocked or file missing:', error);
      });
    } else {
      // console.warn('Audio file not initialized or missing path');
    }
  };

  return { play };
};

export default useAudio;
