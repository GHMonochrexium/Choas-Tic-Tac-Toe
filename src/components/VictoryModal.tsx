import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, Home, Sparkles, Zap, Award } from 'lucide-react';
import { PlayerState, PlayerSymbol, WinResult, AbilityId } from '../types/game';
import { ABILITIES } from '../utils/gameLogic';
import { soundManager } from '../utils/audio';

interface VictoryModalProps {
  winResult: WinResult;
  p1: PlayerState;
  p2: PlayerState;
  onRematch: () => void;
  onReturnToMenu: () => void;
  p1AbilitiesUsed: AbilityId[];
  p2AbilitiesUsed: AbilityId[];
  turnCount: number;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  winResult,
  p1,
  p2,
  onRematch,
  onReturnToMenu,
  p1AbilitiesUsed,
  p2AbilitiesUsed,
  turnCount,
}) => {
  const isDraw = winResult.winner === 'DRAW';
  const winnerPlayer =
    winResult.winner === 'X'
      ? p1.symbol === 'X' ? p1 : p2
      : winResult.winner === 'O'
      ? p1.symbol === 'O' ? p1 : p2
      : null;

  useEffect(() => {
    if (!isDraw && winnerPlayer) {
      soundManager.playVictory();
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#a855f7', '#ec4899', '#06b6d4', '#eab308'],
        });
      } catch (e) {
        // Safe fallback
      }
    } else {
      soundManager.playDraw();
    }
  }, [isDraw, winnerPlayer]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fadeIn">
      <div className="w-full max-w-md p-6 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 shadow-2xl flex flex-col items-center text-center">
        {/* Top Trophy or Draw Icon */}
        <div
          className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-xl ${
            isDraw
              ? 'bg-amber-950/60 border border-amber-500/30 text-amber-400'
              : 'bg-purple-950/80 border border-purple-500/40 text-purple-400 shadow-purple-500/20'
          }`}
        >
          {isDraw ? <RotateCcw className="w-8 h-8" /> : <Trophy className="w-8 h-8" />}
        </div>

        <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400 mb-1">
          MATCH FINISHED
        </span>

        {/* Big Outcome Header */}
        {isDraw ? (
          <h2 className="text-3xl font-black font-display text-white mb-2">
            STALEMATE DRAW
          </h2>
        ) : (
          <h2 className="text-3xl font-black font-display text-white mb-2 flex items-center justify-center gap-2">
            <span>{winnerPlayer?.name}</span>
            <span
              className={`px-2.5 py-0.5 rounded-lg text-xl font-mono font-bold ${
                winnerPlayer?.symbol === 'X'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                  : 'bg-pink-500/20 text-pink-400 border border-pink-500/40'
              }`}
            >
              {winnerPlayer?.symbol}
            </span>
            <span>WINS!</span>
          </h2>
        )}

        {/* Reason caption */}
        <p className="text-xs text-slate-300 max-w-xs mb-6 leading-relaxed">
          {winResult.reason}
        </p>

        {/* Match Statistics Card */}
        <div className="w-full p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 mb-6 text-left">
          <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-3">
            Match Recap
          </h4>

          <div className="grid grid-cols-2 gap-3 text-xs mb-3">
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Total Turns</span>
              <span className="font-mono font-bold text-white text-base">{turnCount}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Abilities Used</span>
              <span className="font-mono font-bold text-purple-400 text-base">
                {p1AbilitiesUsed.length + p2AbilitiesUsed.length}
              </span>
            </div>
          </div>

          {/* Player 1 Ability recap */}
          <div className="text-[11px] text-slate-400 border-t border-slate-800/60 pt-2 mb-2">
            <span className="text-white font-semibold">{p1.name} used: </span>
            <span>
              {p1AbilitiesUsed.length > 0
                ? p1AbilitiesUsed.map((id) => ABILITIES[id].name).join(', ')
                : 'None'}
            </span>
          </div>

          {/* Player 2 Ability recap */}
          <div className="text-[11px] text-slate-400">
            <span className="text-white font-semibold">{p2.name} used: </span>
            <span>
              {p2AbilitiesUsed.length > 0
                ? p2AbilitiesUsed.map((id) => ABILITIES[id].name).join(', ')
                : 'None'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 w-full">
          <button
            onClick={() => {
              soundManager.playClick();
              onRematch();
            }}
            className="py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:opacity-95 text-white font-display font-bold text-xs tracking-wider flex items-center justify-center gap-1.5 shadow-lg shadow-purple-600/20 cursor-pointer hover:scale-[1.02] transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>PLAY AGAIN</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onReturnToMenu();
            }}
            className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-display font-bold text-xs tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>MAIN MENU</span>
          </button>
        </div>
      </div>
    </div>
  );
};
