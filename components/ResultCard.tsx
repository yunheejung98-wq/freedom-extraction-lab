
import React from 'react';
import { ExtractionProtocol } from '../types';

interface ResultCardProps {
  protocol: ExtractionProtocol;
  onReset: () => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({ protocol, onReset }) => {
  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-20">
      <div className="glass p-8 rounded-lg space-y-10 relative overflow-hidden border-t-4 border-white/20">
        
        <div className="flex justify-between items-start border-b border-white/10 pb-6">
          <div>
            <span className="text-xs text-white/40 uppercase tracking-[0.2em]">Analysis Complete</span>
            <h2 className="text-3xl font-bold tracking-tight uppercase mt-1">{protocol.dominantEmotion}</h2>
          </div>
          <div className="text-right">
            <span className="text-xs text-white/40 uppercase tracking-[0.2em]">Freedom Acidity Index</span>
            <div className="text-3xl font-mono">pH {protocol.phValue.toFixed(1)}</div>
          </div>
        </div>

        <div className="space-y-8 py-4">
          <div className="space-y-2">
            <label className="text-[10px] text-white/40 uppercase font-bold tracking-[0.3em]">State Description</label>
            <p className="text-xl font-light leading-relaxed italic text-white/90">
              "{protocol.sentiment}"
            </p>
          </div>
          
          <div className="bg-white/5 border border-white/10 p-8 rounded-sm space-y-4">
            <label className="text-[10px] text-white/60 uppercase font-bold tracking-[0.3em] block border-b border-white/10 pb-2">
              Final Extraction Protocol
            </label>
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <p className="text-2xl md:text-3xl font-medium text-white tracking-tight leading-snug">
                {protocol.instructions}
              </p>
              <p className="text-[10px] text-white/30 uppercase mt-6 tracking-widest font-mono">
                [ Protocol Code: {Math.random().toString(36).substring(7).toUpperCase()} ]
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6">
          <div className="flex items-center space-x-2 text-white/40">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[10px] uppercase font-bold tracking-widest">Lab Technician's Note</span>
          </div>
          <p className="text-sm mt-3 text-white/60 leading-relaxed uppercase">
            Mix the specified solutions in the order and ratio provided. The chemical reaction represents the physical translation of your freedom memory into a tangible specimen. Once completed, seal the vial for preservation.
          </p>
        </div>
      </div>

      <div className="flex justify-center pt-4">
        <button 
          onClick={onReset}
          className="group relative px-10 py-4 overflow-hidden border border-white/20 hover:border-white/80 transition-all"
        >
          <span className="relative z-10 text-xs font-bold uppercase tracking-[0.4em] text-white">
            Reset Extraction System
          </span>
          <div className="absolute inset-0 bg-white/5 group-hover:bg-white/10 transition-colors" />
        </button>
      </div>
    </div>
  );
};
