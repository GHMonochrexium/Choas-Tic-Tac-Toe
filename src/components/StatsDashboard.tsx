import React from 'react';
import {
  X,
  Trophy,
  Flame,
  Award,
  Zap,
  Bomb,
  EyeOff,
  Sparkles,
  Brain,
  CheckCircle2,
  Lock,
  Smile,
  Crown,
  Skull,
  Swords,
  Target,
} from 'lucide-react';
import { Achievement, GameStatistics, AbilityId } from '../types/game';
import { ABILITIES } from '../utils/gameLogic';
import { soundManager } from '../utils/audio';

interface StatsDashboardProps {
  stats: GameStatistics;
  achievements: Achievement[];
  onClose: () => void;
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({
  stats,
  achievements,
  onClose,
}) => {
  const winRate =
    stats.totalGames > 0 ? Math.round((stats.wins / stats.totalGames) * 100) : 0;

  // Find most frequently used ability
  let mostUsedAbilityName = 'None Yet';
  let highestCount = 0;
  Object.entries(stats.abilityUses).forEach(([key, count]) => {
    if (count > highestCount) {
      highestCount = count;
      mostUsedAbilityName = ABILITIES[key as AbilityId]?.name || key;
    }
  });

  const getAchievementIcon = (iconName: string) => {
    switch (iconName) {
      case 'Trophy':
        return <Trophy className="w-5 h-5" />;
      case 'Brain':
        return <Brain className="w-5 h-5" />;
      case 'Bomb':
        return <Bomb className="w-5 h-5" />;
      case 'Sparkles':
        return <Sparkles className="w-5 h-5" />;
      case 'EyeOff':
        return <EyeOff className="w-5 h-5" />;
      case 'Flame':
        return <Flame className="w-5 h-5" />;
      case 'Zap':
        return <Zap className="w-5 h-5" />;
      case 'Smile':
        return <Smile className="w-5 h-5" />;
      case 'Crown':
        return <Crown className="w-5 h-5" />;
      case 'Skull':
        return <Skull className="w-5 h-5" />;
      case 'Swords':
        return <Swords className="w-5 h-5" />;
      case 'Target':
        return <Target className="w-5 h-5" />;
      default:
        return <Award className="w-5 h-5" />;
    }
  };

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fadeIn">
      <div className="w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-yellow-600/20 border border-yellow-500/30 flex items-center justify-center text-yellow-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-display text-white">Player Records & Badges</h2>
              <p className="text-xs text-slate-400">Career Statistics & Chaos Mastery</p>
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

        {/* Scrollable Dashboard Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* General Stats Overview Cards */}
          <div>
            <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-3">
              General Overview
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-[11px] text-slate-400 block mb-0.5">Total Matches</span>
                <span className="font-mono text-2xl font-bold text-white tabular-nums">
                  {stats.totalGames}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-[11px] text-slate-400 block mb-0.5">Win Rate</span>
                <span className="font-mono text-2xl font-bold text-emerald-400 tabular-nums">
                  {winRate}%
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-[11px] text-slate-400 block mb-0.5">Current Streak</span>
                <span className="font-mono text-2xl font-bold text-yellow-400 tabular-nums flex items-center gap-1">
                  <Flame className="w-4 h-4 text-orange-400 inline" />
                  {stats.currentStreak}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-[11px] text-slate-400 block mb-0.5">Longest Streak</span>
                <span className="font-mono text-2xl font-bold text-purple-400 tabular-nums">
                  {stats.longestStreak}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-3">
              <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 text-center">
                <span className="text-[11px] text-slate-400 block">Wins</span>
                <span className="font-mono font-bold text-emerald-400 text-lg tabular-nums">
                  {stats.wins}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 text-center">
                <span className="text-[11px] text-slate-400 block">Losses</span>
                <span className="font-mono font-bold text-red-400 text-lg tabular-nums">
                  {stats.losses}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 text-center">
                <span className="text-[11px] text-slate-400 block">Draws</span>
                <span className="font-mono font-bold text-slate-400 text-lg tabular-nums">
                  {stats.draws}
                </span>
              </div>
            </div>

            <div className="mt-3 p-3 rounded-xl bg-purple-950/30 border border-purple-500/30 flex items-center justify-between text-xs">
              <span className="text-slate-300">Most Frequently Used Ability:</span>
              <span className="font-bold text-purple-300 font-display text-sm">
                {mostUsedAbilityName} {highestCount > 0 && `(${highestCount}x)`}
              </span>
            </div>
          </div>

          {/* Ability Usage Breakdown */}
          <div>
            <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-3">
              Ability Deployments
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {Object.entries(stats.abilityUses).map(([abKey, count]) => {
                const ab = ABILITIES[abKey as AbilityId];
                if (!ab) return null;
                return (
                  <div
                    key={abKey}
                    className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between"
                  >
                    <span className="text-xs font-medium text-slate-300">{ab.name}</span>
                    <span className="font-mono text-xs font-bold text-white bg-slate-800 px-2 py-0.5 rounded">
                      {count}x
                    </span>
                  </div>
                );
              })}

              {/* Fakeout success / fail tracker */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between col-span-2 sm:col-span-1">
                <span className="text-xs font-medium text-slate-300">Fakeouts Duped</span>
                <span className="font-mono text-xs font-bold text-fuchsia-400 bg-fuchsia-950/60 px-2 py-0.5 rounded border border-fuchsia-500/30">
                  {stats.fakeoutsSucceeded} won / {stats.fakeoutsFailed} busted
                </span>
              </div>
            </div>
          </div>

          {/* Achievements Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                Achievements & Badges
              </h3>
              <span className="text-xs font-mono text-purple-400 font-semibold">
                {unlockedCount} / {achievements.length} Unlocked
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {achievements.map((ach) => (
                <div
                  key={ach.id}
                  className={`p-3.5 rounded-2xl border flex items-start gap-3 transition-all ${
                    ach.unlocked
                      ? 'bg-purple-950/30 border-purple-500/50 shadow-md shadow-purple-950/30'
                      : 'bg-slate-950/40 border-slate-800/80 opacity-60'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      ach.unlocked
                        ? 'bg-purple-600/30 border border-purple-500 text-purple-300 shadow-sm'
                        : 'bg-slate-900 border border-slate-800 text-slate-600'
                    }`}
                  >
                    {ach.unlocked ? getAchievementIcon(ach.icon) : <Lock className="w-5 h-5" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <h4
                        className={`text-xs font-bold font-display truncate ${
                          ach.unlocked ? 'text-white' : 'text-slate-400'
                        }`}
                      >
                        {ach.title}
                      </h4>
                      {ach.unlocked && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      )}
                    </div>

                    <p className="text-[11px] text-slate-400 leading-normal mb-1.5">
                      {ach.description}
                    </p>

                    {/* Progress bar if not unlocked */}
                    {!ach.unlocked && ach.progress && (
                      <div className="w-full">
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-purple-500 rounded-full"
                            style={{
                              width: `${Math.min(
                                100,
                                Math.round((ach.progress.current / ach.progress.target) * 100)
                              )}%`,
                            }}
                          />
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 mt-0.5 block">
                          {ach.progress.current} / {ach.progress.target}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
