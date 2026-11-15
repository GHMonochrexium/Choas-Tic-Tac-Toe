import React from 'react';
import {
  Shuffle as ShuffleIcon,
  Maximize2,
  EyeOff,
  FastForward,
  Bomb,
  SkipForward,
  Sparkles,
  RefreshCcw,
  Crosshair,
  Minimize2,
} from 'lucide-react';
import { AbilityId, PlayerState } from '../types/game';
import { ABILITIES } from '../utils/gameLogic';

interface OpponentAbilitiesProps {
  opponent: PlayerState;
  isHidden?: boolean;
}

export const OpponentAbilities: React.FC<OpponentAbilitiesProps> = ({
  opponent,
  isHidden = false,
}) => {
  const getAbilityIcon = (id: AbilityId) => {
    switch (id) {
      case 'shuffle':
        return <ShuffleIcon className="w-3.5 h-3.5" />;
      case 'outer_board':
        return <Maximize2 className="w-3.5 h-3.5" />;
      case 'blind':
        return <EyeOff className="w-3.5 h-3.5" />;
      case 'lunge':
        return <FastForward className="w-3.5 h-3.5" />;
      case 'nuke':
        return <Bomb className="w-3.5 h-3.5" />;
      case 'skip':
        return <SkipForward className="w-3.5 h-3.5" />;
      case 'fakeout':
        return <Sparkles className="w-3.5 h-3.5" />;
      case 'turnover_bomb':
        return <RefreshCcw className="w-3.5 h-3.5" />;
      case 'stab_shot':
        return <Crosshair className="w-3.5 h-3.5" />;
      case 'retract':
        return <Minimize2 className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto rounded-xl bg-slate-900/60 border border-slate-800/80 p-2.5 flex flex-col gap-2">
      <div className="flex items-center justify-between text-xs px-1">
        <div className="flex items-center gap-2">
          <span
            className={`w-5 h-5 rounded-md flex items-center justify-center font-display font-black text-[11px] ${
              opponent.symbol === 'X'
                ? 'bg-cyan-950/80 text-cyan-400 border border-cyan-500/40'
                : 'bg-pink-950/80 text-pink-400 border border-pink-500/40'
            }`}
          >
            {opponent.symbol}
          </span>
          <span className="font-semibold text-slate-300">
            {opponent.name}&apos;s Abilities
          </span>
        </div>
        <span className="text-[11px] text-slate-500">Read-only loadout</span>
      </div>

      {isHidden ? (
        <div className="py-2 px-3 rounded-lg bg-slate-950/70 border border-slate-800 text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
          <EyeOff className="w-3.5 h-3.5" />
          <span>Opponent abilities hidden while blinded</span>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {opponent.selectedAbilities.map((id) => {
            const ab = ABILITIES[id];
            const remaining = opponent.abilityUsesRemaining[id] ?? 0;
            const depleted = remaining <= 0;

            return (
              <div
                key={id}
                title={`${ab.name}: ${ab.description}`}
                className={`px-2.5 py-2 rounded-lg border flex items-center gap-2 transition-opacity ${
                  depleted
                    ? 'bg-slate-950/40 border-slate-900 opacity-40'
                    : 'bg-slate-950/70 border-slate-800/90'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-md flex items-center justify-center text-white bg-gradient-to-br ${ab.accentColor} shrink-0`}
                >
                  {getAbilityIcon(id)}
                </div>

                <div className="min-w-0 flex-1">
                  <span className="block text-[11px] font-bold text-slate-200 truncate font-display">
                    {ab.name}
                  </span>
                  <span
                    className={`block text-[10px] font-mono tabular-nums ${
                      depleted ? 'text-red-400' : 'text-slate-400'
                    }`}
                  >
                    {depleted ? '0 left' : `${remaining}/${ab.maxUses} left`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
