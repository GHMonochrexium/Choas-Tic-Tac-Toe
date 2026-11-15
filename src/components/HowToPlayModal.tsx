import React, { useState } from 'react';
import { X, BookOpen, Shuffle, Maximize2, EyeOff, FastForward, Bomb, SkipForward, Sparkles, Shield, Trophy, RefreshCcw, Crosshair, Minimize2 } from 'lucide-react';
import { ABILITIES, ALL_ABILITY_IDS } from '../utils/gameLogic';
import { soundManager } from '../utils/audio';

interface HowToPlayModalProps {
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'basics' | 'abilities' | 'privacy'>('basics');

  const handleTab = (tab: 'basics' | 'abilities' | 'privacy') => {
    soundManager.playClick();
    setActiveTab(tab);
  };

  const getIcon = (id: string) => {
    switch (id) {
      case 'shuffle': return <Shuffle className="w-5 h-5 text-amber-400" />;
      case 'outer_board': return <Maximize2 className="w-5 h-5 text-blue-400" />;
      case 'blind': return <EyeOff className="w-5 h-5 text-slate-300" />;
      case 'lunge': return <FastForward className="w-5 h-5 text-emerald-400" />;
      case 'nuke': return <Bomb className="w-5 h-5 text-red-500" />;
      case 'skip': return <SkipForward className="w-5 h-5 text-purple-400" />;
      case 'fakeout': return <Sparkles className="w-5 h-5 text-fuchsia-400" />;
      case 'turnover_bomb': return <RefreshCcw className="w-5 h-5 text-orange-400" />;
      case 'stab_shot': return <Crosshair className="w-5 h-5 text-rose-400" />;
      case 'retract': return <Minimize2 className="w-5 h-5 text-sky-400" />;
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fadeIn">
      <div className="w-full max-w-2xl max-h-[88vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-display text-white">How to Play</h2>
              <p className="text-xs text-slate-400">Official Game Rules & Ability Codex</p>
            </div>
          </div>

          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 p-1.5 gap-1">
          <button
            onClick={() => handleTab('basics')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'basics' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Core Rules & Expansion
          </button>
          <button
            onClick={() => handleTab('abilities')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'abilities' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            The 10 Chaos Abilities
          </button>
          <button
            onClick={() => handleTab('privacy')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'privacy' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Privacy & Handover
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-300 text-xs md:text-sm leading-relaxed">
          {activeTab === 'basics' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <h3 className="text-base font-bold text-white font-display mb-1.5 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  Winning Conditions
                </h3>
                <p className="text-xs text-slate-300 mb-3">
                  The match begins on a standard 3x3 board. Complete a horizontal, vertical, or diagonal line to win!
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="block font-mono font-bold text-white text-base">3x3</span>
                    <span className="text-purple-400 font-semibold">3 in a row</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="block font-mono font-bold text-white text-base">4x4</span>
                    <span className="text-purple-400 font-semibold">4 in a row</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="block font-mono font-bold text-white text-base">5x5</span>
                    <span className="text-purple-400 font-semibold">5 in a row</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="block font-mono font-bold text-white text-base">6x6</span>
                    <span className="text-purple-400 font-semibold">6 in a row</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <h3 className="text-sm font-bold text-white mb-2">Turn Flow & Stalemate Rules</h3>
                <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-400">
                  <li>Each player drafts <strong className="text-white">EXACTLY 3 abilities</strong> before the game starts.</li>
                  <li>After placing your normal symbol, you can trigger one of your selected abilities or pass.</li>
                  <li>Abilities have limited uses (1 to 3 per match) — plan your timing strategically!</li>
                  <li><strong className="text-amber-300">Stalemate on 3x3 or 4x4:</strong> The arena automatically expands to <strong className="text-white">5x5</strong> so the battle continues!</li>
                  <li><strong className="text-amber-300">Stalemate on 5x5 or 6x6:</strong> The board resets to <strong className="text-white">4x4</strong> and all symbols are cleared!</li>
                  <li>Simultaneous winning lines (e.g. from Shuffle) result in an honorable Draw.</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'abilities' && (
            <div className="space-y-3">
              {ALL_ABILITY_IDS.map((id) => {
                const ab = ABILITIES[id];
                return (
                  <div key={id} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        {getIcon(id)}
                        <h4 className="text-sm font-bold text-white font-display">{ab.name}</h4>
                      </div>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                        {ab.maxUses} {ab.maxUses === 1 ? 'Use' : 'Uses'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mb-1">{ab.description}</p>
                    <p className="text-[11px] text-purple-400 italic">{ab.visualExplanation}</p>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <h3 className="text-base font-bold text-white font-display mb-2 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-cyan-400" />
                  Local Multiplayer Fairness
                </h3>
                <p className="text-xs text-slate-300 mb-3">
                  When two players battle on the same tablet or phone, privacy screens prevent screen peeking:
                </p>
                <div className="space-y-2 text-xs text-slate-400">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <strong className="text-white block mb-0.5">1. Secret Loadout Drafting</strong>
                    <span>Player 1 drafts abilities privately, taps handover, and passes device to Player 2.</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <strong className="text-white block mb-0.5">2. Blindness Blackout</strong>
                    <span>When Blind is activated, the opponent receives the device covered in a 100% black screen. They must tap in the dark to guess a valid move without seeing any prior moves or symbols!</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="py-2 px-5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            Got it, Let's Battle!
          </button>
        </div>
      </div>
    </div>
  );
};
