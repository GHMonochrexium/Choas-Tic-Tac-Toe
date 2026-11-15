import React, { useState } from 'react';
import { Users, Bot, BookOpen, Trophy, Settings as SettingsIcon, Zap, Sparkles, Flame, ShieldAlert } from 'lucide-react';
import { soundManager } from '../utils/audio';
import { AIDifficulty, GameMode, GameStatistics } from '../types/game';

interface MainMenuProps {
  onStartGame: (mode: GameMode, aiDifficulty?: AIDifficulty) => void;
  onOpenHowToPlay: () => void;
  onOpenStats: () => void;
  onOpenSettings: () => void;
  stats: GameStatistics;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onStartGame,
  onOpenHowToPlay,
  onOpenStats,
  onOpenSettings,
  stats,
}) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<AIDifficulty>('medium');
  const [aiMenuOpen, setAiMenuOpen] = useState(false);

  const handleStartPvP = () => {
    soundManager.playClick();
    onStartGame('pvp');
  };

  const handleStartAI = (diff: AIDifficulty) => {
    soundManager.playClick();
    onStartGame('ai', diff);
  };

  const winPercentage = stats.totalGames > 0
    ? Math.round((stats.wins / stats.totalGames) * 100)
    : 0;

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-8 max-w-4xl mx-auto w-full">
      {/* Hero Title Section */}
      <div className="text-center mb-8 relative">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-300 text-xs font-semibold tracking-wider uppercase mb-3 backdrop-blur-sm animate-pulse">
          <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
          Arcade Battle Edition
        </div>
        
        <h1 className="text-4xl md:text-6xl font-black font-display tracking-tight text-white mb-3">
          CHAOS <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400">TIC-TAC-TOE</span>
        </h1>
        
        <p className="text-slate-400 max-w-lg mx-auto text-sm md:text-base leading-relaxed">
          The classic game rebuilt for pure mayhem. Unleash nuclear bombs, blinds, dynamic board expansions, and deceptive mind games.
        </p>
      </div>

      {/* Main Game Mode Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl mb-8">
        {/* Local 2-Player */}
        <button
          onClick={handleStartPvP}
          className="group relative p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 hover:border-cyan-500/50 shadow-xl hover:shadow-cyan-500/10 transition-all text-left flex flex-col justify-between overflow-hidden cursor-pointer"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/15 transition-colors" />
          
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-xs font-mono font-bold text-cyan-400/80 tracking-wider">LOCAL 1V1</span>
          </div>

          <div>
            <h2 className="text-xl font-bold font-display text-white mb-1 group-hover:text-cyan-300 transition-colors">
              Pass & Play
            </h2>
            <p className="text-xs text-slate-400 leading-normal mb-4">
              Two players on one device with secret ability drafting and tactical privacy handover.
            </p>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 group-hover:translate-x-1 transition-transform">
              <span>Start Match</span>
              <span>→</span>
            </div>
          </div>
        </button>

        {/* Play Against AI */}
        <div className="group relative p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 hover:border-purple-500/50 shadow-xl hover:shadow-purple-500/10 transition-all text-left flex flex-col justify-between overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/15 transition-colors" />
          
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-950/80 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
              <Bot className="w-6 h-6" />
            </div>
            <span className="text-xs font-mono font-bold text-purple-400/80 tracking-wider">SOLO CHALLENGE</span>
          </div>

          <div>
            <h2 className="text-xl font-bold font-display text-white mb-1 group-hover:text-purple-300 transition-colors">
              Play Against AI
            </h2>
            <p className="text-xs text-slate-400 leading-normal mb-3">
              Battle an adaptive opponent that understands all 10 chaotic abilities.
            </p>

            {/* AI Difficulty Selector Buttons */}
            <div className="grid grid-cols-4 gap-1.5 mb-3">
              {(['easy', 'medium', 'hard', 'insane'] as AIDifficulty[]).map((diff) => {
                const isSelected = selectedDifficulty === diff;
                const isInsane = diff === 'insane';
                return (
                  <button
                    key={diff}
                    onClick={() => {
                      soundManager.playClick();
                      setSelectedDifficulty(diff);
                    }}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all capitalize cursor-pointer ${
                      isSelected
                        ? isInsane
                          ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-sm shadow-red-600/50 ring-1 ring-red-400/60'
                          : 'bg-purple-600 text-white shadow-sm shadow-purple-600/50'
                        : isInsane
                        ? 'bg-red-950/40 text-red-300 border border-red-900/50 hover:text-white hover:bg-red-950/80'
                        : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {diff}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => handleStartAI(selectedDifficulty)}
              className={`w-full py-2 px-3 rounded-lg text-white text-xs font-bold font-display flex items-center justify-center gap-1.5 transition-colors shadow-md cursor-pointer ${
                selectedDifficulty === 'insane'
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 shadow-red-600/30'
                  : 'bg-purple-600 hover:bg-purple-500 shadow-purple-600/30'
              }`}
            >
              <span>Play vs {selectedDifficulty.toUpperCase()} AI</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </div>

      {/* Secondary Menu Buttons: How to Play, Stats, Settings */}
      <div className="grid grid-cols-3 gap-3 w-full max-w-2xl mb-8">
        <button
          onClick={() => {
            soundManager.playClick();
            onOpenHowToPlay();
          }}
          className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/60 text-slate-300 hover:text-white flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer group"
        >
          <BookOpen className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-semibold">How to Play</span>
        </button>

        <button
          onClick={() => {
            soundManager.playClick();
            onOpenStats();
          }}
          className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/60 text-slate-300 hover:text-white flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer group"
        >
          <Trophy className="w-5 h-5 text-yellow-400 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-semibold">Statistics</span>
        </button>

        <button
          onClick={() => {
            soundManager.playClick();
            onOpenSettings();
          }}
          className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/60 text-slate-300 hover:text-white flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer group"
        >
          <SettingsIcon className="w-5 h-5 text-slate-400 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-semibold">Settings</span>
        </button>
      </div>

      {/* Quick Player Stat Bar */}
      <div className="w-full max-w-2xl p-3 rounded-xl bg-slate-900/40 border border-slate-800/60 flex items-center justify-around text-center text-xs text-slate-400">
        <div>
          <span className="block font-mono text-base font-bold text-white tabular-nums">{stats.totalGames}</span>
          <span>Games Played</span>
        </div>
        <div className="w-px h-6 bg-slate-800" />
        <div>
          <span className="block font-mono text-base font-bold text-emerald-400 tabular-nums">{winPercentage}%</span>
          <span>Win Rate</span>
        </div>
        <div className="w-px h-6 bg-slate-800" />
        <div>
          <span className="block font-mono text-base font-bold text-yellow-400 tabular-nums flex items-center justify-center gap-1">
            <Flame className="w-3.5 h-3.5 text-orange-400 inline" />
            {stats.currentStreak}
          </span>
          <span>Current Streak</span>
        </div>
        <div className="w-px h-6 bg-slate-800" />
        <div>
          <span className="block font-mono text-base font-bold text-purple-400 tabular-nums">{stats.longestStreak}</span>
          <span>Best Streak</span>
        </div>
      </div>
    </div>
  );
};
