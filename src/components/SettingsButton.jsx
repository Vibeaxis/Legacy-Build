
import React from 'react';
import { Settings } from 'lucide-react';
import { motion } from 'framer-motion';

const SettingsButton = ({ onClick }) => {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ rotate: 90, scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className="fixed top-6 right-6 z-[60] p-2 bg-[#3e2723]/80 hover:bg-[#3e2723] text-[#f4e4bc] rounded-full shadow-lg border border-[#d7ccc8]/20 backdrop-blur-sm"
      aria-label="Open Settings"
    >
      <Settings size={24} />
    </motion.button>
  );
};

export default SettingsButton;
