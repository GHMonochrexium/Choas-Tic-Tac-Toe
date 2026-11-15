import React, { useState } from 'react';
import {
  Shuffle as ShuffleIcon,
  Maximize2,
  EyeOff,
  FastForward,
  Bomb,
  SkipForward,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RefreshCcw,
  Crosshair,
  Minimize2,
} from 'lucide-react';
import { AbilityId, AbilityDefinition, PlayerSymbol } from '../types/game';
import { ABILITIES, ALL_ABILITY_IDS } from '../utils/gameLogic';
import { soundManager } from '../utils/audio';

interface AbilitySelectorProps {
  playerNumber: 1 | 2;
  playerName: string;
  playerSymbol: PlayerSymbol;
  onConfirm: (selectedAbilities: AbilityId[]) => void;
  isPvP: boolean;
}

export const AbilitySelector: React.FC<AbilitySelectorProps> = ({
  playerNumber,
  playerName,
  playerSymbol,
  onConfirm,
  isPvP,
}) => {
  const [selected, setSelected] = useState<AbilityId[]>([]);
  const [activeInfo, setActiveInfo] = useState<AbilityId | null>(null);

  const toggleAbility = (id: AbilityId) => {
    soundManager.playClick();
    if (selected.includes(id)) {
      setSelected(selected.filter((item) => item !== id));
    } else {
      if (selected.length < 3) {
        setSelected([...selected, id]);
      } else {
        soundManager.playInvalid();
      }
    }
  };

  const isComplete = selected.length === 3;

  const handleConfirm = () => {
    if (!isComplete) {
      soundManager.playInvalid();
      return;
    }
    soundManager.playClick();
    onConfirm(selected);
  };

  const getAbilityIcon = (id: AbilityId) => {
    switch (id) {
      case 'shuffle':
        return <ShuffleIcon className="w-5 h-5" />;
      case 'outer_board':
        return <Maximize2 className="w-5 h-5" />;
      case 'blind':
        return <EyeOff className="w-5 h-5" />;
      case 'lunge':
        return <FastForward className="w-5 h-5" />;
      case 'nuke':
        return <Bomb className="w-5 h-5" />;
      case 'skip':
        return <SkipForward className="w-5 h-5" />;
      case 'fakeout':
        return <Sparkles className="w-5 h-5" />;
      case 'turnover_bomb':
        return <RefreshCcw className="w-5 h-5" />;
      case 'stab_shot':
        return <Crosshair className="w-5 h-5" />;
      case 'retract':
        return <Minimize2 className="w-5 h-5" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 w-full flex flex-col items-center">
      {/* Drafting Header */}
      <div className="w-full text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300 font-mono mb-2">
          {isPvP ? `SECRET DRAFT · PLAYER ${playerNumber}` : 'ABILITY LOADOUT DRAFT'}
        </div>

        <h1 className="text-2xl md:text-3xl font-black font-display text-white mb-2 flex items-center justify-center gap-2">
          <span>{playerName}</span>
          <span
            className={`px-2.5 py-0.5 rounded-lg text-lg font-mono font-bold ${
              playerSymbol === 'X' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'bg-pink-500/20 text-pink-400 border border-pink-500/40'
            }`}
          >
            {playerSymbol}
          </span>
          <span>Draft Your 3 Abilities</span>
        </h1>

        <p className="text-slate-400 text-xs md:text-sm max-w-lg mx-auto">
          Choose <strong className="text-white">EXACTLY 3</strong> abilities. You can activate one ability per turn after making a move.
        </p>

        {/* Counter indicator */}
        <div className="mt-4 flex items-center justify-center gap-2">
          {[0, 1, 2].map((slotIdx) => {
            const chosenId = selected[slotIdx];
            const ability = chosenId ? ABILITIES[chosenId] : null;
            return (
              <div
                key={slotIdx}
                className={`h-9 px-3.5 rounded-xl border flex items-center gap-2 text-xs font-semibold transition-all ${
                  ability
                    ? 'bg-purple-950/70 border-purple-500 text-purple-200 shadow-md shadow-purple-900/30'
                    : 'bg-slate-900/50 border-slate-800 text-slate-500 border-dashed'
                }`}
              >
                {ability ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                    <span>{ability.name}</span>
                  </>
                ) : (
                  <span>Slot {slotIdx + 1} Empty</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid of 7 Abilities */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 w-full mb-8">
        {ALL_ABILITY_IDS.map((id) => {
          const ab = ABILITIES[id];
          const isSelected = selected.includes(id);
          const isDisabled = !isSelected && selected.length >= 3;

          return (
            <div
              key={id}
              onClick={() => !isDisabled && toggleAbility(id)}
              className={`relative rounded-xl p-4 border transition-all text-left flex flex-col justify-between cursor-pointer select-none group ${
                isSelected
                  ? 'bg-slate-900 border-purple-500 shadow-lg shadow-purple-500/20 ring-1 ring-purple-500'
                  : isDisabled
                  ? 'bg-slate-950/40 border-slate-900 opacity-40 cursor-not-allowed'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center text-white bg-gradient-to-br ${ab.accentColor} shadow-md`}
                    >
                      {getAbilityIcon(id)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold font-display text-white group-hover:text-purple-300 transition-colors">
                        {ab.name}
                      </h3>
                      <span className="text-[11px] text-slate-400 leading-none">
                        {ab.tagline}
                      </span>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-[11px] font-mono font-bold text-slate-300 whitespace-nowrap">
                    {ab.maxUses} {ab.maxUses === 1 ? 'Use' : 'Uses'}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  {ab.description}
                </p>
              </div>

              {/* Visual effect summary footer */}
              <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span className="truncate pr-2 italic">{ab.visualExplanation}</span>
                <span
                  className={`text-xs font-bold shrink-0 ${
                    isSelected ? 'text-purple-400' : 'text-slate-500'
                  }`}
                >
                  {isSelected ? 'SELECTED' : '+ SELECT'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirm Button */}
      <div className="w-full max-w-md flex flex-col items-center gap-2">
        <button
          onClick={handleConfirm}
          disabled={!isComplete}
          className={`w-full py-3.5 px-6 rounded-xl font-display font-bold text-sm tracking-wide transition-all shadow-lg cursor-pointer ${
            isComplete
              ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-500 hover:opacity-95 text-white shadow-purple-600/30 hover:scale-[1.01]'
              : 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed'
          }`}
        >
          {isComplete
            ? isPvP && playerNumber === 1
              ? 'CONFIRM & HANDOVER TO PLAYER 2 →'
              : 'CONFIRM LOADOUT & ENTER BATTLE →'
            : `SELECT ${3 - selected.length} MORE ABILIT${3 - selected.length === 1 ? 'Y' : 'IES'}`}
        </button>

        {!isComplete && (
          <p className="text-[11px] text-amber-400/90 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            Rule requirement: Exactly 3 abilities must be picked to balance the match.
          </p>
        )}
      </div>
    </div>
  );
};
