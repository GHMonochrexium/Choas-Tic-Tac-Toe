import { Achievement, AIDifficulty, GameMode, GameSettings, GameStatistics, AbilityId } from '../types/game';

const STATS_KEY = 'chaos_ttt_stats_v1';
const ACHIEVEMENTS_KEY = 'chaos_ttt_achievements_v1';
const SETTINGS_KEY = 'chaos_ttt_settings_v1';

export const INITIAL_STATS: GameStatistics = {
  totalGames: 0,
  wins: 0,
  losses: 0,
  draws: 0,
  currentStreak: 0,
  longestStreak: 0,
  pvpWins: 0,
  aiDifficultyStreaks: {
    easy: 0,
    medium: 0,
    hard: 0,
    insane: 0,
  },
  aiDifficultyBestStreaks: {
    easy: 0,
    medium: 0,
    hard: 0,
    insane: 0,
  },
  abilityUses: {
    shuffle: 0,
    outer_board: 0,
    blind: 0,
    lunge: 0,
    nuke: 0,
    skip: 0,
    fakeout: 0,
    turnover_bomb: 0,
    stab_shot: 0,
    retract: 0,
  },
  fakeoutsSucceeded: 0,
  fakeoutsFailed: 0,
  blindWins: 0,
  allThreeAbilitiesUsedWins: 0,
};

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_victory',
    title: 'First Victory',
    description: 'Win your first game in any mode.',
    icon: 'Trophy',
    unlocked: false,
    progress: { current: 0, target: 1 },
  },
  {
    id: 'mastermind',
    title: 'Mastermind',
    description: 'Win 10 games total.',
    icon: 'Brain',
    unlocked: false,
    progress: { current: 0, target: 10 },
  },
  {
    id: 'nuclear_menace',
    title: 'Nuclear Menace',
    description: 'Deploy the Nuclear Bomb 10 times.',
    icon: 'Bomb',
    unlocked: false,
    progress: { current: 0, target: 10 },
  },
  {
    id: 'trickster',
    title: 'Trickster',
    description: 'Successfully deceive an opponent with Fakeout 5 times.',
    icon: 'Sparkles',
    unlocked: false,
    progress: { current: 0, target: 5 },
  },
  {
    id: 'survivor',
    title: 'Survivor',
    description: 'Win a game after surviving the Blindness effect.',
    icon: 'EyeOff',
    unlocked: false,
    progress: { current: 0, target: 1 },
  },
  {
    id: 'unstoppable',
    title: 'Unstoppable',
    description: 'Achieve a winning streak of 5 games in a row.',
    icon: 'Flame',
    unlocked: false,
    progress: { current: 0, target: 5 },
  },
  {
    id: 'chaos_master',
    title: 'Chaos Master',
    description: 'Win a game having activated all 3 of your chosen abilities.',
    icon: 'Zap',
    unlocked: false,
    progress: { current: 0, target: 1 },
  },
  {
    id: 'jester',
    title: 'Jester',
    description: 'Successfully fool an AI or friend with Fakeout in a game.',
    icon: 'Smile',
    unlocked: false,
    progress: { current: 0, target: 1 },
  },
  {
    id: 'master',
    title: 'Master',
    description: 'Achieve a 10-game winning streak.',
    icon: 'Crown',
    unlocked: false,
    progress: { current: 0, target: 10 },
  },
  {
    id: 'insanity',
    title: 'Insanity',
    description: 'Beat Insane AI 3 times in a row.',
    icon: 'Skull',
    unlocked: false,
    progress: { current: 0, target: 3 },
  },
  {
    id: 'crazy_demolisher',
    title: 'Crazy Demolisher',
    description: 'Beat Insane AI 10 times in a row.',
    icon: 'Flame',
    unlocked: false,
    progress: { current: 0, target: 10 },
  },
  {
    id: 'rival',
    title: 'Rival',
    description: 'Beat your friend in a local Pass & Play match.',
    icon: 'Swords',
    unlocked: false,
    progress: { current: 0, target: 1 },
  },
  {
    id: 'kingslayer',
    title: 'Kingslayer',
    description: 'Beat every AI difficulty (Easy, Medium, Hard & Insane) 3 times in a row.',
    icon: 'Crown',
    unlocked: false,
    progress: { current: 0, target: 4 },
  },
  {
    id: 'hardest_opportunities',
    title: 'Hardest Opportunities',
    description: 'Win 50 games total across any mode.',
    icon: 'Target',
    unlocked: false,
    progress: { current: 0, target: 50 },
  },
];

