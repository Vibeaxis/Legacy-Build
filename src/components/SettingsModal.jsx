
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Volume2, Eye, Accessibility, Gamepad2, Database, Info, Download, Upload, Trash2 } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { useHistory } from '../context/HistoryContext'; // For clearing data
import * as Tabs from '@radix-ui/react-tabs';
import * as Slider from '@radix-ui/react-slider';
import * as Switch from '@radix-ui/react-checkbox'; // Using checkbox as simplified switch for constraints

const SettingsModal = ({ isOpen, onClose }) => {
  const { settings, updateSetting, resetToDefaults, exportData, importData } = useSettings();
  const { clearHistory } = useHistory();
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState('audio');

  const handleImportClick = () => fileInputRef.current?.click();
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        await importData(file);
        // Toast handled by parent or context logic usually, but here just simplistic
        alert("Data imported successfully. Reloading...");
      } catch (err) {
        alert("Failed to import data: " + err.message);
      }
    }
  };

  const handleClearData = () => {
    if (window.confirm("Are you sure? This will delete ALL your signatures and achievements permanently.")) {
      clearHistory();
      alert("All data cleared.");
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-[#2a1e19] w-full max-w-4xl max-h-[85vh] rounded-xl border border-[#d7ccc8]/20 shadow-2xl flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[#d7ccc8]/10 bg-[#1e1512]">
            <h2 className="font-playfair text-2xl text-[#f4e4bc] flex items-center gap-2">
              <SettingsIconTab icon={activeTab} /> Settings
            </h2>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/5 rounded-full text-[#bcaaa4] hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar Tabs */}
            <div className="w-64 bg-[#1e1512]/50 border-r border-[#d7ccc8]/10 flex flex-col p-2 space-y-1 overflow-y-auto">
              <TabButton id="audio" label="Audio" icon={Volume2} active={activeTab} set={setActiveTab} />
              <TabButton id="visual" label="Visual" icon={Eye} active={activeTab} set={setActiveTab} />
              <TabButton id="accessibility" label="Accessibility" icon={Accessibility} active={activeTab} set={setActiveTab} />
              <TabButton id="gameplay" label="Gameplay" icon={Gamepad2} active={activeTab} set={setActiveTab} />
              <TabButton id="data" label="Data Management" icon={Database} active={activeTab} set={setActiveTab} />
              <TabButton id="about" label="About" icon={Info} active={activeTab} set={setActiveTab} />
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-8 bg-[#2a1e19] ledger-scrollbar">
              {activeTab === 'audio' && (
                <div className="space-y-8">
                  <Section title="Master Volume">
                    <SliderControl 
                      value={[settings.audio.masterVolume]} 
                      onValueChange={([v]) => updateSetting('audio', 'masterVolume', v)}
                      max={100} label="Master Volume"
                    />
                  </Section>
                  <Section title="Sound Levels">
                    <div className="space-y-4">
                      <SliderControl 
                        value={[settings.audio.promptVolume]} 
                        onValueChange={([v]) => updateSetting('audio', 'promptVolume', v)}
                        label="Prompt Reveal"
                      />
                      <SliderControl 
                        value={[settings.audio.sealVolume]} 
                        onValueChange={([v]) => updateSetting('audio', 'sealVolume', v)}
                        label="Wax Seal"
                      />
                      <SliderControl 
                        value={[settings.audio.achievementVolume]} 
                        onValueChange={([v]) => updateSetting('audio', 'achievementVolume', v)}
                        label="Achievements"
                      />
                    </div>
                  </Section>
                  <Section title="Toggles">
                     <Toggle label="Enable Music" checked={settings.audio.music} onChange={(c) => updateSetting('audio', 'music', c)} />
                  </Section>
                </div>
              )}

              {activeTab === 'visual' && (
                <div className="space-y-8">
                  <Section title="Display">
                    <SliderControl 
                      value={[settings.visual.gamma]} 
                      onValueChange={([v]) => updateSetting('visual', 'gamma', v)}
                      min={0.5} max={2.0} step={0.1}
                      label={`Gamma Correction (${settings.visual.gamma})`}
                    />
                    <SliderControl 
                      value={[settings.visual.uiScale]} 
                      onValueChange={([v]) => updateSetting('visual', 'uiScale', v)}
                      min={0.8} max={1.5} step={0.05}
                      label={`UI Scaling (${Math.round(settings.visual.uiScale * 100)}%)`}
                    />
                  </Section>
                  <Section title="Animation">
                    <SliderControl 
                      value={[settings.visual.animationSpeed]} 
                      onValueChange={([v]) => updateSetting('visual', 'animationSpeed', v)}
                      min={0.5} max={2.0} step={0.1}
                      label={`Animation Speed (${settings.visual.animationSpeed}x)`}
                    />
                     <Toggle label="Particle Effects" checked={settings.visual.particleEffects} onChange={(c) => updateSetting('visual', 'particleEffects', c)} />
                  </Section>
                </div>
              )}

              {activeTab === 'accessibility' && (
                <div className="space-y-6">
                  <Section title="Visibility">
                    <Toggle label="High Contrast Mode" checked={settings.accessibility.highContrast} onChange={(c) => updateSetting('accessibility', 'highContrast', c)} />
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-[#bcaaa4] mb-2">Font Size</label>
                        <select 
                            value={settings.accessibility.fontSize}
                            onChange={(e) => updateSetting('accessibility', 'fontSize', e.target.value)}
                            className="w-full bg-[#1e1512] border border-[#d7ccc8]/20 rounded p-2 text-[#f4e4bc]"
                        >
                            <option value="small">Small</option>
                            <option value="normal">Normal</option>
                            <option value="large">Large</option>
                        </select>
                    </div>
                  </Section>
                  <Section title="Motion">
                    <Toggle label="Reduced Motion" checked={settings.accessibility.reducedMotion} onChange={(c) => updateSetting('accessibility', 'reducedMotion', c)} />
                  </Section>
                </div>
              )}

              {activeTab === 'gameplay' && (
                <div className="space-y-6">
                  <Section title="Preferences">
                    <Toggle label="Auto-Save" checked={settings.gameplay.autoSave} onChange={(c) => updateSetting('gameplay', 'autoSave', c)} />
                    <Toggle label="Confirm Before Seal" checked={settings.gameplay.confirmSeal} onChange={(c) => updateSetting('gameplay', 'confirmSeal', c)} />
                    <Toggle label="Show Consistency Score" checked={settings.gameplay.showConsistency} onChange={(c) => updateSetting('gameplay', 'showConsistency', c)} />
                  </Section>
                </div>
              )}

              {activeTab === 'data' && (
                <div className="space-y-6">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <button onClick={exportData} className="p-4 bg-[#004d40]/40 border border-[#004d40] rounded-lg flex flex-col items-center justify-center gap-2 hover:bg-[#004d40]/60 transition">
                           <Download className="text-[#4db6ac]" />
                           <span className="font-bold text-[#e0f2f1]">Export Data</span>
                           <span className="text-xs text-[#80cbc4]">Download JSON Backup</span>
                       </button>
                       <button onClick={handleImportClick} className="p-4 bg-[#3e2723]/40 border border-[#8d6e63] rounded-lg flex flex-col items-center justify-center gap-2 hover:bg-[#3e2723]/60 transition">
                           <Upload className="text-[#d7ccc8]" />
                           <span className="font-bold text-[#efebe9]">Import Data</span>
                           <span className="text-xs text-[#bcaaa4]">Restore from JSON</span>
                       </button>
                       <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".json" />
                   </div>
                   
                   <div className="mt-8 pt-8 border-t border-red-900/30">
                       <h3 className="text-red-400 font-bold mb-2 flex items-center gap-2"><Trash2 size={16}/> Danger Zone</h3>
                       <p className="text-xs text-red-300/70 mb-4">Once you delete your data, there is no going back. Please be certain.</p>
                       <button onClick={handleClearData} className="px-4 py-2 bg-red-900/20 text-red-400 border border-red-900/50 rounded hover:bg-red-900/40 text-sm font-bold w-full">
                           Clear All Data
                       </button>
                   </div>
                   
                   <div className="mt-4 p-4 bg-black/20 rounded text-xs font-mono text-gray-500">
                       Storage Usage: {((JSON.stringify(localStorage).length / 1024)).toFixed(2)} KB
                   </div>
                </div>
              )}

              {activeTab === 'about' && (
                <div className="text-center space-y-6">
                    <div className="w-16 h-16 bg-[#3e2723] rounded-full mx-auto flex items-center justify-center mb-4">
                        <Info className="text-[#ffd700]" size={32} />
                    </div>
                    <h3 className="font-playfair text-3xl text-[#f4e4bc]">Midnight Archivist</h3>
                    <p className="text-[#bcaaa4]">Version 1.0.0</p>
                    
                    <div className="text-sm text-[#8d6e63] max-w-md mx-auto leading-relaxed">
                        A digital calligraphy experience designed to help you build your legacy, one stroke at a time.
                    </div>

                    <div className="pt-8 grid grid-cols-2 gap-4 max-w-sm mx-auto">
                        <a href="#" className="block p-3 border border-[#d7ccc8]/20 rounded hover:bg-white/5 text-[#bcaaa4] text-sm">Documentation</a>
                        <a href="#" className="block p-3 border border-[#d7ccc8]/20 rounded hover:bg-white/5 text-[#bcaaa4] text-sm">Report Bug</a>
                    </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Footer */}
          <div className="p-4 bg-[#1e1512] border-t border-[#d7ccc8]/10 flex justify-between items-center">
              <button onClick={resetToDefaults} className="text-xs text-[#8d6e63] hover:text-[#bcaaa4] underline">Reset to Defaults</button>
              <button onClick={onClose} className="px-6 py-2 bg-[#f4e4bc] text-[#3e2723] font-bold rounded-full hover:bg-[#fff8e1] transition-colors">
                  Close
              </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Sub-components for cleaner code
const TabButton = ({ id, label, icon: Icon, active, set }) => (
  <button
    onClick={() => set(id)}
    className={`
      w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all
      ${active === id 
        ? 'bg-[#3e2723] text-[#f4e4bc] shadow-md' 
        : 'text-[#8d6e63] hover:bg-white/5 hover:text-[#bcaaa4]'}
    `}
  >
    <Icon size={18} />
    {label}
  </button>
);

const Section = ({ title, children }) => (
    <div className="mb-6">
        <h3 className="text-[#f4e4bc] font-playfair text-lg mb-4 border-b border-[#d7ccc8]/10 pb-2">{title}</h3>
        {children}
    </div>
);

const Toggle = ({ label, checked, onChange }) => (
    <div className="flex items-center justify-between py-2">
        <span className="text-[#bcaaa4]">{label}</span>
        <button 
            onClick={() => onChange(!checked)}
            className={`w-12 h-6 rounded-full relative transition-colors ${checked ? 'bg-[#ffd700]' : 'bg-[#5d4037]'}`}
        >
            <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${checked ? 'left-7' : 'left-1'}`} />
        </button>
    </div>
);

const SliderControl = ({ label, value, onValueChange, min=0, max=100, step=1 }) => (
    <div className="py-2">
        <div className="flex justify-between mb-2">
            <label className="text-sm text-[#bcaaa4]">{label}</label>
            <span className="text-xs text-[#8d6e63] font-mono">{value}</span>
        </div>
        <Slider.Root 
            className="relative flex items-center select-none touch-none w-full h-5" 
            value={value} 
            onValueChange={onValueChange} 
            max={max} min={min} step={step}
        >
            <Slider.Track className="bg-[#5d4037] relative grow rounded-full h-[3px]">
                <Slider.Range className="absolute bg-[#ffd700] rounded-full h-full" />
            </Slider.Track>
            <Slider.Thumb 
                className="block w-4 h-4 bg-[#f4e4bc] border-2 border-[#3e2723] shadow-lg rounded-[10px] hover:bg-white focus:outline-none" 
            />
        </Slider.Root>
    </div>
);

const SettingsIconTab = ({ icon }) => {
    switch(icon) {
        case 'audio': return <Volume2 size={20} />;
        case 'visual': return <Eye size={20} />;
        case 'accessibility': return <Accessibility size={20} />;
        case 'gameplay': return <Gamepad2 size={20} />;
        case 'data': return <Database size={20} />;
        default: return <SettingsIconTab icon='audio' />; // dummy fallback
    }
}

export default SettingsModal;
