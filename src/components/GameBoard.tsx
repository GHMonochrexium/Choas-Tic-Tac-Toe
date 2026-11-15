import React, { useState } from 'react';
import { CellState, PlayerId, PlayerSymbol } from '../types/game';
import { Radiation, Sparkles, EyeOff } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface GameBoardProps {
  board: CellState[][];
  size: number;
  winningCells: { r: number; c: number }[];
  isBlinded: boolean;
  blindedPlayerName?: string;
  isShuffling: boolean;
  onCellClick: (r: number, c: number) => void;
  disabled: boolean;
  currentTurnSymbol: PlayerSymbol;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  board,
  size,
  winningCells,
  isBlinded,
  blindedPlayerName,
  isShuffling,
  onCellClick,
  disabled,
  currentTurnSymbol,
}) => {
  const [blindFeedback, setBlindFeedback] = useState<string | null>(null);

  const isWinningCell = (r: number, c: number) => {
    return winningCells.some((cell) => cell.r === r && cell.c === c);
  };

  const handleCellClick = (r: number, c: number) => {
    if (disabled) return;

    if (isBlinded) {
      // In blindness, player can tap in the dark.
      const cell = board[r]?.[c];
      if (!cell || cell.symbol !== null || cell.isBlocked) {
        soundManager.playInvalid();
        setBlindFeedback('Occupied or blocked! You stumble in the dark...');
        setTimeout(() => setBlindFeedback(null), 1500);
        return;
      }
      setBlindFeedback(null);
    }

    onCellClick(r, c);
  };

  // Determine grid template cols based on size
  const getGridColsClass = () => {
    switch (size) {
      case 3:
        return 'grid-cols-3';
      case 4:
        return 'grid-cols-4';
      case 5:
        return 'grid-cols-5';
      case 6:
        return 'grid-cols-6';
      default:
        return 'grid-cols-3';
    }
  };

  // Max width constraint so grid stays square and proportional
  const getMaxWidthClass = () => {
    switch (size) {
      case 3:
        return 'max-w-[340px] md:max-w-[420px]';
      case 4:
        return 'max-w-[380px] md:max-w-[460px]';
      case 5:
        return 'max-w-[420px] md:max-w-[500px]';
      case 6:
        return 'max-w-[440px] md:max-w-[540px]';
      default:
        return 'max-w-[420px]';
    }
  };

  const getCellFontSize = () => {
    switch (size) {
      case 3:
        return 'text-4xl md:text-6xl';
      case 4:
        return 'text-3xl md:text-5xl';
      case 5:
        return 'text-2xl md:text-4xl';
      case 6:
        return 'text-xl md:text-3xl';
      default:
        return 'text-4xl';
    }
  };

  return (
    <div className="relative w-full flex flex-col items-center select-none">
      {/* Container with dynamic sizing and subtle glowing backdrop */}
      <div
        className={`w-full aspect-square ${getMaxWidthClass()} p-2 md:p-3 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl shadow-purple-950/20 backdrop-blur-sm relative overflow-hidden transition-all duration-500`}
      >
        {/* Subtle background grid pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/10 via-transparent to-transparent pointer-events-none" />

        {/* The Grid */}
        <div className={`grid ${getGridColsClass()} gap-2 md:gap-2.5 w-full h-full relative z-10`}>
          {board.map((row, r) =>
            row.map((cell, c) => {
              const winning = isWinningCell(r, c);

              return (
                <button
                  key={`${r}-${c}`}
                  onClick={() => handleCellClick(r, c)}
                  disabled={disabled && !isBlinded}
                  aria-label={`Row ${r + 1}, Column ${c + 1}`}
                  className={`w-full h-full rounded-2xl flex items-center justify-center font-display font-black relative transition-all duration-200 cursor-pointer ${getCellFontSize()} ${
                    cell.isBlocked
                      ? 'bg-red-950/40 border border-red-900/60 cursor-not-allowed text-red-500 shadow-inner'
                      : winning
                      ? 'bg-yellow-500/25 border-2 border-yellow-400 text-yellow-300 shadow-lg shadow-yellow-500/40 animate-pulse scale-[1.03] z-20'
                      : cell.symbol
                      ? 'bg-slate-800/80 border border-slate-700/80 shadow-md'
                      : 'bg-slate-950/60 border border-slate-800/60 hover:border-slate-600 hover:bg-slate-800/40'
                  } ${isShuffling ? 'animate-spin' : ''}`}
                >
                  {/* Blocked by Nuclear Explosion */}
                  {cell.isBlocked ? (
                    <div className="flex flex-col items-center justify-center text-red-500/80">
                      <Radiation className="w-5 h-5 md:w-7 md:h-7 animate-pulse" />
                      <span className="text-[9px] font-mono tracking-tighter uppercase text-red-400/80 mt-0.5">
                        BLAST
                      </span>
                    </div>
                  ) : cell.isFake ? (
                    /* Fakeout Symbol (Must be PURPLE per rules) */
                    <div className="flex items-center justify-center text-fuchsia-400 drop-shadow-[0_0_12px_rgba(217,70,239,0.9)] animate-pulse">
                      <span>{cell.symbol}</span>
                    </div>
                  ) : cell.symbol === 'X' ? (
                    /* Electric Blue X */
                    <span className="text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.7)]">
                      X
                    </span>
                  ) : cell.symbol === 'O' ? (
                    /* Neon Pink O */
                    <span className="text-pink-400 drop-shadow-[0_0_12px_rgba(244,114,182,0.7)]">
                      O
                    </span>
                  ) : null}
                </button>
              );
            })
          )}
        </div>

        {/* FULL SCREEN / BOARD BLINDNESS OVERLAY (Strict updated rules) */}
        {isBlinded && (
          <div className="absolute inset-0 bg-black z-40 flex flex-col items-center justify-center p-6 text-center select-none animate-fadeIn">
            {/* Subtle grid of blind interaction buttons matching board size so user can blindly tap squares */}
            <div className="absolute inset-2 md:inset-3 grid gap-2 md:gap-2.5 z-10 opacity-0">
              <div className={`grid ${getGridColsClass()} gap-2 md:gap-2.5 w-full h-full`}>
                {board.map((row, r) =>
                  row.map((_, c) => (
                    <button
                      key={`blind-${r}-${c}`}
                      onClick={() => handleCellClick(r, c)}
                      className="w-full h-full cursor-pointer bg-white"
                      title="Tap blindly"
                    />
                  ))
                )}
              </div>
            </div>

            {/* Blind Visual HUD */}
            <div className="relative z-20 flex flex-col items-center pointer-events-none max-w-xs">
              <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mb-3 animate-pulse">
                <EyeOff className="w-8 h-8" />
              </div>

              <h4 className="text-xl font-black font-display text-white uppercase tracking-wider mb-1">
                YOU ARE BLINDED!
              </h4>

              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                The board is completely pitch black. Tap anywhere on the grid to guess an empty square and place your {currentTurnSymbol}!
              </p>

              {blindFeedback ? (
                <div className="px-3.5 py-1.5 rounded-lg bg-red-950/80 border border-red-500 text-red-300 text-xs font-semibold animate-bounce">
                  {blindFeedback}
                </div>
              ) : (
                <span className="text-[11px] font-mono text-purple-400 uppercase tracking-widest">
                  Tap grid in the dark to clear blindness
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
