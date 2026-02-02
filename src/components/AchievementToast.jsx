
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, PenTool, Scroll, Book, Activity, Target, Gem, Crown, Sparkles, Feather, Leaf, Hammer, Moon } from 'lucide-react';

const icons = {
  Award, PenTool, Scroll, Book, Activity, Target, Gem, Crown, Sparkles, Feather, Leaf, Hammer, Moon
};

const AchievementToast = ({ achievements, onClose }) => {
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState(null);

  useEffect(() => {
    if (achievements && achievements.length > 0) {
      setCurrent(achievements[0]);
      setVisible(true);
      
      const timer = setTimeout(() => {
        setVisible(false);
        if (onClose) onClose(achievements[0].id);
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [achievements, onClose]);

  if (!visible || !current) return null;

  const IconComponent = icons[current.icon] || Award;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 50, y: -20 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        exit={{ opacity: 0, x: 50 }}
        className="fixed top-24 right-4 z-[100] bg-[#3e2723] text-[#f4e4bc] p-4 rounded-lg shadow-2xl border-2 border-[#ffd700] flex items-center gap-4 max-w-sm"
      >
        <div className="bg-[#ffd700]/20 p-2 rounded-full">
           <IconComponent size={24} className="text-[#ffd700]" />
        </div>
        <div>
          <h4 className="font-playfair font-bold text-sm uppercase tracking-wider text-[#ffd700]">Achievement Unlocked</h4>
          <p className="font-crimson text-lg font-bold leading-none mb-1">{current.name}</p>
          <p className="font-garamond text-xs text-[#d7ccc8] italic">{current.description}</p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AchievementToast;
