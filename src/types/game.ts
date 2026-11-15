export type PlayerSymbol = 'X' | 'O';
export type PlayerId = 'p1' | 'p2';
export type GameMode = 'pvp' | 'ai';
export type AIDifficulty = 'easy' | 'medium' | 'hard' | 'insane';

export type AbilityId =
  | 'shuffle'
  | 'outer_board'
  | 'blind'
  | 'lunge'
  | 'nuke'
  | 'skip'
  | 'fakeout'
  | 'turnover_bomb'
  | 'stab_shot'
  | 'retract';

export interface AbilityDefinition {
  id: AbilityId;
  name: string;
  maxUses: number;
  tagline: string;
  description: string;
  visualExplanation: string;
  accentColor: string; // Tailwind color class or hex
  glowColor: string;
  isPassive?: boolean;
}

export interface CellState {
  symbol: PlayerSymbol | null;
  isFake: boolean;
  fakeOwner?: PlayerId;
  isBlocked: boolean; // Nuclear bomb destruction
  destroyedAt?: number;
}

export interface PlayerState {
  id: PlayerId;
  name: string;
  symbol: PlayerSymbol;
  isAI: boolean;
  selectedAbilities: AbilityId[];
  abilityUsesRemaining: Record<AbilityId, number>;
  color: string;
}

export type GamePhase =
  | 'MENU'
  | 'HOW_TO_PLAY'
  | 'STATS'
  | 'SETTINGS'
  | 'ABILITY_SELECT_P1'
  | 'HANDOVER_P2_SELECT'
  | 'ABILITY_SELECT_P2'
  | 'HANDOVER_GAME_START'
  | 'PLAYING'
  | 'HANDOVER_BLIND_TURN'
  | 'GAME_OVER';

export interface WinResult {
  winner: PlayerSymbol | 'DRAW' | null;
  winningCells: { r: number; c: number }[];
  reason: string;
  isStalemate?: boolean;
  isDiagonalWin?: boolean;
  diagonalWinningCells?: { r: number; c: number }[];
}

export interface GameSettings {
  sfxEnabled: boolean;
  sfxVolume: number;
  musicEnabled: boolean;
  musicVolume: number;
  screenShake: boolean;
  privacyHandover: boolean; // privacy screens in local 2P
}

export interface MoveLogEntry {
  id: string;
  text: string;
  player?: PlayerSymbol;
  type: 'move' | 'ability' | 'nuke' | 'system' | 'warn';
  timestamp: number;
}

export interface GameStatistics {
  totalGames: number;
  wins: number;
  losses: number;
  draws: number;
  currentStreak: number;
  longestStreak: number;
  pvpWins: number;
  aiDifficultyStreaks: Record<AIDifficulty, number>;
  aiDifficultyBestStreaks: Record<AIDifficulty, number>;
  abilityUses: Record<AbilityId, number>;
  fakeoutsSucceeded: number;
  fakeoutsFailed: number;
  blindWins: number; // won after being blinded
  allThreeAbilitiesUsedWins: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: number;
  progress?: {
    current: number;
    target: number;
  };
}
