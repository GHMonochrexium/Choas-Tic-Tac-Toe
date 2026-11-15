import React from 'react';
import { Smartphone, Eye, EyeOff, ShieldCheck, ArrowRight } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface HandoverScreenProps {
  title: string;
  targetPlayerName: string;
  targetPlayerSymbol: 'X' | 'O';
  reason: 'selection' | 'blind_turn' | 'game_start';
  onContinue: () => void;
}

export const HandoverScreen: React.FC<HandoverScreenProps> = ({
  title,
  targetPlayerName,
  targetPlayerSymbol,
  reason,
  onContinue,
}) => {
  const handleReveal = () => {
    soundManager.playClick();
    onContinue();
  };

  const getSubtitle = () => {
    if (reason === 'selection') {
      return 'Keep your ability drafting secret! Hand the device to the player named below.';
    }
    if (reason === 'blind_turn') {
      return 'PRIVACY ALERT: You are BLINDED! Do not look at the board until you take device control. Your screen will be blacked out.';
    }
    return 'Loadouts are locked and sealed. Hand device over to commence the Chaos battle!';
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="w-full max-w-md p-8 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 shadow-2xl flex flex-col items-center">
        {/* Device Icon */}
        <div className="w-20 h-20 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center mb-6 text-purple-400 relative">
          <Smartphone className="w-10 h-10 animate-bounce" />
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center text-white">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>

        <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-widest mb-1">
          {reason === 'blind_turn' ? 'BLIND PRIVACY SHIELD' : 'DEVICE HANDOVER'}
        </span>

        <h2 className="text-2xl md:text-3xl font-black font-display text-white mb-2">
          {title}
        </h2>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800/90 border border-slate-700 my-3">
          <span className="text-xs text-slate-400">Hand device to:</span>
          <span className="text-sm font-bold text-white font-display">{targetPlayerName}</span>
          <span
            className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-mono font-bold ${
              targetPlayerSymbol === 'X'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                : 'bg-pink-500/20 text-pink-400 border border-pink-500/40'
            }`}
          >
            {targetPlayerSymbol}
          </span>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed max-w-xs mb-8">
          {getSubtitle()}
        </p>

        {/* Big Tap to Reveal button */}
        <button
          onClick={handleReveal}
          className="w-full py-4 px-6 rounded-xl font-display font-bold text-sm tracking-wide text-white bg-gradient-to-r from-purple-600 to-cyan-500 hover:opacity-95 shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02]"
        >
          {reason === 'blind_turn' ? (
            <>
              <EyeOff className="w-4 h-4" />
              <span>I AM {targetPlayerName.toUpperCase()} · ENTER THE DARK</span>
            </>
          ) : (
            <>
              <Eye className="w-4 h-4" />
              <span>I AM {targetPlayerName.toUpperCase()} · TAP TO REVEAL</span>
            </>
          )}
        </button>

        <p className="text-[11px] text-slate-500 mt-4">
          Local multiplayer privacy system ensures no cheating or screen peeking.
        </p>
      </div>
    </div>
  );
};