export const DEFAULT_SETTINGS: GameSettings = {
  sfxEnabled: true,
  sfxVolume: 0.7,
  musicEnabled: false,
  musicVolume: 0.35,
  screenShake: true,
  privacyHandover: true,
};

export function loadStats(): GameStatistics {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return { ...INITIAL_STATS };
    const parsed = JSON.parse(raw);
    return {
      ...INITIAL_STATS,
      ...parsed,
      aiDifficultyStreaks: {
        ...INITIAL_STATS.aiDifficultyStreaks,
        ...(parsed.aiDifficultyStreaks || {}),
      },
      aiDifficultyBestStreaks: {
        ...INITIAL_STATS.aiDifficultyBestStreaks,
        ...(parsed.aiDifficultyBestStreaks || {}),
      },
      abilityUses: {
        ...INITIAL_STATS.abilityUses,
        ...(parsed.abilityUses || {}),
      },
    };
  } catch {
    return { ...INITIAL_STATS };
  }
}

export function saveStats(stats: GameStatistics): void {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (err) {
    console.warn('Failed to save stats to localStorage', err);
  }
}

export function loadAchievements(): Achievement[] {
  try {
    const raw = localStorage.getItem(ACHIEVEMENTS_KEY);
    if (!raw) return [...INITIAL_ACHIEVEMENTS];
    const saved = JSON.parse(raw) as Achievement[];
    // Merge in case we added new achievements
    return INITIAL_ACHIEVEMENTS.map((initial) => {
      const existing = saved.find((s) => s.id === initial.id);
      return existing ? { ...initial, ...existing } : initial;
    });
  } catch {
    return [...INITIAL_ACHIEVEMENTS];
  }
}

export function saveAchievements(achievements: Achievement[]): void {
  try {
    localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(achievements));
  } catch (err) {
    console.warn('Failed to save achievements to localStorage', err);
  }
}

export function loadSettings(): GameSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings: GameSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.warn('Failed to save settings to localStorage', err);
  }
}

export interface MatchEndContext {
  won: boolean;
  lost: boolean;
  isDraw: boolean;
  gameMode: GameMode;
  aiDifficulty: AIDifficulty;
  abilitiesUsedInMatch: Set<AbilityId>;
  wasEverBlindedThisMatch: boolean;
  fakeoutSucceededThisMatch: boolean;
  fakeoutFailedThisMatch: boolean;
  nuclearUsedThisMatch: boolean;
}

