import React from 'react';
import {
  Shuffle as ShuffleIcon,
  Maximize2,
  EyeOff,
  FastForward,
  Bomb,
  SkipForward,
  Sparkles,
  Check,
  ChevronRight,
  RefreshCcw,
  Crosshair,
  Minimize2,
} from 'lucide-react';
import { AbilityId, PlayerState } from '../types/game';
import { ABILITIES } from '../utils/gameLogic';
import { soundManager } from '../utils/audio';

interface AbilityBarProps {
  player: PlayerState;
  onActivateAbility: (abilityId: AbilityId) => void;
  activeStagedAbility: AbilityId | null;
  onCancelStagedAbility: () => void;
  hasPlacedMove: boolean;
  onEndTurn: () => void;
  disabled: boolean;
  boardSize: number;
  isSkipDisabled?: boolean;
  isSkipBonusActive?: boolean;
  hasUsedAbilityThisTurn?: boolean;
}

export const AbilityBar: React.FC<AbilityBarProps> = ({
  player,
  onActivateAbility,
  activeStagedAbility,
  onCancelStagedAbility,
  hasPlacedMove,
  onEndTurn,
  disabled,
  boardSize,
  isSkipDisabled = false,
  isSkipBonusActive = false,
  hasUsedAbilityThisTurn = false,
}) => {
  const getAbilityIcon = (id: AbilityId) => {
    switch (id) {
      case 'shuffle':
        return <ShuffleIcon className="w-4 h-4" />;
      case 'outer_board':
        return <Maximize2 className="w-4 h-4" />;
      case 'blind':
        return <EyeOff className="w-4 h-4" />;
      case 'lunge':
        return <FastForward className="w-4 h-4" />;
      case 'nuke':
        return <Bomb className="w-4 h-4" />;
      case 'skip':
        return <SkipForward className="w-4 h-4" />;
      case 'fakeout':
        return <Sparkles className="w-4 h-4" />;
      case 'turnover_bomb':
        return <RefreshCcw className="w-4 h-4" />;
      case 'stab_shot':
        return <Crosshair className="w-4 h-4" />;
      case 'retract':
        return <Minimize2 className="w-4 h-4" />;
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center gap-2.5">
      {/* Turn Action Banner */}
      <div className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-white">Your Abilities:</span>
          <span className="text-slate-400">
            {isSkipBonusActive
              ? 'Skip bonus move! Place cross or circle (abilities locked).'
              : activeStagedAbility
              ? `Staged: ${ABILITIES[activeStagedAbility].name}`
              : hasUsedAbilityThisTurn
              ? 'Ability used this turn — place your symbol'
              : hasPlacedMove
              ? 'Choose 1 ability below or end turn'
              : 'Select an ability to activate, or make a move'}
          </span>
        </div>

        {hasPlacedMove && !isSkipBonusActive && (
          <button
            onClick={() => {
              soundManager.playClick();
              onEndTurn();
            }}
            className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 transition-colors shadow-sm cursor-pointer animate-pulse"
          >
            <span>Pass / End Turn</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* 3 Selected Abilities Row */}
      <div className="grid grid-cols-3 gap-2 w-full">
        {player.selectedAbilities.map((id) => {
          const ab = ABILITIES[id];
          const remaining = player.abilityUsesRemaining[id] ?? 0;
          const isStaged = activeStagedAbility === id;
          const isPassive = Boolean(ab.isPassive);
          const isBoardMaxed = id === 'outer_board' && boardSize >= 6;
          const isSkipSizeBlocked = id === 'skip' && boardSize < 4;
          const isSkipBlocked = id === 'skip' && isSkipDisabled;
          const isLungeSizeBlocked = id === 'lunge' && boardSize <= 4;
          const isTurnoverSizeBlocked = id === 'turnover_bomb' && boardSize !== 6;
          const isRetractSizeBlocked = id === 'retract' && boardSize < 4;
          const isAbilityUsedBlocked = hasUsedAbilityThisTurn && !isStaged;
          const isUsable =
            !isPassive &&
            remaining > 0 &&
            !disabled &&
            !isBoardMaxed &&
            !isSkipSizeBlocked &&
            !isSkipBlocked &&
            !isLungeSizeBlocked &&
            !isTurnoverSizeBlocked &&
            !isRetractSizeBlocked &&
            !isSkipBonusActive &&
            !isAbilityUsedBlocked;

          return (
            <button
              key={id}
              onClick={() => {
                if (isStaged) {
                  onCancelStagedAbility();
                } else if (isUsable) {
                  soundManager.playClick();
                  onActivateAbility(id);
                } else {
                  soundManager.playInvalid();
                }
              }}
              disabled={!isUsable && !isStaged}
              className={`p-2.5 rounded-xl border flex flex-col justify-between text-left transition-all relative overflow-hidden cursor-pointer select-none ${
                isStaged
                  ? 'bg-purple-950/80 border-purple-500 shadow-lg shadow-purple-500/25 ring-1 ring-purple-500'
                  : isPassive && remaining > 0
                  ? 'bg-rose-950/25 border-rose-500/40 cursor-default'
                  : isUsable
                  ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                  : 'bg-slate-950/40 border-slate-900 opacity-30 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-white bg-gradient-to-br ${ab.accentColor} shrink-0`}
                >
                  {getAbilityIcon(id)}
                </div>

                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                    remaining > 0
                      ? isPassive
                        ? 'bg-rose-950/70 text-rose-300 border border-rose-500/40'
                        : isSkipBonusActive ||
                          isSkipSizeBlocked ||
                          isSkipBlocked ||
                          isLungeSizeBlocked ||
                          isTurnoverSizeBlocked ||
                          isRetractSizeBlocked ||
                          isAbilityUsedBlocked
                        ? 'bg-amber-950/60 text-amber-400 border border-amber-800/60'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                      : 'bg-red-950/60 text-red-400'
                  }`}
                >
                  {remaining <= 0
                    ? '0 LEFT'
                    : isPassive
                    ? 'AUTO'
                    : isSkipBonusActive || isSkipBlocked || isAbilityUsedBlocked
                    ? 'LOCKED'
                    : isLungeSizeBlocked
                    ? '5x5+ ONLY'
                    : isTurnoverSizeBlocked
                    ? '6x6 ONLY'
                    : isSkipSizeBlocked || isRetractSizeBlocked
                    ? '4x4+ ONLY'
                    : `${remaining} LEFT`}
                </span>
              </div>

              <div>
                <span className="block text-xs font-bold text-white truncate font-display">
                  {ab.name}
                </span>
                <span className="block text-[10px] text-slate-400 truncate">
                  {isStaged
                    ? 'Active'
                    : isPassive
                    ? remaining > 0
                      ? 'Auto on diag win'
                      : 'Expended'
                    : isSkipBonusActive
                    ? 'Locked during Skip'
                    : isAbilityUsedBlocked
                    ? '1 ability / turn'
                    : isBoardMaxed
                    ? 'Max 6x6'
                    : isSkipSizeBlocked
                    ? 'Req 4x4+ board'
                    : isSkipBlocked
                    ? 'Used this turn'
                    : isLungeSizeBlocked
                    ? 'Req 5x5+ board'
                    : isTurnoverSizeBlocked
                    ? 'Req 6x6 board'
                    : isRetractSizeBlocked
                    ? 'Req 4x4+ board'
                    : ab.tagline}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
