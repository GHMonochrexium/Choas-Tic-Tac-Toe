import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { MainMenu } from './components/MainMenu';
import { AbilitySelector } from './components/AbilitySelector';
import { HandoverScreen } from './components/HandoverScreen';
import { GameBoard } from './components/GameBoard';
import { AbilityBar } from './components/AbilityBar';
import { OpponentAbilities } from './components/OpponentAbilities';
import { VictoryModal } from './components/VictoryModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { StatsDashboard } from './components/StatsDashboard';
import { SettingsModal } from './components/SettingsModal';
import { NukeExplosionEffect } from './components/NukeExplosionEffect';

import {
  AbilityId,
  AIDifficulty,
  CellState,
  GameMode,
  GamePhase,
  GameSettings,
  GameStatistics,
  Achievement,
  MoveLogEntry,
  PlayerId,
  PlayerState,
  PlayerSymbol,
  WinResult,
} from './types/game';

import {
  createEmptyBoard,
  checkWinner,
  executeShuffle,
  executeOuterBoard,
  executeTurnoverBomb,
  executeRetract,
  expandBoardToSize,
  hasAnyPossibleWinRemaining,
  calculateRandomNukeZone,
  computeAIMove,
  getRequiredToWin,
  ALL_ABILITY_IDS,
  ABILITIES,
} from './utils/gameLogic';

import {
  loadStats,
  saveStats,
  loadAchievements,
  saveAchievements,
  loadSettings,
  saveSettings,
  updateStatsAndAchievementsOnGameEnd,
} from './utils/storage';

import { soundManager } from './utils/audio';
import { ArrowLeft, RefreshCw, Volume2, Shield, AlertCircle, Sparkles } from 'lucide-react';

