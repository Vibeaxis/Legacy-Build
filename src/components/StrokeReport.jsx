
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, TrendingDown, Minus, Activity, Wind, Anchor } from 'lucide-react';
import ThumbnailPreview from './ThumbnailPreview';

const MetricBar = ({ label, value, color }) => (
  <div className="mb-3">
    <div className="flex justify-between text-xs uppercase tracking-wider mb-1 text-[#5d4037]">
      <span>{label}</span>
      <span>{value}%</span>
    </div>
    <div className="h-2 w-full bg-[#d7ccc8] rounded-full overflow-hidden">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
      />
    </div>
  </div>
);

const TrendIcon = ({ trend }) => {
  if (trend === 'increasing') return <TrendingUp size={16} className="text-green-600" />;
  if (trend === 'decreasing') return <TrendingDown size={16} className="text-amber-600" />;
  return <Minus size={16} className="text-gray-500" />;
};

const StrokeReport = ({ report, onClose, isOpen }) => {
  if (!report || !isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      >
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-[#f4e4bc] w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg shadow-2xl border-4 border-[#3e2723] relative flex flex-col"
          style={{
            backgroundImage: `url("https://www.transparenttextures.com/patterns/aged-paper.png")`,
          }}
        >
          {/* Header */}
          <div className="p-6 border-b border-[#8d6e63] flex justify-between items-start bg-[#efebe9]/50">
            <div>
              <h2 className="font-playfair text-3xl font-bold text-[#3e2723] mb-1">Stroke Telemetry Analysis</h2>
              <p className="font-garamond text-[#5d4037] italic">Diagnostic Report • Milestone Assessment</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-[#d7ccc8] rounded-full transition-colors text-[#3e2723]"
            >
              <X size={24} />
            </button>
          </div>

          <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Left Column: Metrics & Visualization */}
            <div className="space-y-8">
              {/* Selected Marks Display */}
              <section>
                <h3 className="font-playfair text-xl text-[#3e2723] mb-4 border-b border-[#8d6e63]/30 pb-2">Selected Legacy Marks</h3>
                <div className="grid grid-cols-3 gap-4">
                  {report.selectedMarks.map((mark, idx) => (
                    <div key={mark.id} className="flex flex-col items-center">
                      <div className="relative w-full aspect-square bg-white shadow-inner border border-[#d7ccc8] rounded p-2 mb-2">
                         <ThumbnailPreview 
                            svgPath={mark.svgPath} 
                            inkColor={mark.inkColor}
                            className="w-full h-full"
                         />
                         <div className="absolute top-1 right-1 text-[10px] bg-[#3e2723] text-[#f4e4bc] px-1 rounded">
                           #{idx + 1}
                         </div>
                      </div>
                      <p className="text-[10px] text-center font-bold text-[#5d4037] line-clamp-1">{mark.promptTitle}</p>
                      <p className="text-[9px] text-center text-[#8d6e63]">{new Date(mark.timestamp).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Evolution Chart */}
              <section>
                <h3 className="font-playfair text-xl text-[#3e2723] mb-4 border-b border-[#8d6e63]/30 pb-2">Evolution Metrics</h3>
                <div className="bg-white/40 p-4 rounded-lg border border-[#d7ccc8]">
                   {report.markTelemetry.map((telemetry, idx) => (
                      <div key={telemetry.id} className="mb-6 last:mb-0">
                         <p className="text-xs font-bold text-[#3e2723] mb-2">Mark {idx + 1} Profile</p>
                         <MetricBar label="Consistency" value={telemetry.consistency} color="#43a047" />
                         <MetricBar label="Fluidity" value={telemetry.speedFluidity} color="#1e88e5" />
                         <MetricBar label="Complexity" value={telemetry.complexityScore} color="#8e24aa" />
                      </div>
                   ))}
                </div>
              </section>
            </div>

            {/* Right Column: Insights & Summary */}
            <div className="space-y-8">
               {/* Summary Prose */}
               <section>
                 <h3 className="font-playfair text-xl text-[#3e2723] mb-4 border-b border-[#8d6e63]/30 pb-2">Analyst Summary</h3>
                 <p className="font-garamond text-lg text-[#3e2723] leading-relaxed">
                   {report.summary}
                 </p>
               </section>

               {/* Key Insights List */}
               <section>
                 <h3 className="font-playfair text-xl text-[#3e2723] mb-4 border-b border-[#8d6e63]/30 pb-2">Key Insights</h3>
                 <ul className="space-y-4">
                   {report.insights.map((insight, idx) => (
                     <motion.li 
                        key={idx}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + (idx * 0.1) }}
                        className="flex items-start gap-3 bg-[#efebe9] p-3 rounded-lg border border-[#d7ccc8]"
                     >
                       <div className="mt-1 text-[#3e2723]">
                          <Activity size={16} />
                       </div>
                       <span className="text-sm text-[#5d4037] font-medium leading-relaxed">{insight}</span>
                     </motion.li>
                   ))}
                 </ul>
               </section>

               {/* Trends Summary Grid */}
               <section className="grid grid-cols-2 gap-4">
                  <div className="bg-[#fff8e1] p-3 rounded border border-[#ffe0b2] flex items-center justify-between">
                     <span className="text-xs font-bold text-[#f57f17] uppercase">Consistency</span>
                     <div className="flex items-center gap-1">
                        <span className="text-xs capitalize text-[#5d4037]">{report.evolutionMetrics.consistencyTrend}</span>
                        <TrendIcon trend={report.evolutionMetrics.consistencyTrend} />
                     </div>
                  </div>
                  <div className="bg-[#e3f2fd] p-3 rounded border border-[#bbdefb] flex items-center justify-between">
                     <span className="text-xs font-bold text-[#1976d2] uppercase">Fluidity</span>
                     <div className="flex items-center gap-1">
                        <span className="text-xs capitalize text-[#5d4037]">{report.evolutionMetrics.speedTrend}</span>
                        <TrendIcon trend={report.evolutionMetrics.speedTrend} />
                     </div>
                  </div>
                  <div className="bg-[#f3e5f5] p-3 rounded border border-[#e1bee7] flex items-center justify-between">
                     <span className="text-xs font-bold text-[#7b1fa2] uppercase">Complexity</span>
                     <div className="flex items-center gap-1">
                        <span className="text-xs capitalize text-[#5d4037]">{report.evolutionMetrics.complexityTrend}</span>
                        <TrendIcon trend={report.evolutionMetrics.complexityTrend} />
                     </div>
                  </div>
                  <div className="bg-[#e0f2f1] p-3 rounded border border-[#b2dfdb] flex items-center justify-between">
                     <span className="text-xs font-bold text-[#00796b] uppercase">Pressure</span>
                     <div className="flex items-center gap-1">
                        <span className="text-xs capitalize text-[#5d4037]">{report.evolutionMetrics.pressureTrend}</span>
                        <TrendIcon trend={report.evolutionMetrics.pressureTrend} />
                     </div>
                  </div>
               </section>
            </div>
          </div>

          <div className="p-6 border-t border-[#8d6e63] bg-[#efebe9]/50 flex justify-end">
             <button 
               onClick={onClose}
               className="bg-[#3e2723] text-[#f4e4bc] px-6 py-2 rounded shadow hover:bg-[#5d4037] transition-colors font-bold tracking-wider text-sm uppercase"
             >
               Close Report
             </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default StrokeReport;