export function updateStatsAndAchievementsOnGameEnd(
  currentStats: GameStatistics,
  currentAchievements: Achievement[],
  context: MatchEndContext
): { updatedStats: GameStatistics; updatedAchievements: Achievement[]; newlyUnlocked: Achievement[] } {
  const stats: GameStatistics = {
    ...currentStats,
    aiDifficultyStreaks: { ...currentStats.aiDifficultyStreaks },
    aiDifficultyBestStreaks: { ...currentStats.aiDifficultyBestStreaks },
    abilityUses: { ...currentStats.abilityUses },
  };
  stats.totalGames += 1;

  if (context.won) {
    stats.wins += 1;
    stats.currentStreak += 1;
    if (stats.currentStreak > stats.longestStreak) {
      stats.longestStreak = stats.currentStreak;
    }
    if (context.wasEverBlindedThisMatch) {
      stats.blindWins += 1;
    }
    if (context.abilitiesUsedInMatch.size >= 3) {
      stats.allThreeAbilitiesUsedWins += 1;
    }
  } else if (context.lost) {
    stats.losses += 1;
    stats.currentStreak = 0;
  } else {
    stats.draws += 1;
    stats.currentStreak = 0;
  }

  if (context.gameMode === 'pvp' && !context.isDraw) {
    stats.pvpWins = (stats.pvpWins || 0) + 1;
  }

  if (context.gameMode === 'ai') {
    const diff = context.aiDifficulty;
    if (context.won) {
      const nextDiffStreak = (stats.aiDifficultyStreaks[diff] || 0) + 1;
      stats.aiDifficultyStreaks[diff] = nextDiffStreak;
      if (nextDiffStreak > (stats.aiDifficultyBestStreaks[diff] || 0)) {
        stats.aiDifficultyBestStreaks[diff] = nextDiffStreak;
      }
    } else {
      stats.aiDifficultyStreaks[diff] = 0;
    }
  }

  if (context.fakeoutSucceededThisMatch) {
    stats.fakeoutsSucceeded += 1;
  }
  if (context.fakeoutFailedThisMatch) {
    stats.fakeoutsFailed += 1;
  }

  saveStats(stats);

  const difficultiesMastered3InARow = (['easy', 'medium', 'hard', 'insane'] as AIDifficulty[]).filter(
    (d) => (stats.aiDifficultyBestStreaks[d] || 0) >= 3
  ).length;

  // Check achievements
  const newlyUnlocked: Achievement[] = [];
  const updatedAchievements = currentAchievements.map((ach) => {
    if (ach.unlocked) return ach;
    let unlocked = false;
    let current = ach.progress?.current ?? 0;

    switch (ach.id) {
      case 'first_victory':
        current = stats.wins;
        unlocked = stats.wins >= 1;
        break;
      case 'mastermind':
        current = stats.wins;
        unlocked = stats.wins >= 10;
        break;
      case 'nuclear_menace':
        current = stats.abilityUses.nuke;
        unlocked = stats.abilityUses.nuke >= 10;
        break;
      case 'trickster':
        current = stats.fakeoutsSucceeded;
        unlocked = stats.fakeoutsSucceeded >= 5;
        break;
      case 'survivor':
        current = stats.blindWins;
        unlocked = stats.blindWins >= 1;
        break;
      case 'unstoppable':
        current = stats.currentStreak;
        unlocked = stats.currentStreak >= 5;
        break;
      case 'chaos_master':
        current = stats.allThreeAbilitiesUsedWins;
        unlocked = stats.allThreeAbilitiesUsedWins >= 1;
        break;
      case 'jester':
        current = stats.fakeoutsSucceeded;
        unlocked = stats.fakeoutsSucceeded >= 1;
        break;
      case 'master':
        current = Math.max(stats.currentStreak, stats.longestStreak);
        unlocked = current >= 10;
        break;
      case 'insanity':
        current = stats.aiDifficultyBestStreaks.insane || 0;
        unlocked = current >= 3;
        break;
      case 'crazy_demolisher':
        current = stats.aiDifficultyBestStreaks.insane || 0;
        unlocked = current >= 10;
        break;
      case 'rival':
        current = stats.pvpWins || 0;
        unlocked = current >= 1;
        break;
      case 'kingslayer':
        current = difficultiesMastered3InARow;
        unlocked = difficultiesMastered3InARow >= 4;
        break;
      case 'hardest_opportunities':
        current = stats.wins;
        unlocked = stats.wins >= 50;
        break;
    }

    if (unlocked) {
      const updated = {
        ...ach,
        unlocked: true,
        unlockedAt: Date.now(),
        progress: ach.progress ? { ...ach.progress, current: ach.progress.target } : undefined,
      };
      newlyUnlocked.push(updated);
      return updated;
    }

    return {
      ...ach,
      progress: ach.progress ? { ...ach.progress, current } : undefined,
    };
  });

  saveAchievements(updatedAchievements);

  return { updatedStats: stats, updatedAchievements, newlyUnlocked };
}
