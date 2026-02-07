
import React from 'react';

export const LoadingScanner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-8 h-64">
      <div className="relative w-64 h-80 border-2 border-white/20 overflow-hidden bg-white/5 rounded-sm">
        <div className="scanner-line"></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center opacity-20 text-[10px] font-mono p-4 space-y-1">
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} className="w-full truncate">
              {Math.random().toString(16).toUpperCase()} 0x{Math.floor(Math.random() * 1000)} PROCESSING_BIT_{i}
            </div>
          ))}
        </div>
      </div>
      <div className="text-center">
        <h3 className="text-xl font-light tracking-widest animate-pulse">EXTRACTING EMOTIONAL DATA...</h3>
        <p className="text-white/40 text-sm mt-2">Converting synapses to chemical protocols</p>
      </div>
    </div>
  );
};