export default function App() {
  // Settings & Persistent State
  const [settings, setSettings] = useState<GameSettings>(() => loadSettings());
  const [stats, setStats] = useState<GameStatistics>(() => loadStats());
  const [achievements, setAchievements] = useState<Achievement[]>(() => loadAchievements());
  const [newlyUnlockedBadge, setNewlyUnlockedBadge] = useState<Achievement | null>(null);

  // App Routing & Dialogs
  const [currentPhase, setCurrentPhase] = useState<GamePhase>('MENU');
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Match Configuration
  const [gameMode, setGameMode] = useState<GameMode>('pvp');
  const [aiDifficulty, setAiDifficulty] = useState<AIDifficulty>('medium');

  // Players
  const [p1, setP1] = useState<PlayerState>({
    id: 'p1',
    name: 'Player 1',
    symbol: 'X',
    isAI: false,
    selectedAbilities: [],
    abilityUsesRemaining: {} as Record<AbilityId, number>,
    color: 'text-cyan-400',
  });

  const [p2, setP2] = useState<PlayerState>({
    id: 'p2',
    name: 'Player 2',
    symbol: 'O',
    isAI: false,
    selectedAbilities: [],
    abilityUsesRemaining: {} as Record<AbilityId, number>,
    color: 'text-pink-400',
  });

  // Active Gameplay State
  const [boardSize, setBoardSize] = useState<number>(3);
  const [board, setBoard] = useState<CellState[][]>(() => createEmptyBoard(3));
  const [currentTurn, setCurrentTurn] = useState<PlayerId>('p1');
  const [turnCount, setTurnCount] = useState<number>(0);
  const [winResult, setWinResult] = useState<WinResult | null>(null);

  // Ability Execution States
  const [activeStagedAbility, setActiveStagedAbility] = useState<AbilityId | null>(null);
  const [lungePlacementsCount, setLungePlacementsCount] = useState<number>(0);
  const [isBlinded, setIsBlinded] = useState<Record<PlayerId, boolean>>({ p1: false, p2: false });
  const [hasPlacedMoveThisTurn, setHasPlacedMoveThisTurn] = useState<boolean>(false);
  const [isShufflingAnimation, setIsShufflingAnimation] = useState<boolean>(false);
  const [nukeBlastEffect, setNukeBlastEffect] = useState<{ active: boolean; count: number }>({
    active: false,
    count: 0,
  });
  const [screenShakeActive, setScreenShakeActive] = useState<boolean>(false);
  const [skipUsedThisTurn, setSkipUsedThisTurn] = useState<Record<PlayerId, boolean>>({ p1: false, p2: false });
  const [isSkipBonusActive, setIsSkipBonusActive] = useState<boolean>(false);
  const [skipMovesRemaining, setSkipMovesRemaining] = useState<number>(0);
  const [hasUsedAbilityThisTurn, setHasUsedAbilityThisTurn] = useState<boolean>(false);
  const [stalemateBanner, setStalemateBanner] = useState<string | null>(null);

  // Match Tracking for Stats & History
  const [p1AbilitiesUsedInMatch, setP1AbilitiesUsedInMatch] = useState<Set<AbilityId>>(new Set());
  const [p2AbilitiesUsedInMatch, setP2AbilitiesUsedInMatch] = useState<Set<AbilityId>>(new Set());
  const [wasBlindedThisMatch, setWasBlindedThisMatch] = useState<Record<PlayerId, boolean>>({
    p1: false,
    p2: false,
  });
  const [fakeoutSucceededMatch, setFakeoutSucceededMatch] = useState<boolean>(false);
  const [fakeoutFailedMatch, setFakeoutFailedMatch] = useState<boolean>(false);
  const [moveLogs, setMoveLogs] = useState<MoveLogEntry[]>([]);

  // Prevent multiple executions during AI turns
  const [isAIProcessing, setIsAIProcessing] = useState<boolean>(false);

  // Initialize Sound Settings on Mount
  useEffect(() => {
    soundManager.updateSettings(
      settings.sfxEnabled,
      settings.sfxVolume,
      settings.musicEnabled,
      settings.musicVolume
    );
  }, []);

  const addLog = (
    text: string,
    player?: PlayerSymbol,
    type: 'move' | 'ability' | 'nuke' | 'system' | 'warn' = 'system'
  ) => {
    const entry: MoveLogEntry = {
      id: `${Date.now()}-${Math.random()}`,
      text,
      player,
      type,
      timestamp: Date.now(),
    };
    setMoveLogs((prev) => [entry, ...prev.slice(0, 19)]);
  };

  const triggerScreenShake = () => {
    if (!settings.screenShake) return;
    setScreenShakeActive(true);
    setTimeout(() => setScreenShakeActive(false), 600);
  };

  // START GAME SETUP
  const handleStartGame = (mode: GameMode, difficulty: AIDifficulty = 'medium') => {
    setGameMode(mode);
    setAiDifficulty(difficulty);

    setP1({
      id: 'p1',
      name: 'Player 1',
      symbol: 'X',
      isAI: false,
      selectedAbilities: [],
      abilityUsesRemaining: {} as Record<AbilityId, number>,
      color: 'text-cyan-400',
    });

    setP2({
      id: 'p2',
      name: mode === 'ai' ? `AI Bot (${difficulty.toUpperCase()})` : 'Player 2',
      symbol: 'O',
      isAI: mode === 'ai',
      selectedAbilities: [],
      abilityUsesRemaining: {} as Record<AbilityId, number>,
      color: 'text-pink-400',
    });

    setCurrentPhase('ABILITY_SELECT_P1');
  };

  // ABILITY SELECTION CONFIRMATIONS
  const handleP1AbilitiesConfirmed = (selected: AbilityId[]) => {
    const usesMap: Record<AbilityId, number> = {} as Record<AbilityId, number>;
    selected.forEach((id) => {
      usesMap[id] = ABILITIES[id].maxUses;
    });

    setP1((prev) => ({
      ...prev,
      selectedAbilities: selected,
      abilityUsesRemaining: usesMap,
    }));

    if (gameMode === 'pvp') {
      if (settings.privacyHandover) {
        setCurrentPhase('HANDOVER_P2_SELECT');
      } else {
        setCurrentPhase('ABILITY_SELECT_P2');
      }
    } else {
      // AI automatically selects 3 abilities according to difficulty
      let aiSelected: AbilityId[];
      if (aiDifficulty === 'insane') {
        aiSelected = ['skip', 'blind', 'stab_shot'];
      } else if (aiDifficulty === 'hard') {
        aiSelected = ['nuke', 'fakeout', 'stab_shot'];
      } else if (aiDifficulty === 'medium') {
        aiSelected = ['outer_board', 'blind', 'lunge'];
      } else {
        // Easy: 3 random
        const shuffled = [...ALL_ABILITY_IDS].sort(() => Math.random() - 0.5);
        aiSelected = shuffled.slice(0, 3);
      }

      const aiUsesMap: Record<AbilityId, number> = {} as Record<AbilityId, number>;
      aiSelected.forEach((id) => {
        aiUsesMap[id] = ABILITIES[id].maxUses;
      });

      setP2((prev) => ({
        ...prev,
        selectedAbilities: aiSelected,
        abilityUsesRemaining: aiUsesMap,
      }));

      // Launch match
      startPlayingMatch();
    }
  };

  const handleP2AbilitiesConfirmed = (selected: AbilityId[]) => {
    const usesMap: Record<AbilityId, number> = {} as Record<AbilityId, number>;
    selected.forEach((id) => {
      usesMap[id] = ABILITIES[id].maxUses;
    });

    setP2((prev) => ({
      ...prev,
      selectedAbilities: selected,
      abilityUsesRemaining: usesMap,
    }));

    if (settings.privacyHandover) {
      setCurrentPhase('HANDOVER_GAME_START');
    } else {
      startPlayingMatch();
    }
  };

  const startPlayingMatch = () => {
    setBoardSize(3);
    setBoard(createEmptyBoard(3));
    setCurrentTurn('p1');
    setTurnCount(1);
    setWinResult(null);
    setActiveStagedAbility(null);
    setLungePlacementsCount(0);
    setIsBlinded({ p1: false, p2: false });
    setHasPlacedMoveThisTurn(false);
    setP1AbilitiesUsedInMatch(new Set());
    setP2AbilitiesUsedInMatch(new Set());
    setWasBlindedThisMatch({ p1: false, p2: false });
    setFakeoutSucceededMatch(false);
    setFakeoutFailedMatch(false);
    setSkipUsedThisTurn({ p1: false, p2: false });
    setIsSkipBonusActive(false);
    setSkipMovesRemaining(0);
    setHasUsedAbilityThisTurn(false);
    setStalemateBanner(null);
    setMoveLogs([]);
    addLog('Match started on 3x3 board. Complete 3 in a row to win!', undefined, 'system');
    setCurrentPhase('PLAYING');
  };

  // CHECK WINNER HELPER
  const checkAndHandleGameOver = (
    currentBoard: CellState[][],
    size: number,
    forceWinner?: PlayerSymbol | 'DRAW',
    forceReason?: string,
    fakeoutTriggeredNow = false
  ): { gameOver: boolean; nextBoardSize: number } => {
    let workingBoard = currentBoard;
    let result: WinResult;
    if (forceWinner) {
      result = {
        winner: forceWinner,
        winningCells: [],
        reason: forceReason || 'Match concluded.',
      };
    } else {
      result = checkWinner(workingBoard, size);
    }

    let p1UsedForEnd = p1AbilitiesUsedInMatch;

    // STAB SHOT PASSIVE: Automatically triggers if someone wins diagonally and defender has Stab Shot
    if (
      !forceWinner &&
      (result.winner === 'X' || result.winner === 'O') &&
      result.isDiagonalWin
    ) {
      const defenderId: PlayerId = result.winner === p1.symbol ? 'p2' : 'p1';
      const defender = defenderId === 'p1' ? p1 : p2;
      const stabRemaining = defender.abilityUsesRemaining['stab_shot'] || 0;

      if (stabRemaining > 0) {
        // Consume Stab Shot charge
        const updatedUses = {
          ...defender.abilityUsesRemaining,
          stab_shot: stabRemaining - 1,
        };
        if (defenderId === 'p1') {
          setP1((prev) => ({ ...prev, abilityUsesRemaining: updatedUses }));
          p1UsedForEnd = new Set([...p1AbilitiesUsedInMatch, 'stab_shot']);
          setP1AbilitiesUsedInMatch(p1UsedForEnd);
        } else {
          setP2((prev) => ({ ...prev, abilityUsesRemaining: updatedUses }));
          setP2AbilitiesUsedInMatch((prev) => new Set([...prev, 'stab_shot']));
        }

        // Record ability usage in career stats
        setStats((prev) => {
          const updated = {
            ...prev,
            abilityUses: {
              ...prev.abilityUses,
              stab_shot: (prev.abilityUses.stab_shot || 0) + 1,
            },
          };
          saveStats(updated);
          return updated;
        });

        const stabHit = Math.random() < 0.5;
        if (stabHit) {
          const diagCells =
            result.diagonalWinningCells && result.diagonalWinningCells.length > 0
              ? result.diagonalWinningCells
              : result.winningCells;
          const victim = diagCells[Math.floor(Math.random() * diagCells.length)];
          const stabbedBoard = workingBoard.map((row) => row.map((cell) => ({ ...cell })));
          stabbedBoard[victim.r][victim.c] = {
            symbol: null,
            isFake: false,
            isBlocked: false,
          };
          workingBoard = stabbedBoard;
          setBoard(stabbedBoard);
          soundManager.playStabShot(true);
          triggerScreenShake();

          const hitMsg = `STAB SHOT HIT! ${defender.name}'s auto-counter shattered a symbol in ${result.winner}'s diagonal line!`;
          setStalemateBanner(hitMsg);
          setTimeout(() => setStalemateBanner(null), 4500);
          addLog(hitMsg, defender.symbol, 'ability');

          result = checkWinner(workingBoard, size);
        } else {
          soundManager.playStabShot(false);
          const missMsg = `STAB SHOT MISSED! (50% roll failed) ${result.winner}'s diagonal victory stands!`;
          setStalemateBanner(missMsg);
          setTimeout(() => setStalemateBanner(null), 4000);
          addLog(missMsg, defender.symbol, 'warn');
        }
      }
    }

    // Dynamic Stalemate Rules:
    // - Stalemate in 5x5 or more -> resets to 4x4 and clears all symbols
    // - Stalemate in 3x3 or 4x4 -> expands to 5x5
    if (result.winner === 'DRAW' && result.isStalemate && !forceWinner) {
      if (size >= 5) {
        const resetBoard = createEmptyBoard(4);
        setBoard(resetBoard);
        setBoardSize(4);
        soundManager.playShuffle();
        triggerScreenShake();
        const msg = `STALEMATE on ${size}x${size}! Board reset to 4x4 & all symbols cleared!`;
        setStalemateBanner(msg);
        setTimeout(() => setStalemateBanner(null), 4000);
        addLog(msg, undefined, 'warn');
        return { gameOver: false, nextBoardSize: 4 };
      } else {
        const { newBoard: expanded } = expandBoardToSize(workingBoard, size, 5);
        const usableExpanded = hasAnyPossibleWinRemaining(expanded, 5)
          ? expanded
          : createEmptyBoard(5);
        setBoard(usableExpanded);
        setBoardSize(5);
        soundManager.playExpand();
        const msg = `STALEMATE on ${size}x${size}! Arena expanded to 5x5 (5 in a row to win)!`;
        setStalemateBanner(msg);
        setTimeout(() => setStalemateBanner(null), 4000);
        addLog(msg, undefined, 'warn');
        return { gameOver: false, nextBoardSize: 5 };
      }
    }

    if (result.winner !== null) {
      setWinResult(result);
      setCurrentPhase('GAME_OVER');

      // Update statistics
      const isP1Winner = result.winner === 'X';
      const isDraw = result.winner === 'DRAW';

      const res = updateStatsAndAchievementsOnGameEnd(stats, achievements, {
        won: isP1Winner,
        lost: !isP1Winner && !isDraw,
        isDraw,
        gameMode,
        aiDifficulty,
        abilitiesUsedInMatch: p1UsedForEnd,
        wasEverBlindedThisMatch: wasBlindedThisMatch.p1,
        fakeoutSucceededThisMatch: fakeoutTriggeredNow || fakeoutSucceededMatch,
        fakeoutFailedThisMatch: fakeoutFailedMatch,
        nuclearUsedThisMatch: p1UsedForEnd.has('nuke'),
      });

      setStats(res.updatedStats);
      setAchievements(res.updatedAchievements);

      if (res.newlyUnlocked.length > 0) {
        setNewlyUnlockedBadge(res.newlyUnlocked[0]);
        setTimeout(() => setNewlyUnlockedBadge(null), 5000);
      }

      addLog(`Match Finished: ${result.reason}`, undefined, 'system');
      return { gameOver: true, nextBoardSize: size };
    }

    return { gameOver: false, nextBoardSize: size };
  };

  // TURN TRANSITION
  const switchTurn = (forceNextPlayer?: PlayerId) => {
    const nextPlayer: PlayerId = forceNextPlayer ?? (currentTurn === 'p1' ? 'p2' : 'p1');
    setCurrentTurn(nextPlayer);
    setTurnCount((prev) => prev + 1);
    setHasPlacedMoveThisTurn(false);
    setActiveStagedAbility(null);
    setLungePlacementsCount(0);
    setSkipUsedThisTurn({ p1: false, p2: false });
    setIsSkipBonusActive(false);
    setSkipMovesRemaining(0);
    setHasUsedAbilityThisTurn(false);

    const nextPlayerObj = nextPlayer === 'p1' ? p1 : p2;
    addLog(`${nextPlayerObj.name}'s turn (${nextPlayerObj.symbol})`, nextPlayerObj.symbol, 'move');

    // If next player is blinded in 2P mode, check if privacy handover should trigger
    if (
      isBlinded[nextPlayer] &&
      gameMode === 'pvp' &&
      settings.privacyHandover &&
      !nextPlayerObj.isAI
    ) {
      setCurrentPhase('HANDOVER_BLIND_TURN');
    }
  };

  // ABILITY ACTIVATIONS
  const activateAbility = (id: AbilityId) => {
    const activePlayer = currentTurn === 'p1' ? p1 : p2;
    const remaining = activePlayer.abilityUsesRemaining[id] || 0;

    if (remaining <= 0) {
      soundManager.playInvalid();
      return;
    }

    if (isSkipBonusActive) {
      soundManager.playInvalid();
      addLog(
        `Skip a Turn only allows placing an extra cross or circle. Abilities are locked!`,
        activePlayer.symbol,
        'warn'
      );
      return;
    }

    if (hasUsedAbilityThisTurn) {
      soundManager.playInvalid();
      addLog(
        `You can only use 1 ability per turn!`,
        activePlayer.symbol,
        'warn'
      );
      return;
    }

    if (id === 'skip' && boardSize < 4) {
      soundManager.playInvalid();
      addLog(
        `Skip a Turn requires a 4x4 or larger board!`,
        activePlayer.symbol,
        'warn'
      );
      return;
    }

    if (id === 'skip' && skipUsedThisTurn[currentTurn]) {
      soundManager.playInvalid();
      addLog(
        `Cannot use Skip a Turn again on the same turn!`,
        activePlayer.symbol,
        'warn'
      );
      return;
    }

    if (ABILITIES[id].isPassive) {
      soundManager.playInvalid();
      addLog(
        `${ABILITIES[id].name} is a passive auto-ability and triggers automatically!`,
        activePlayer.symbol,
        'warn'
      );
      return;
    }

    if (id === 'lunge' && boardSize <= 4) {
      soundManager.playInvalid();
      addLog(
        `Lunge requires a 5x5 or larger board! Expand using Outer Board first.`,
        activePlayer.symbol,
        'warn'
      );
      return;
    }

    if (id === 'turnover_bomb' && boardSize !== 6) {
      soundManager.playInvalid();
      addLog(
        `Turnover Bomb can ONLY be used on a 6x6 board!`,
        activePlayer.symbol,
        'warn'
      );
      return;
    }

    if (id === 'retract' && boardSize < 4) {
      soundManager.playInvalid();
      addLog(
        `Retract requires a 4x4 or larger board!`,
        activePlayer.symbol,
        'warn'
      );
      return;
    }

    setHasUsedAbilityThisTurn(true);

    // Deduct usage
    const updatedUses = {
      ...activePlayer.abilityUsesRemaining,
      [id]: remaining - 1,
    };

    if (currentTurn === 'p1') {
      setP1((prev) => ({ ...prev, abilityUsesRemaining: updatedUses }));
      setP1AbilitiesUsedInMatch((prev) => new Set([...prev, id]));
    } else {
      setP2((prev) => ({ ...prev, abilityUsesRemaining: updatedUses }));
      setP2AbilitiesUsedInMatch((prev) => new Set([...prev, id]));
    }

    // Record stats
    setStats((prev) => {
      const updated = {
        ...prev,
        abilityUses: {
          ...prev.abilityUses,
          [id]: (prev.abilityUses[id] || 0) + 1,
        },
      };
      saveStats(updated);
      return updated;
    });

    addLog(
      `${activePlayer.name} activated ${ABILITIES[id].name.toUpperCase()}!`,
      activePlayer.symbol,
      'ability'
    );

    // Ability-specific execution
    switch (id) {
      case 'shuffle': {
        soundManager.playShuffle();
        setIsShufflingAnimation(true);
        setTimeout(() => {
          const shuffled = executeShuffle(board, boardSize);
          setBoard(shuffled);
          setIsShufflingAnimation(false);
          const { gameOver } = checkAndHandleGameOver(shuffled, boardSize);
          if (!gameOver && hasPlacedMoveThisTurn) {
            switchTurn();
          }
        }, 600);
        break;
      }

      case 'outer_board': {
        soundManager.playExpand();
        const { newBoard, newSize } = executeOuterBoard(board, boardSize);
        setBoard(newBoard);
        setBoardSize(newSize);
        addLog(
          `Board expanded to ${newSize}x${newSize}! Win target increased to ${getRequiredToWin(
            newSize
          )} in a row!`,
          undefined,
          'system'
        );
        const { gameOver } = checkAndHandleGameOver(newBoard, newSize);
        if (!gameOver && hasPlacedMoveThisTurn) {
          switchTurn();
        }
        break;
      }

      case 'blind': {
        soundManager.playBlind();
        const targetPlayer: PlayerId = currentTurn === 'p1' ? 'p2' : 'p1';
        setIsBlinded((prev) => ({ ...prev, [targetPlayer]: true }));
        setWasBlindedThisMatch((prev) => ({ ...prev, [targetPlayer]: true }));
        addLog(
          `${currentTurn === 'p1' ? p2.name : p1.name} has been BLINDED in pitch black!`,
          undefined,
          'warn'
        );
        if (hasPlacedMoveThisTurn) {
          switchTurn();
        }
        break;
      }

      case 'nuke': {
        soundManager.playNuke();
        triggerScreenShake();
        const { cells } = calculateRandomNukeZone(boardSize);
        setNukeBlastEffect({ active: true, count: cells.length });

        // Update board: set blocked cells
        const nextBoard = board.map((row) => row.map((cell) => ({ ...cell })));
        cells.forEach(({ r, c }) => {
          nextBoard[r][c] = {
            symbol: null,
            isFake: false,
            isBlocked: true,
            destroyedAt: Date.now(),
          };
        });
        setBoard(nextBoard);
        addLog(
          `Nuclear warhead detonated! ${cells.length} squares obliterated!`,
          undefined,
          'nuke'
        );

        setTimeout(() => {
          setNukeBlastEffect({ active: false, count: 0 });
          const { gameOver } = checkAndHandleGameOver(nextBoard, boardSize);
          if (!gameOver && hasPlacedMoveThisTurn) {
            switchTurn();
          }
        }, 1400);
        break;
      }

      case 'skip': {
        soundManager.playSkip();
        const extraMoves = hasPlacedMoveThisTurn ? 1 : 2;
        setSkipUsedThisTurn((prev) => ({ ...prev, [currentTurn]: true }));
        setIsSkipBonusActive(true);
        setSkipMovesRemaining(extraMoves);
        addLog(
          `${currentTurn === 'p1' ? p2.name : p1.name}'s turn was SKIPPED! ${
            activePlayer.name
          } must place ${extraMoves === 1 ? 'an extra' : '2'} ${activePlayer.symbol}. All abilities locked.`,
          activePlayer.symbol,
          'ability'
        );
        // Turn stays with current player to place extra symbol
        setHasPlacedMoveThisTurn(false);
        setActiveStagedAbility(null);
        setLungePlacementsCount(0);
        break;
      }

      case 'lunge': {
        soundManager.playLunge();
        setActiveStagedAbility('lunge');
        const initialCount = hasPlacedMoveThisTurn ? 1 : 0;
        setLungePlacementsCount(initialCount);
        addLog(
          initialCount === 1
            ? 'LUNGE ACTIVATED: Click 1 more square to complete your double strike!'
            : 'LUNGE ACTIVATED: Click your 1st square, then your 2nd square!',
          activePlayer.symbol,
          'ability'
        );
        break;
      }

      case 'fakeout': {
        soundManager.playFakeoutPlaced();
        setActiveStagedAbility('fakeout');
        addLog(
          'FAKEOUT STAGED: Click an empty square to place a deceptive PURPLE symbol!',
          activePlayer.symbol,
          'ability'
        );
        break;
      }

      case 'turnover_bomb': {
        soundManager.playTurnover();
        triggerScreenShake();
        const inverted = executeTurnoverBomb(board, boardSize);
        setBoard(inverted);
        addLog(
          `TURNOVER BOMB DETONATED! All Xs and Os on the 6x6 arena were inverted!`,
          activePlayer.symbol,
          'nuke'
        );
        const { gameOver } = checkAndHandleGameOver(inverted, boardSize);
        if (!gameOver && hasPlacedMoveThisTurn) {
          switchTurn();
        }
        break;
      }

      case 'retract': {
        soundManager.playRetract();
        const { newBoard, newSize } = executeRetract(board, boardSize);
        setBoard(newBoard);
        setBoardSize(newSize);
        addLog(
          `Arena retracted to ${newSize}x${newSize}! Win target lowered to ${getRequiredToWin(
            newSize
          )} in a row!`,
          activePlayer.symbol,
          'ability'
        );
        const { gameOver } = checkAndHandleGameOver(newBoard, newSize);
        if (!gameOver && hasPlacedMoveThisTurn) {
          switchTurn();
        }
        break;
      }
    }
  };

  const handleCancelStagedAbility = () => {
    if (!activeStagedAbility) return;
    if (activeStagedAbility === 'lunge' && lungePlacementsCount > 0) {
      soundManager.playInvalid();
      return;
    }
    const cancelled = activeStagedAbility;
    const activePlayer = currentTurn === 'p1' ? p1 : p2;
    const restored = {
      ...activePlayer.abilityUsesRemaining,
      [cancelled]: (activePlayer.abilityUsesRemaining[cancelled] || 0) + 1,
    };
    if (currentTurn === 'p1') {
      setP1((prev) => ({ ...prev, abilityUsesRemaining: restored }));
    } else {
      setP2((prev) => ({ ...prev, abilityUsesRemaining: restored }));
    }
    setActiveStagedAbility(null);
    setHasUsedAbilityThisTurn(false);
    soundManager.playClick();
  };

  // BOARD CELL CLICK HANDLER
  const handleCellClick = (r: number, c: number) => {
    if (currentPhase !== 'PLAYING') return;
    if (isShufflingAnimation || nukeBlastEffect.active) return;

    // Prevent placing another move if player already placed their symbol this turn
    // unless they staged a placement ability (Fakeout or Lunge)
    if (hasPlacedMoveThisTurn && activeStagedAbility !== 'fakeout' && activeStagedAbility !== 'lunge') {
      soundManager.playInvalid();
      return;
    }

    const activePlayer = currentTurn === 'p1' ? p1 : p2;
    const opponentPlayer = currentTurn === 'p1' ? p2 : p1;
    const cell = board[r]?.[c];
    if (!cell) return;

    // Blocked cells cannot be clicked
    if (cell.isBlocked) {
      soundManager.playInvalid();
      return;
    }

    // INTERACTION WITH FAKEOUT SYMBOL:
    // "Fakeout rule: The fake symbol looks convincing but does not count towards winning combinations.
    // If the opponent clicks the fake symbol, it disappears and the opponent's turn ends.
    // If the opponent makes a normal move instead of clicking the fake symbol, the Fakeout succeeds and the opponent immediately loses the game."
    if (cell.isFake && cell.symbol !== null) {
      // Opponent clicked the fake symbol! Fakeout is disarmed/busted!
      soundManager.playFakeoutBusted();
      setFakeoutFailedMatch(true);

      const nextBoard = board.map((row) => row.map((item) => ({ ...item })));
      nextBoard[r][c] = {
        symbol: null,
        isFake: false,
        isBlocked: false,
      };
      setBoard(nextBoard);

      addLog(
        `FAKEOUT DISARMED! ${activePlayer.name} saw through the purple trap! Turn ends.`,
        activePlayer.symbol,
        'warn'
      );

      // If active player was blinded, clear blindness
      if (isBlinded[currentTurn]) {
        setIsBlinded((prev) => ({ ...prev, [currentTurn]: false }));
      }

      // Disarming ends the opponent's turn immediately
      switchTurn();
      return;
    }

    // CHECK IF OPPONENT LEFT A FAKEOUT ON THE BOARD AND IS NOW MAKING A NORMAL MOVE!
    // If a fake symbol belonging to the other player is on the board, and active player makes a normal move on an empty cell:
    let pendingEnemyFakeoutExists = false;
    for (let rowIdx = 0; rowIdx < boardSize; rowIdx++) {
      for (let colIdx = 0; colIdx < boardSize; colIdx++) {
        if (
          board[rowIdx][colIdx].isFake &&
          board[rowIdx][colIdx].fakeOwner === opponentPlayer.id &&
          board[rowIdx][colIdx].symbol !== null
        ) {
          pendingEnemyFakeoutExists = true;
          break;
        }
      }
      if (pendingEnemyFakeoutExists) break;
    }

    // If cell is already occupied by a regular symbol, invalid move
    if (cell.symbol !== null) {
      soundManager.playInvalid();
      return;
    }

    // STAGED ABILITY: FAKEOUT
    if (activeStagedAbility === 'fakeout') {
      const nextBoard = board.map((row) => row.map((item) => ({ ...item })));
      nextBoard[r][c] = {
        symbol: activePlayer.symbol,
        isFake: true,
        fakeOwner: activePlayer.id,
        isBlocked: false,
      };
      setBoard(nextBoard);
      soundManager.playFakeoutPlaced();
      setActiveStagedAbility(null);
      addLog(
        `${activePlayer.name} placed a deceptive PURPLE fake symbol!`,
        activePlayer.symbol,
        'ability'
      );
      // Turn finishes after placing fakeout
      switchTurn();
      return;
    }

    // IF ENEMY FAKEOUT WAS ACTIVE AND PLAYER MADE A NORMAL MOVE INSTEAD OF CLICKING IT:
    if (pendingEnemyFakeoutExists) {
      soundManager.playClick();
      setFakeoutSucceededMatch(true);
      addLog(
        `FAKEOUT TRAP SPRUNG! ${activePlayer.name} ignored the purple symbol and made a move!`,
        undefined,
        'warn'
      );
      // Opponent immediately wins!
      checkAndHandleGameOver(
        board,
        boardSize,
        opponentPlayer.symbol,
        `Psychological Mind Game Victory! ${activePlayer.name} failed to disarm the Fakeout!`,
        true
      );
      return;
    }

    // STAGED ABILITY: LUNGE (Double move)
    if (activeStagedAbility === 'lunge') {
      const nextBoard = board.map((row) => row.map((item) => ({ ...item })));
      nextBoard[r][c] = {
        symbol: activePlayer.symbol,
        isFake: false,
        isBlocked: false,
      };
      setBoard(nextBoard);

      if (activePlayer.symbol === 'X') soundManager.playMoveX();
      else soundManager.playMoveO();

      // Clear blindness if active
      if (isBlinded[currentTurn]) {
        setIsBlinded((prev) => ({ ...prev, [currentTurn]: false }));
      }

      const newPlacements = lungePlacementsCount + 1;
      setLungePlacementsCount(newPlacements);

      // Check if 1st placement created a win or stalemate shift
      const { gameOver, nextBoardSize } = checkAndHandleGameOver(nextBoard, boardSize);
      if (gameOver) {
        setActiveStagedAbility(null);
        return;
      }
      if (nextBoardSize !== boardSize && nextBoardSize <= 4) {
        setActiveStagedAbility(null);
        setLungePlacementsCount(0);
        switchTurn();
        return;
      }

      if (newPlacements >= 2) {
        addLog(
          `${activePlayer.name} completed their double-strike Lunge!`,
          activePlayer.symbol,
          'move'
        );
        setActiveStagedAbility(null);
        switchTurn();
      } else {
        addLog(
          `LUNGE: 1st symbol placed! Now click 2nd square.`,
          activePlayer.symbol,
          'move'
        );
      }
      return;
    }

    // REGULAR MOVE PLACEMENT
    const nextBoard = board.map((row) => row.map((item) => ({ ...item })));
    nextBoard[r][c] = {
      symbol: activePlayer.symbol,
      isFake: false,
      isBlocked: false,
    };
    setBoard(nextBoard);

    if (activePlayer.symbol === 'X') soundManager.playMoveX();
    else soundManager.playMoveO();

    // If player was blinded, successful placement immediately ends blindness
    if (isBlinded[currentTurn]) {
      setIsBlinded((prev) => ({ ...prev, [currentTurn]: false }));
      addLog(`${activePlayer.name} struck in the dark and cleared blindness!`, undefined, 'system');
    }

    // Check if move won the match or triggered a stalemate transition
    const { gameOver, nextBoardSize } = checkAndHandleGameOver(nextBoard, boardSize);
    if (gameOver) return;

    // If player had activated Skip and placed a symbol:
    if (isSkipBonusActive || skipMovesRemaining > 0) {
      const nextRemaining = skipMovesRemaining - 1;
      if (nextRemaining <= 0) {
        setIsSkipBonusActive(false);
        setSkipMovesRemaining(0);
        addLog(
          `${activePlayer.name} placed extra ${activePlayer.symbol}. Turn automatically switches to ${
            currentTurn === 'p1' ? p2.name : p1.name
          }!`,
          activePlayer.symbol,
          'system'
        );
        switchTurn();
      } else {
        setSkipMovesRemaining(nextRemaining);
        setHasPlacedMoveThisTurn(false);
        addLog(
          `${activePlayer.name} placed ${activePlayer.symbol}. Place 1 more ${activePlayer.symbol} for Skip!`,
          activePlayer.symbol,
          'move'
        );
      }
      return;
    }

    // Check if player still has usable abilities this turn (max 1 ability per turn)
    const hasUsableRemainingAbilities =
      !hasUsedAbilityThisTurn &&
      activePlayer.selectedAbilities.some(
        (id) =>
          !ABILITIES[id].isPassive &&
          (activePlayer.abilityUsesRemaining[id] || 0) > 0 &&
          !(id === 'skip' && nextBoardSize < 4) &&
          !(id === 'outer_board' && nextBoardSize >= 6) &&
          !(id === 'lunge' && nextBoardSize <= 4) &&
          !(id === 'turnover_bomb' && nextBoardSize !== 6) &&
          !(id === 'retract' && nextBoardSize < 4)
      );

    if (hasUsableRemainingAbilities && !activePlayer.isAI) {
      setHasPlacedMoveThisTurn(true);
      addLog(
        `${activePlayer.name} placed ${activePlayer.symbol}. Activate an ability or pass.`,
        activePlayer.symbol,
        'move'
      );
    } else {
      // Bot always ends turn immediately; Human with no usable abilities ends turn automatically
      switchTurn();
    }
  };

  // AI TURN EXECUTION
  useEffect(() => {
    if (currentPhase !== 'PLAYING') return;
    if (isShufflingAnimation || nukeBlastEffect.active) return;
    const activePlayer = currentTurn === 'p1' ? p1 : p2;

    if (activePlayer.isAI && !isAIProcessing && !winResult) {
      setIsAIProcessing(true);

      const aiTimer = setTimeout(() => {
        // Guard check to make sure it's genuinely AI's turn
        if (currentTurn !== activePlayer.id || winResult) {
          setIsAIProcessing(false);
          return;
        }

        // Calculate AI move with passive & board-size gated abilities filtered out
        const hasFakeout = board.some((row) => row.some((cell) => cell.isFake && cell.symbol !== null));
        const effectiveAbilities = {
          ...activePlayer.abilityUsesRemaining,
          stab_shot: 0,
          ...(skipUsedThisTurn[currentTurn] || boardSize < 4 ? { skip: 0 } : {}),
          ...(boardSize <= 4 ? { lunge: 0 } : {}),
          ...(boardSize >= 6 ? { outer_board: 0 } : {}),
          ...(boardSize !== 6 ? { turnover_bomb: 0 } : {}),
          ...(boardSize < 4 ? { retract: 0 } : {}),
        };
        const decision = computeAIMove(
          board,
          boardSize,
          activePlayer.symbol,
          p1.symbol,
          aiDifficulty,
          isBlinded.p2,
          effectiveAbilities,
          hasFakeout,
          isSkipBonusActive || (activeStagedAbility === 'lunge' && lungePlacementsCount === 0)
        );

        // If AI wants to use an ability first, activate it alone so React state updates before placing move
        if (
          !isSkipBonusActive &&
          !hasUsedAbilityThisTurn &&
          decision.abilityToUse &&
          effectiveAbilities[decision.abilityToUse] > 0 &&
          !activeStagedAbility
        ) {
          activateAbility(decision.abilityToUse);
          setIsAIProcessing(false);
          return;
        }

        // Perform move or interaction
        handleCellClick(decision.targetCell.r, decision.targetCell.c);
        setIsAIProcessing(false);
      }, 700);

      return () => {
        clearTimeout(aiTimer);
        setIsAIProcessing(false);
      };
    }
  }, [
    currentTurn,
    currentPhase,
    board,
    boardSize,
    isBlinded,
    activeStagedAbility,
    isSkipBonusActive,
    skipMovesRemaining,
    hasUsedAbilityThisTurn,
    lungePlacementsCount,
    isShufflingAnimation,
    nukeBlastEffect.active,
  ]);

  // RESET / REMATCH
  const handleRematch = () => {
    // Restore drafted ability uses
    const p1Uses: Record<AbilityId, number> = {} as Record<AbilityId, number>;
    p1.selectedAbilities.forEach((id) => {
      p1Uses[id] = ABILITIES[id].maxUses;
    });

    const p2Uses: Record<AbilityId, number> = {} as Record<AbilityId, number>;
    p2.selectedAbilities.forEach((id) => {
      p2Uses[id] = ABILITIES[id].maxUses;
    });

    setP1((prev) => ({ ...prev, abilityUsesRemaining: p1Uses }));
    setP2((prev) => ({ ...prev, abilityUsesRemaining: p2Uses }));

    startPlayingMatch();
  };

  const handleReturnToMenu = () => {
    setCurrentPhase('MENU');
  };

  const activePlayer = currentTurn === 'p1' ? p1 : p2;

  return (
    <div
      className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans transition-all duration-300 ${
        screenShakeActive ? 'animate-screen-shake' : ''
      }`}
    >
      {/* Top Bar Contract Navigation */}
      <Navbar
        settings={settings}
        onUpdateSettings={(newSettings) => {
          setSettings(newSettings);
          saveSettings(newSettings);
        }}
        onNavigate={(view) => {
          if (view === 'HOW_TO_PLAY') setShowHowToPlay(true);
          else if (view === 'STATS') setShowStats(true);
          else if (view === 'SETTINGS') setShowSettings(true);
          else setCurrentPhase('MENU');
        }}
        currentPhase={currentPhase}
      />

      {/* Achievement Banner Notification */}
      {newlyUnlockedBadge && (
        <div className="fixed top-20 right-4 z-50 p-4 rounded-2xl bg-purple-950/95 border border-purple-500 shadow-2xl flex items-center gap-3 animate-bounce">
          <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold text-purple-300 uppercase tracking-wider block">
              ACHIEVEMENT UNLOCKED!
            </span>
            <span className="text-sm font-bold text-white font-display">
              {newlyUnlockedBadge.title}
            </span>
          </div>
        </div>
      )}

      {/* ROUTING VIEW SWITCH */}
      <main className="flex-1 flex flex-col items-center justify-start w-full relative">
        {/* Phase: MAIN MENU */}
        {currentPhase === 'MENU' && (
          <MainMenu
            onStartGame={handleStartGame}
            onOpenHowToPlay={() => setShowHowToPlay(true)}
            onOpenStats={() => setShowStats(true)}
            onOpenSettings={() => setShowSettings(true)}
            stats={stats}
          />
        )}

        {/* Phase: ABILITY SELECTION P1 */}
        {currentPhase === 'ABILITY_SELECT_P1' && (
          <AbilitySelector
            playerNumber={1}
            playerName={p1.name}
            playerSymbol={p1.symbol}
            onConfirm={handleP1AbilitiesConfirmed}
            isPvP={gameMode === 'pvp'}
          />
        )}

        {/* Phase: HANDOVER TO P2 */}
        {currentPhase === 'HANDOVER_P2_SELECT' && (
          <HandoverScreen
            title="Hand Device to Player 2"
            targetPlayerName={p2.name}
            targetPlayerSymbol={p2.symbol}
            reason="selection"
            onContinue={() => setCurrentPhase('ABILITY_SELECT_P2')}
          />
        )}

        {/* Phase: ABILITY SELECTION P2 */}
        {currentPhase === 'ABILITY_SELECT_P2' && (
          <AbilitySelector
            playerNumber={2}
            playerName={p2.name}
            playerSymbol={p2.symbol}
            onConfirm={handleP2AbilitiesConfirmed}
            isPvP={gameMode === 'pvp'}
          />
        )}

        {/* Phase: HANDOVER TO START GAME */}
        {currentPhase === 'HANDOVER_GAME_START' && (
          <HandoverScreen
            title="Pass Device to Player 1"
            targetPlayerName={p1.name}
            targetPlayerSymbol={p1.symbol}
            reason="game_start"
            onContinue={startPlayingMatch}
          />
        )}

        {/* Phase: HANDOVER DURING BLIND TURN */}
        {currentPhase === 'HANDOVER_BLIND_TURN' && (
          <HandoverScreen
            title="Opponent Blindness Active!"
            targetPlayerName={activePlayer.name}
            targetPlayerSymbol={activePlayer.symbol}
            reason="blind_turn"
            onContinue={() => setCurrentPhase('PLAYING')}
          />
        )}

        {/* Phase: ACTIVE PLAYING */}
        {(currentPhase === 'PLAYING' || currentPhase === 'GAME_OVER') && (
          <div className="w-full max-w-4xl px-4 py-4 flex flex-col items-center gap-4 flex-1">
            {/* Match HUD & Indicators */}
            <div className="w-full flex items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg max-w-xl">
              {/* Player 1 Card */}
              <div
                className={`flex items-center gap-2.5 p-2 rounded-xl transition-all ${
                  currentTurn === 'p1'
                    ? 'bg-cyan-950/60 border border-cyan-500/50 shadow-md shadow-cyan-950/40 scale-[1.02]'
                    : 'opacity-50'
                }`}
              >
                <div className="w-9 h-9 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center font-display font-black text-cyan-400 text-lg">
                  X
                </div>
                <div>
                  <span className="block text-xs font-bold text-white font-display">
                    {p1.name}
                  </span>
                  <span className="text-[11px] text-cyan-400 font-mono">
                    {currentTurn === 'p1' ? '▶ CURRENT TURN' : 'WAITING'}
                  </span>
                </div>
              </div>

              {/* Board Size & Target Indicator */}
              <div className="flex flex-col items-center text-center px-2">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                  ARENA
                </span>
                <span className="text-sm font-bold font-display text-white">
                  {boardSize}x{boardSize}
                </span>
                <span className="text-[10px] text-purple-400 font-semibold whitespace-nowrap">
                  Target: {getRequiredToWin(boardSize)} in a row
                </span>
              </div>

              {/* Player 2 Card */}
              <div
                className={`flex items-center gap-2.5 p-2 rounded-xl transition-all ${
                  currentTurn === 'p2'
                    ? 'bg-pink-950/60 border border-pink-500/50 shadow-md shadow-pink-950/40 scale-[1.02]'
                    : 'opacity-50'
                }`}
              >
                <div className="text-right">
                  <span className="block text-xs font-bold text-white font-display">
                    {p2.name}
                  </span>
                  <span className="text-[11px] text-pink-400 font-mono">
                    {currentTurn === 'p2' ? '▶ CURRENT TURN' : 'WAITING'}
                  </span>
                </div>
                <div className="w-9 h-9 rounded-lg bg-pink-950/80 border border-pink-500/40 flex items-center justify-center font-display font-black text-pink-400 text-lg">
                  O
                </div>
              </div>
            </div>

            {/* Stalemate Arena Shift Banner */}
            {stalemateBanner && (
              <div className="w-full max-w-xl px-4 py-2 rounded-xl bg-amber-950/80 border border-amber-500/60 text-amber-200 text-xs font-bold text-center shadow-lg animate-pulse">
                {stalemateBanner}
              </div>
            )}

            {/* Active Turn Instruction Banner */}
            <div className="text-center text-xs text-slate-300 font-medium">
              {isSkipBonusActive ? (
                <span className="text-indigo-400 font-bold animate-pulse">
                  ⏩ SKIP ACTIVE: Place your extra {activePlayer.symbol}! Turn automatically passes to opponent right after.
                </span>
              ) : activeStagedAbility === 'lunge' ? (
                <span className="text-emerald-400 font-bold animate-pulse">
                  ⚡ LUNGE ACTIVE: Click 1st square, then 2nd square!
                </span>
              ) : activeStagedAbility === 'fakeout' ? (
                <span className="text-fuchsia-400 font-bold animate-pulse">
                  🔮 FAKEOUT ACTIVE: Click an empty cell to place your purple fake symbol!
                </span>
              ) : isBlinded[currentTurn] ? (
                <span className="text-amber-400 font-bold animate-pulse">
                  👁️ BLINDNESS ACTIVE: Screen is blacked out! Tap a cell to guess in the dark!
                </span>
              ) : hasPlacedMoveThisTurn ? (
                <span className="text-cyan-400 font-bold">
                  Move placed! Select an ability below or tap 'Pass / End Turn'.
                </span>
              ) : (
                <span>
                  {activePlayer.name}'s turn. Tap an empty cell or activate an ability.
                </span>
              )}
            </div>

            {/* Game Board */}
            <GameBoard
              board={board}
              size={boardSize}
              winningCells={winResult?.winningCells || []}
              isBlinded={isBlinded[currentTurn] && !activePlayer.isAI}
              blindedPlayerName={activePlayer.name}
              isShuffling={isShufflingAnimation}
              onCellClick={handleCellClick}
              disabled={
                currentPhase === 'GAME_OVER' ||
                (activePlayer.isAI && isAIProcessing) ||
                isShufflingAnimation ||
                nukeBlastEffect.active ||
                (hasPlacedMoveThisTurn &&
                  activeStagedAbility !== 'fakeout' &&
                  activeStagedAbility !== 'lunge')
              }
              currentTurnSymbol={activePlayer.symbol}
            />

            {/* Ability Controls Bar */}
            <AbilityBar
              player={gameMode === 'ai' ? p1 : activePlayer}
              onActivateAbility={activateAbility}
              activeStagedAbility={activeStagedAbility}
              onCancelStagedAbility={handleCancelStagedAbility}
              hasPlacedMove={hasPlacedMoveThisTurn}
              onEndTurn={() => switchTurn()}
              disabled={
                currentPhase === 'GAME_OVER' ||
                activePlayer.isAI ||
                isAIProcessing ||
                isShufflingAnimation ||
                nukeBlastEffect.active
              }
              boardSize={boardSize}
              isSkipDisabled={skipUsedThisTurn[currentTurn]}
              isSkipBonusActive={isSkipBonusActive}
              hasUsedAbilityThisTurn={hasUsedAbilityThisTurn}
            />

            {/* Opponent's Loadout & Remaining Uses */}
            <OpponentAbilities
              opponent={gameMode === 'ai' ? p2 : currentTurn === 'p1' ? p2 : p1}
              isHidden={isBlinded[currentTurn] && !activePlayer.isAI}
            />

            {/* Recent Match Event Log Ticker */}
            <div className="w-full max-w-xl p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
              <span className="font-mono text-purple-400 font-bold uppercase tracking-wider shrink-0 pr-2">
                EVENT LOG:
              </span>
              <span className="truncate text-slate-300">
                {moveLogs.length > 0 ? moveLogs[0].text : 'Ready for battle.'}
              </span>
              <button
                onClick={() => {
                  soundManager.playClick();
                  handleRematch();
                }}
                className="shrink-0 ml-2 text-slate-400 hover:text-white transition-colors"
                title="Restart match"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Phase: RESULTS / VICTORY MODAL */}
        {currentPhase === 'GAME_OVER' && winResult && (
          <VictoryModal
            winResult={winResult}
            p1={p1}
            p2={p2}
            onRematch={handleRematch}
            onReturnToMenu={handleReturnToMenu}
            p1AbilitiesUsed={Array.from(p1AbilitiesUsedInMatch)}
            p2AbilitiesUsed={Array.from(p2AbilitiesUsedInMatch)}
            turnCount={turnCount}
          />
        )}
      </main>

      {/* NUCLEAR BOMB BLAST ANIMATION */}
      {nukeBlastEffect.active && (
        <NukeExplosionEffect
          onComplete={() => setNukeBlastEffect({ active: false, count: 0 })}
          affectedCount={nukeBlastEffect.count}
        />
      )}

      {/* MODALS */}
      {showHowToPlay && <HowToPlayModal onClose={() => setShowHowToPlay(false)} />}

      {showStats && (
        <StatsDashboard
          stats={stats}
          achievements={achievements}
          onClose={() => setShowStats(false)}
        />
      )}

      {showSettings && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={(newSettings) => {
            setSettings(newSettings);
            saveSettings(newSettings);
          }}
          onResetStats={() => {
            const initial = { ...stats, wins: 0, losses: 0, draws: 0, totalGames: 0, currentStreak: 0, longestStreak: 0 };
            setStats(initial);
            saveStats(initial);
          }}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
