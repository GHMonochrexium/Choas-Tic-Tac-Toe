import React, { useEffect, useState } from 'react';
import { Radiation, Flame } from 'lucide-react';

interface NukeExplosionEffectProps {
  onComplete: () => void;
  affectedCount: number;
}

export const NukeExplosionEffect: React.FC<NukeExplosionEffectProps> = ({
  onComplete,
  affectedCount,
}) => {
  const [stage, setStage] = useState<'flash' | 'blast' | 'smoke'>('flash');

  useEffect(() => {
    const t1 = setTimeout(() => setStage('blast'), 180);
    const t2 = setTimeout(() => setStage('smoke'), 800);
    const t3 = setTimeout(() => onComplete(), 1400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center overflow-hidden">
      {/* Full screen nuclear flash */}
      {stage === 'flash' && (
        <div className="absolute inset-0 bg-white opacity-95 transition-opacity duration-200" />
      )}

      {/* Fiery expanding shockwave ring */}
      <div
        className={`absolute rounded-full border-4 border-orange-500/80 bg-radial from-red-600/40 via-orange-500/20 to-transparent transition-all duration-700 ease-out ${
          stage === 'blast'
            ? 'w-[750px] h-[750px] opacity-100 scale-100'
            : stage === 'smoke'
            ? 'w-[900px] h-[900px] opacity-0 scale-125'
            : 'w-10 h-10 opacity-0 scale-50'
        }`}
      />

      {/* Mushroom/Hazard Emblem Alert */}
      <div
        className={`z-10 flex flex-col items-center justify-center p-6 rounded-3xl bg-slate-950/90 border border-red-500/60 shadow-2xl shadow-red-600/50 backdrop-blur-md transition-all duration-300 ${
          stage === 'blast' ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
        }`}
      >
        <div className="w-16 h-16 rounded-2xl bg-red-600/20 border border-red-500 flex items-center justify-center text-red-500 mb-2 animate-spin">
          <Radiation className="w-10 h-10" />
        </div>
        <h3 className="text-2xl font-black font-display text-white tracking-widest uppercase">
          NUCLEAR DETONATION!
        </h3>
        <p className="text-xs font-mono text-orange-400 mt-1">
          {affectedCount} {affectedCount === 1 ? 'cell' : 'cells'} permanently vaporized into radioactive craters!
        </p>
      </div>
    </div>
  );
};
