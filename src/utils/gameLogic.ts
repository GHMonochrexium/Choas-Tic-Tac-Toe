import { AbilityDefinition, AbilityId, AIDifficulty, CellState, PlayerId, PlayerSymbol, WinResult } from '../types/game';

export const ABILITIES: Record<AbilityId, AbilityDefinition> = {
  shuffle: {
    id: 'shuffle',
    name: 'Shuffle',
    maxUses: 1,
    tagline: 'Rearrange the battlefield',
    description: 'Randomly shuffles all existing Xs and Os across the board. Blocked squares stay blocked.',
    visualExplanation: 'Symbols whirl and swap positions randomly. If both players complete lines, it ends in a Draw!',
    accentColor: 'from-amber-500 to-yellow-400',
    glowColor: 'rgba(245, 158, 11, 0.5)',
  },
  outer_board: {
    id: 'outer_board',
    name: 'Outer Board',
    maxUses: 3,
    tagline: 'Expand the arena size',
    description: 'Expands the grid symmetrically (3x3 → 4x4 → 5x5 → 6x6). Winning target grows with board size!',
    visualExplanation: 'Dynamically shifts victory target: 3 in a row (3x3), 4 (4x4), 5 (5x5), 6 (6x6). Maximum 6x6.',
    accentColor: 'from-blue-500 to-cyan-400',
    glowColor: 'rgba(59, 130, 246, 0.5)',
  },
  blind: {
    id: 'blind',
    name: 'Blind',
    maxUses: 2,
    tagline: 'Shrouds opponent in darkness',
    description: 'Completely blacks out opponent screen until they successfully place a symbol in a valid empty square.',
    visualExplanation: 'No timer! The opponent must tap in the dark. Invalid moves keep the black screen active.',
    accentColor: 'from-slate-600 to-slate-900',
    glowColor: 'rgba(100, 116, 139, 0.5)',
  },
  lunge: {
    id: 'lunge',
    name: 'Lunge',
    maxUses: 1,
    tagline: 'Double strike (5x5 & 6x6 only)',
    description: 'Place TWO symbols during a single turn. Only usable on expanded boards (5x5 and 6x6; locked on 3x3 and 4x4).',
    visualExplanation: 'Double strike! Requires a 5x5 or 6x6 arena. Disabled on 3x3 and 4x4 boards.',
    accentColor: 'from-emerald-500 to-teal-400',
    glowColor: 'rgba(16, 185, 129, 0.5)',
  },
  nuke: {
    id: 'nuke',
    name: 'Nuclear Bomb',
    maxUses: 1,
    tagline: 'Random apocalyptic blast',
    description: 'Detonates a random explosion zone. Destroys all symbols and permanently blocks the craters!',
    visualExplanation: 'Random landing coordinates! Destroyed winning lines are erased. 3x3: 1x1 crater, 4x4: 2x2, 5x5: 3x3, 6x6: 4x4.',
    accentColor: 'from-red-600 to-orange-500',
    glowColor: 'rgba(239, 68, 68, 0.6)',
  },
  skip: {
    id: 'skip',
    name: 'Skip a Turn',
    maxUses: 2,
    tagline: 'Extra symbol (4x4+ only)',
    description: "Forces opponent to skip their turn, granting you one extra cross or circle placement. Only usable on 4x4 boards or larger; abilities are locked during this move.",
    visualExplanation: 'Requires 4x4+ board! Grants one extra placement only. No abilities allowed. Opponent takes their turn immediately after.',
    accentColor: 'from-indigo-500 to-purple-500',
    glowColor: 'rgba(99, 102, 241, 0.5)',
  },
  fakeout: {
    id: 'fakeout',
    name: 'Fakeout',
    maxUses: 1,
    tagline: 'Deceptive purple mind game',
    description: 'Place a deceptive PURPLE symbol. If opponent ignores it and makes a normal move, they instantly LOSE!',
    visualExplanation: 'Opponent must click the purple symbol to disarm it (ending their turn). If they ignore it, you WIN!',
    accentColor: 'from-fuchsia-600 to-purple-500',
    glowColor: 'rgba(217, 70, 239, 0.6)',
  },
  turnover_bomb: {
    id: 'turnover_bomb',
    name: 'Turnover Bomb',
    maxUses: 1,
    tagline: 'Invert X & O (6x6 only)',
    description: 'Usable ONLY on a 6x6 board. Inverts every cross and circle on the arena (X becomes O, O becomes X)!',
    visualExplanation: 'Requires a 6x6 arena! Flips all placed Xs and Os across the entire board.',
    accentColor: 'from-orange-500 to-rose-500',
    glowColor: 'rgba(249, 115, 22, 0.6)',
  },
  stab_shot: {
    id: 'stab_shot',
    name: 'Stab Shot',
    maxUses: 1,
    tagline: 'Auto counter on diagonal win',
    description: 'Passive auto-trigger! When an opponent wins diagonally, 50% chance one symbol in their diagonal line disappears and the match continues!',
    visualExplanation: 'Plays automatically if opponent wins diagonally: 50% chance to shatter their winning line, 50% they still win.',
    accentColor: 'from-rose-600 to-red-700',
    glowColor: 'rgba(225, 29, 72, 0.6)',
    isPassive: true,
  },
  retract: {
    id: 'retract',
    name: 'Retract',
    maxUses: 3,
    tagline: 'Shrink arena (4x4+ only)',
    description: 'Shrinks the board down by 1 size (e.g. 6x6 → 5x5, 4x4 → 3x3). Only usable on 4x4 boards or larger.',
    visualExplanation: 'Reduces grid dimensions by 1 while lowering the required winning line length. Locked on 3x3.',
    accentColor: 'from-sky-500 to-indigo-600',
    glowColor: 'rgba(14, 165, 233, 0.5)',
  },
};

export const ALL_ABILITY_IDS: AbilityId[] = [
  'shuffle',
  'outer_board',
  'blind',
  'lunge',
  'nuke',
  'skip',
  'fakeout',
  'turnover_bomb',
  'stab_shot',
  'retract',
];

export function createEmptyBoard(size: number): CellState[][] {
  const board: CellState[][] = [];
  for (let r = 0; r < size; r++) {
    const row: CellState[] = [];
    for (let c = 0; c < size; c++) {
      row.push({
        symbol: null,
        isFake: false,
        isBlocked: false,
      });
    }
    board.push(row);
  }
  return board;
}

export function getRequiredToWin(boardSize: number): number {
  return boardSize; // 3x3 requires 3, 4x4 requires 4, 5x5 requires 5, 6x6 requires 6
}

/**
 * Check winner across all rows, columns, and diagonals.
 * Note: Fake symbols do NOT count towards winning.
 * Blocked cells break any continuous line.
 */
export function checkWinner(board: CellState[][], size: number): WinResult {
  const required = getRequiredToWin(size);
  const xStraightWins: { r: number; c: number }[][] = [];
  const oStraightWins: { r: number; c: number }[][] = [];
  const xDiagWins: { r: number; c: number }[][] = [];
  const oDiagWins: { r: number; c: number }[][] = [];

  // 1. Check Rows
  for (let r = 0; r < size; r++) {
    let countX = 0;
    let countO = 0;
    const cellsX: { r: number; c: number }[] = [];
    const cellsO: { r: number; c: number }[] = [];

    for (let c = 0; c < size; c++) {
      const cell = board[r][c];
      if (cell.symbol === 'X' && !cell.isFake && !cell.isBlocked) {
        countX++;
        cellsX.push({ r, c });
      } else {
        countX = 0;
        cellsX.length = 0;
      }

      if (cell.symbol === 'O' && !cell.isFake && !cell.isBlocked) {
        countO++;
        cellsO.push({ r, c });
      } else {
        countO = 0;
        cellsO.length = 0;
      }

      if (countX >= required) {
        xStraightWins.push([...cellsX.slice(-required)]);
      }
      if (countO >= required) {
        oStraightWins.push([...cellsO.slice(-required)]);
      }
    }
  }

  // 2. Check Columns
  for (let c = 0; c < size; c++) {
    let countX = 0;
    let countO = 0;
    const cellsX: { r: number; c: number }[] = [];
    const cellsO: { r: number; c: number }[] = [];

    for (let r = 0; r < size; r++) {
      const cell = board[r][c];
      if (cell.symbol === 'X' && !cell.isFake && !cell.isBlocked) {
        countX++;
        cellsX.push({ r, c });
      } else {
        countX = 0;
        cellsX.length = 0;
      }

      if (cell.symbol === 'O' && !cell.isFake && !cell.isBlocked) {
        countO++;
        cellsO.push({ r, c });
      } else {
        countO = 0;
        cellsO.length = 0;
      }

      if (countX >= required) {
        xStraightWins.push([...cellsX.slice(-required)]);
      }
      if (countO >= required) {
        oStraightWins.push([...cellsO.slice(-required)]);
      }
    }
  }

  // 3. Check Main Diagonals (\)
  for (let r0 = 0; r0 <= size - required; r0++) {
    for (let c0 = 0; c0 <= size - required; c0++) {
      let isX = true;
      let isO = true;
      const diag: { r: number; c: number }[] = [];
      for (let i = 0; i < required; i++) {
        const cell = board[r0 + i][c0 + i];
        diag.push({ r: r0 + i, c: c0 + i });
        if (cell.symbol !== 'X' || cell.isFake || cell.isBlocked) isX = false;
        if (cell.symbol !== 'O' || cell.isFake || cell.isBlocked) isO = false;
      }
      if (isX) xDiagWins.push(diag);
      if (isO) oDiagWins.push(diag);
    }
  }

  // 4. Check Anti-Diagonals (/)
  for (let r0 = 0; r0 <= size - required; r0++) {
    for (let c0 = required - 1; c0 < size; c0++) {
      let isX = true;
      let isO = true;
      const diag: { r: number; c: number }[] = [];
      for (let i = 0; i < required; i++) {
        const cell = board[r0 + i][c0 - i];
        diag.push({ r: r0 + i, c: c0 - i });
        if (cell.symbol !== 'X' || cell.isFake || cell.isBlocked) isX = false;
        if (cell.symbol !== 'O' || cell.isFake || cell.isBlocked) isO = false;
      }
      if (isX) xDiagWins.push(diag);
      if (isO) oDiagWins.push(diag);
    }
  }

  const xWins = [...xStraightWins, ...xDiagWins];
  const oWins = [...oStraightWins, ...oDiagWins];

  // If both players have completed winning lines simultaneously (e.g. after Shuffle or Turnover Bomb)
  if (xWins.length > 0 && oWins.length > 0) {
    return {
      winner: 'DRAW',
      winningCells: [...xWins[0], ...oWins[0]],
      reason: 'Simultaneous win after chaos shuffle! Result is a Draw.',
      isStalemate: false,
    };
  }

  if (xWins.length > 0) {
    return {
      winner: 'X',
      winningCells: xWins[0],
      reason: `Player X completed ${required} in a row!`,
      isDiagonalWin: xDiagWins.length > 0,
      diagonalWinningCells: xDiagWins[0],
    };
  }

  if (oWins.length > 0) {
    return {
      winner: 'O',
      winningCells: oWins[0],
      reason: `Player O completed ${required} in a row!`,
      isDiagonalWin: oDiagWins.length > 0,
      diagonalWinningCells: oDiagWins[0],
    };
  }

  // Check if board has empty valid squares left
  let hasValidEmpty = false;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!board[r][c].symbol && !board[r][c].isBlocked) {
        hasValidEmpty = true;
        break;
      }
    }
    if (hasValidEmpty) break;
  }

  if (!hasValidEmpty) {
    return {
      winner: 'DRAW',
      winningCells: [],
      reason: 'No valid moves remaining on the board.',
      isStalemate: true,
    };
  }

  // Check if nuclear bomb destroyed all potential winning lines for both players
  if (!hasAnyPossibleWinRemaining(board, size)) {
    return {
      winner: 'DRAW',
      winningCells: [],
      reason: 'The Nuclear destruction made victory mathematically impossible for both sides.',
      isStalemate: true,
    };
  }

  return { winner: null, winningCells: [], reason: '' };
}

/**
 * Checks if at least one player can mathematically still achieve the required in a row
 */
export function hasAnyPossibleWinRemaining(board: CellState[][], size: number): boolean {
  const req = getRequiredToWin(size);

  function lineCanWin(cells: CellState[], symbol: PlayerSymbol): boolean {
    // A line can win if every cell is either the player's real symbol OR an unblocked empty square
    return cells.every((c) => !c.isBlocked && (c.symbol === symbol || c.symbol === null));
  }

  // Check rows
  for (let r = 0; r < size; r++) {
    for (let c0 = 0; c0 <= size - req; c0++) {
      const slice = board[r].slice(c0, c0 + req);
      if (lineCanWin(slice, 'X') || lineCanWin(slice, 'O')) return true;
    }
  }

  // Check columns
  for (let c = 0; c < size; c++) {
    for (let r0 = 0; r0 <= size - req; r0++) {
      const slice: CellState[] = [];
      for (let i = 0; i < req; i++) slice.push(board[r0 + i][c]);
      if (lineCanWin(slice, 'X') || lineCanWin(slice, 'O')) return true;
    }
  }

  // Check diagonals
  for (let r0 = 0; r0 <= size - req; r0++) {
    for (let c0 = 0; c0 <= size - req; c0++) {
      const slice: CellState[] = [];
      for (let i = 0; i < req; i++) slice.push(board[r0 + i][c0 + i]);
      if (lineCanWin(slice, 'X') || lineCanWin(slice, 'O')) return true;
    }
  }

  for (let r0 = 0; r0 <= size - req; r0++) {
    for (let c0 = req - 1; c0 < size; c0++) {
      const slice: CellState[] = [];
      for (let i = 0; i < req; i++) slice.push(board[r0 + i][c0 - i]);
      if (lineCanWin(slice, 'X') || lineCanWin(slice, 'O')) return true;
    }
  }

  return false;
}

/**
 * Execute SHUFFLE:
 * Randomly shuffles all occupied X, O, and fake positions across currently occupied squares.
 * Preserves exact count of Xs and Os.
 * Empty spaces remain empty.
 * Blocked nuclear bomb squares remain blocked.
 */
export function executeShuffle(board: CellState[][], size: number): CellState[][] {
  const newBoard: CellState[][] = board.map((row) => row.map((cell) => ({ ...cell })));
  const occupiedCoords: { r: number; c: number }[] = [];
  const contents: { symbol: PlayerSymbol | null; isFake: boolean; fakeOwner?: PlayerId }[] = [];

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const cell = newBoard[r][c];
      if (cell.symbol !== null && !cell.isBlocked) {
        occupiedCoords.push({ r, c });
        contents.push({
          symbol: cell.symbol,
          isFake: cell.isFake,
          fakeOwner: cell.fakeOwner,
        });
      }
    }
  }

  if (occupiedCoords.length <= 1) {
    return newBoard;
  }

  // Shuffle contents array (Fisher-Yates)
  for (let i = contents.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [contents[i], contents[j]] = [contents[j], contents[i]];
  }

  // Reassign to the occupied coords
  occupiedCoords.forEach((coord, index) => {
    newBoard[coord.r][coord.c].symbol = contents[index].symbol;
    newBoard[coord.r][coord.c].isFake = contents[index].isFake;
    newBoard[coord.r][coord.c].fakeOwner = contents[index].fakeOwner;
  });

  return newBoard;
}

/**
 * Execute OUTER BOARD:
 * Expands board size by 1 (up to 6x6 max).
 * Centers existing contents symmetrically.
 */
export function expandBoardToSize(
  board: CellState[][],
  currentSize: number,
  targetSize: number
): { newBoard: CellState[][]; newSize: number } {
  if (targetSize <= currentSize) {
    return { newBoard: board, newSize: currentSize };
  }

  const newBoard = createEmptyBoard(targetSize);
  const rowOffset = Math.floor((targetSize - currentSize) / 2);
  const colOffset = Math.floor((targetSize - currentSize) / 2);

  for (let r = 0; r < currentSize; r++) {
    for (let c = 0; c < currentSize; c++) {
      newBoard[r + rowOffset][c + colOffset] = { ...board[r][c] };
    }
  }

  return { newBoard, newSize: targetSize };
}

export function executeOuterBoard(
  board: CellState[][],
  currentSize: number
): { newBoard: CellState[][]; newSize: number } {
  if (currentSize >= 6) {
    return { newBoard: board, newSize: currentSize };
  }

  return expandBoardToSize(board, currentSize, currentSize + 1);
}

/**
 * Execute TURNOVER BOMB:
 * Inverts all X and O symbols across the board (X -> O, O -> X).
 * Blocked squares remain blocked and empty squares remain empty.
 */
export function executeTurnoverBomb(board: CellState[][], size: number): CellState[][] {
  const newBoard: CellState[][] = board.map((row) =>
    row.map((cell) => {
      if (cell.isBlocked || cell.symbol === null) {
        return { ...cell };
      }
      return {
        ...cell,
        symbol: cell.symbol === 'X' ? 'O' : 'X',
      };
    })
  );
  return newBoard.slice(0, size);
}

/**
 * Execute RETRACT:
 * Shrinks board size down by 1 (minimum 3x3).
 */
export function executeRetract(
  board: CellState[][],
  currentSize: number
): { newBoard: CellState[][]; newSize: number } {
  if (currentSize <= 3) {
    return { newBoard: board, newSize: currentSize };
  }

  const targetSize = currentSize - 1;
  const newBoard = createEmptyBoard(targetSize);
  for (let r = 0; r < targetSize; r++) {
    for (let c = 0; c < targetSize; c++) {
      newBoard[r][c] = { ...board[r][c] };
    }
  }

  return { newBoard, newSize: targetSize };
}

/**
 * Calculate random Nuclear Bomb explosion zone.
 * Explosion sizes:
 * 3x3: 1x1
 * 4x4: 2x2
 * 5x5: 3x3
 * 6x6: 4x4
 */
export function calculateRandomNukeZone(
  boardSize: number
): { cells: { r: number; c: number }[]; blastSize: number } {
  let blastSize = 1;
  if (boardSize === 4) blastSize = 2;
  else if (boardSize === 5) blastSize = 3;
  else if (boardSize >= 6) blastSize = 4;

  const maxRow = boardSize - blastSize;
  const maxCol = boardSize - blastSize;

  const startRow = Math.floor(Math.random() * (maxRow + 1));
  const startCol = Math.floor(Math.random() * (maxCol + 1));

  const cells: { r: number; c: number }[] = [];
  for (let r = startRow; r < startRow + blastSize; r++) {
    for (let c = startCol; c < startCol + blastSize; c++) {
      cells.push({ r, c });
    }
  }

  return { cells, blastSize };
}

/**
 * Strategic AI Decision Engine
 */
export function computeAIMove(
  board: CellState[][],
  size: number,
  aiSymbol: PlayerSymbol,
  humanSymbol: PlayerSymbol,
  difficulty: AIDifficulty,
  isAIBlinded: boolean,
  aiAbilitiesRemaining: Record<AbilityId, number>,
  hasFakeoutOnBoard: boolean,
  hasBonusExtraTurn = false
): {
  targetCell: { r: number; c: number };
  abilityToUse?: AbilityId;
  interactWithFakeout?: boolean;
} {
  // If AI is blinded: strictly cannot see board or strategic opportunities!
  // It chooses an open coordinate completely at random as if guessing in the dark.
  if (isAIBlinded) {
    const blindOpenCells: { r: number; c: number }[] = [];
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (!board[r][c].symbol && !board[r][c].isBlocked) {
          blindOpenCells.push({ r, c });
        }
      }
    }
    if (blindOpenCells.length > 0) {
      const pick = blindOpenCells[Math.floor(Math.random() * blindOpenCells.length)];
      return { targetCell: pick };
    }
    return { targetCell: { r: 0, c: 0 } };
  }

  // Check if there is a fakeout symbol on board.
  // Fakeout rule: If opponent clicks fake symbol, it disappears and opponent's turn ends.
  // If opponent makes a normal move, Fakeout succeeds and opponent immediately loses!
  // So a smart AI (Medium / Hard) must identify fakeout if suspicious!
  let fakeCoord: { r: number; c: number } | null = null;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (board[r][c].isFake && board[r][c].symbol !== null) {
        fakeCoord = { r, c };
        break;
      }
    }
    if (fakeCoord) break;
  }

  if (fakeCoord) {
    // Easy AI: 70% chance it misses the fakeout and loses!
    if (difficulty === 'easy') {
      if (Math.random() < 0.3) {
        return { targetCell: fakeCoord, interactWithFakeout: true };
      }
    } else if (difficulty === 'medium') {
      // Medium AI: 75% chance it spots the fakeout
      if (Math.random() < 0.75) {
        return { targetCell: fakeCoord, interactWithFakeout: true };
      }
    } else if (difficulty === 'hard') {
      // Hard AI: 95% chance it notices the purple deception and disarms it
      if (Math.random() < 0.95) {
        return { targetCell: fakeCoord, interactWithFakeout: true };
      }
    } else {
      // Insane AI: 100% spots and disarms every fakeout
      return { targetCell: fakeCoord, interactWithFakeout: true };
    }
  }

  // Find all open cells
  const openCells: { r: number; c: number }[] = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!board[r][c].symbol && !board[r][c].isBlocked) {
        openCells.push({ r, c });
      }
    }
  }

  if (openCells.length === 0) {
    return { targetCell: { r: 0, c: 0 } };
  }

  // Ability choice logic
  let plannedAbility: AbilityId | undefined = undefined;

  // Easy AI
  if (difficulty === 'easy') {
    const randomPick = openCells[Math.floor(Math.random() * openCells.length)];
    if (Math.random() < 0.25) {
      const avail = ALL_ABILITY_IDS.filter(
        (id) =>
          (aiAbilitiesRemaining[id] || 0) > 0 &&
          !ABILITIES[id].isPassive &&
          !(id === 'skip' && size < 4) &&
          !(id === 'lunge' && size <= 4) &&
          !(id === 'outer_board' && size >= 6) &&
          !(id === 'turnover_bomb' && size !== 6) &&
          !(id === 'retract' && size < 4)
      );
      if (avail.length > 0) {
        plannedAbility = avail[Math.floor(Math.random() * avail.length)];
      }
    }
    return { targetCell: randomPick, abilityToUse: plannedAbility };
  }

  // Medium, Hard, and Insane AI: evaluate immediate winning moves first
  for (const cell of openCells) {
    const testBoard = board.map((row) => row.map((c) => ({ ...c })));
    testBoard[cell.r][cell.c].symbol = aiSymbol;
    const res = checkWinner(testBoard, size);
    if (res.winner === aiSymbol) {
      return { targetCell: cell };
    }
  }

  // INSANE AI ENGINE (Way harder than Hard)
  if (difficulty === 'insane') {
    const getOpen = (b: CellState[][], s: number) => {
      const list: { r: number; c: number }[] = [];
      for (let r = 0; r < s; r++) {
        for (let c = 0; c < s; c++) {
          if (!b[r][c].symbol && !b[r][c].isBlocked) list.push({ r, c });
        }
      }
      return list;
    };

    const getImmediateWinCells = (b: CellState[][], s: number, sym: PlayerSymbol, cells: { r: number; c: number }[]) => {
      const wins: { r: number; c: number }[] = [];
      for (const c of cells) {
        const tb = b.map((row) => row.map((x) => ({ ...x })));
        tb[c.r][c.c] = { symbol: sym, isFake: false, isBlocked: false };
        if (checkWinner(tb, s).winner === sym) {
          wins.push(c);
        }
      }
      return wins;
    };

    const scoreWindow = (cells: CellState[], req: number): number => {
      let aiCount = 0;
      let humCount = 0;
      for (const cell of cells) {
        if (cell.isBlocked) return 0;
        if (cell.symbol === aiSymbol && !cell.isFake) aiCount++;
        else if (cell.symbol === humanSymbol && !cell.isFake) humCount++;
      }
      if (aiCount > 0 && humCount > 0) return 0;
      if (aiCount === 0 && humCount === 0) return 1;
      if (aiCount > 0) {
        if (aiCount >= req) return 1000000;
        return Math.pow(12, aiCount);
      }
      if (humCount >= req) return -1000000;
      return -Math.pow(14, humCount);
    };

    const evaluateHeuristic = (b: CellState[][], s: number): number => {
      const req = getRequiredToWin(s);
      let total = 0;
      // Rows
      for (let r = 0; r < s; r++) {
        for (let c0 = 0; c0 <= s - req; c0++) {
          total += scoreWindow(b[r].slice(c0, c0 + req), req);
        }
      }
      // Cols
      for (let c = 0; c < s; c++) {
        for (let r0 = 0; r0 <= s - req; r0++) {
          const slice: CellState[] = [];
          for (let i = 0; i < req; i++) slice.push(b[r0 + i][c]);
          total += scoreWindow(slice, req);
        }
      }
      // Main Diagonals
      for (let r0 = 0; r0 <= s - req; r0++) {
        for (let c0 = 0; c0 <= s - req; c0++) {
          const slice: CellState[] = [];
          for (let i = 0; i < req; i++) slice.push(b[r0 + i][c0 + i]);
          total += scoreWindow(slice, req);
        }
      }
      // Anti-Diagonals
      for (let r0 = 0; r0 <= s - req; r0++) {
        for (let c0 = req - 1; c0 < s; c0++) {
          const slice: CellState[] = [];
          for (let i = 0; i < req; i++) slice.push(b[r0 + i][c0 - i]);
          total += scoreWindow(slice, req);
        }
      }
      // Center proximity bonus
      const center = (s - 1) / 2;
      for (let r = 0; r < s; r++) {
        for (let c = 0; c < s; c++) {
          const cell = b[r][c];
          if (!cell.isFake && !cell.isBlocked && cell.symbol) {
            const dist = Math.abs(r - center) + Math.abs(c - center);
            const bonus = (s - dist) * 2;
            total += cell.symbol === aiSymbol ? bonus : -bonus;
          }
        }
      }
      return total;
    };

    // 1. Check immediate ability-based wins (Turnover Bomb on 6x6, Retract on 4x4+, Skip/Lunge 2-move lethal)
    if (size === 6 && (aiAbilitiesRemaining['turnover_bomb'] || 0) > 0) {
      const inverted = executeTurnoverBomb(board, size);
      if (checkWinner(inverted, size).winner === aiSymbol) {
        return { targetCell: openCells[0], abilityToUse: 'turnover_bomb' };
      }
    }

    if (size >= 4 && (aiAbilitiesRemaining['retract'] || 0) > 0) {
      const { newBoard, newSize } = executeRetract(board, size);
      if (checkWinner(newBoard, newSize).winner === aiSymbol) {
        return { targetCell: openCells[0], abilityToUse: 'retract' };
      }
    }

    // Check 2-move guaranteed win using active bonus turn, Skip (4x4+), or Lunge (5x5+)
    if (
      hasBonusExtraTurn ||
      (size >= 4 && (aiAbilitiesRemaining['skip'] || 0) > 0) ||
      (size >= 5 && (aiAbilitiesRemaining['lunge'] || 0) > 0 && openCells.length >= 2)
    ) {
      for (const firstCell of openCells) {
        const tb = board.map((row) => row.map((x) => ({ ...x })));
        tb[firstCell.r][firstCell.c] = { symbol: aiSymbol, isFake: false, isBlocked: false };
        const rem = openCells.filter((o) => o.r !== firstCell.r || o.c !== firstCell.c);
        const secondWins = getImmediateWinCells(tb, size, aiSymbol, rem);
        if (secondWins.length > 0) {
          if (hasBonusExtraTurn) {
            return { targetCell: firstCell };
          }
          if (size >= 4 && (aiAbilitiesRemaining['skip'] || 0) > 0) {
            return { targetCell: firstCell, abilityToUse: 'skip' };
          }
          if (size >= 5 && (aiAbilitiesRemaining['lunge'] || 0) > 0) {
            return { targetCell: firstCell, abilityToUse: 'lunge' };
          }
        }
      }
    }

    // 2. Check ALL immediate Human winning threats
    const humanWinCells = getImmediateWinCells(board, size, humanSymbol, openCells);
    if (humanWinCells.length >= 2) {
      // Unstoppable normal fork! Use abilities to disrupt or escape
      if (size < 6 && (aiAbilitiesRemaining['outer_board'] || 0) > 0) {
        return { targetCell: humanWinCells[0], abilityToUse: 'outer_board' };
      }
      if (size >= 4 && (aiAbilitiesRemaining['retract'] || 0) > 0) {
        const { newBoard, newSize } = executeRetract(board, size);
        const remAfter = getOpen(newBoard, newSize);
        if (getImmediateWinCells(newBoard, newSize, humanSymbol, remAfter).length < 2) {
          return { targetCell: humanWinCells[0], abilityToUse: 'retract' };
        }
      }
      if ((aiAbilitiesRemaining['nuke'] || 0) > 0) {
        return { targetCell: humanWinCells[0], abilityToUse: 'nuke' };
      }
      if ((aiAbilitiesRemaining['blind'] || 0) > 0) {
        return { targetCell: humanWinCells[0], abilityToUse: 'blind' };
      }
      if ((aiAbilitiesRemaining['shuffle'] || 0) > 0) {
        return { targetCell: humanWinCells[0], abilityToUse: 'shuffle' };
      }
      return { targetCell: humanWinCells[0] };
    }

    if (humanWinCells.length === 1) {
      const blockCell = humanWinCells[0];
      // Check if blocking still leaves Human with strong pressure; optionally pair Blind
      let smartAbility: AbilityId | undefined = undefined;
      if ((aiAbilitiesRemaining['blind'] || 0) > 0 && openCells.length <= size * size - 3) {
        smartAbility = 'blind';
      }
      return { targetCell: blockCell, abilityToUse: smartAbility };
    }

    // 3. Check if AI can create a Fork (2+ winning threats after 1 move)
    for (const cell of openCells) {
      const tb = board.map((row) => row.map((x) => ({ ...x })));
      tb[cell.r][cell.c] = { symbol: aiSymbol, isFake: false, isBlocked: false };
      const rem = openCells.filter((o) => o.r !== cell.r || o.c !== cell.c);
      const aiThreats = getImmediateWinCells(tb, size, aiSymbol, rem);
      if (aiThreats.length >= 2) {
        const ability = (aiAbilitiesRemaining['blind'] || 0) > 0 ? 'blind' : undefined;
        return { targetCell: cell, abilityToUse: ability };
      }
    }

    // 4. Check if Human can create a Fork next turn and preemptively block it
    const humanForkCells: { r: number; c: number }[] = [];
    for (const cell of openCells) {
      const tb = board.map((row) => row.map((x) => ({ ...x })));
      tb[cell.r][cell.c] = { symbol: humanSymbol, isFake: false, isBlocked: false };
      const rem = openCells.filter((o) => o.r !== cell.r || o.c !== cell.c);
      const humThreats = getImmediateWinCells(tb, size, humanSymbol, rem);
      if (humThreats.length >= 2) {
        humanForkCells.push(cell);
      }
    }

    // 5. Alpha-Beta Minimax (exact search on 3x3, fast pruned search on 4x4+)
    const maxDepth = size === 3 ? 9 : 3;
    const minimax = (
      b: CellState[][],
      depth: number,
      isMax: boolean,
      alpha: number,
      beta: number
    ): number => {
      const res = checkWinner(b, size);
      if (res.winner === aiSymbol) return 1000000 - depth * 100;
      if (res.winner === humanSymbol) return -1000000 + depth * 100;
      if (res.winner === 'DRAW') return 0;
      if (depth >= maxDepth) return evaluateHeuristic(b, size);

      let candidates = getOpen(b, size);
      if (candidates.length === 0) return 0;

      // On 4x4+ boards, sort and examine top 8 candidates to keep search instant
      if (size > 3 && candidates.length > 8) {
        const scored = candidates.map((cand) => {
          const tb = b.map((row) => row.map((x) => ({ ...x })));
          tb[cand.r][cand.c] = { symbol: isMax ? aiSymbol : humanSymbol, isFake: false, isBlocked: false };
          return { cand, val: evaluateHeuristic(tb, size) };
        });
        scored.sort((a, b2) => (isMax ? b2.val - a.val : a.val - b2.val));
        candidates = scored.slice(0, 8).map((x) => x.cand);
      }

      if (isMax) {
        let best = -Infinity;
        for (const cand of candidates) {
          b[cand.r][cand.c] = { symbol: aiSymbol, isFake: false, isBlocked: false };
          const score = minimax(b, depth + 1, false, alpha, beta);
          b[cand.r][cand.c] = { symbol: null, isFake: false, isBlocked: false };
          best = Math.max(best, score);
          alpha = Math.max(alpha, best);
          if (beta <= alpha) break;
        }
        return best;
      } else {
        let best = Infinity;
        for (const cand of candidates) {
          b[cand.r][cand.c] = { symbol: humanSymbol, isFake: false, isBlocked: false };
          const score = minimax(b, depth + 1, true, alpha, beta);
          b[cand.r][cand.c] = { symbol: null, isFake: false, isBlocked: false };
          best = Math.min(best, score);
          beta = Math.min(beta, best);
          if (beta <= alpha) break;
        }
        return best;
      }
    };

    const candidatePool =
      humanForkCells.length === 1
        ? humanForkCells
        : openCells;

    let bestMove = candidatePool[0];
    let bestScore = -Infinity;
    const searchBoard = board.map((row) => row.map((x) => ({ ...x })));

    for (const cand of candidatePool) {
      searchBoard[cand.r][cand.c] = { symbol: aiSymbol, isFake: false, isBlocked: false };
      const score = minimax(searchBoard, 1, false, -Infinity, Infinity);
      searchBoard[cand.r][cand.c] = { symbol: null, isFake: false, isBlocked: false };
      if (score > bestScore) {
        bestScore = score;
        bestMove = cand;
      }
    }

    // Strategic ability selection if losing on heuristic or setting up pressure
    const currentEval = evaluateHeuristic(board, size);
    if (currentEval < -200 && (aiAbilitiesRemaining['nuke'] || 0) > 0) {
      plannedAbility = 'nuke';
    } else if (currentEval < -250 && (aiAbilitiesRemaining['shuffle'] || 0) > 0) {
      plannedAbility = 'shuffle';
    } else if ((aiAbilitiesRemaining['blind'] || 0) > 0 && openCells.length <= size * size - 2 && bestScore > 0) {
      plannedAbility = 'blind';
    } else if (size === 6 && (aiAbilitiesRemaining['turnover_bomb'] || 0) > 0) {
      const invEval = evaluateHeuristic(executeTurnoverBomb(board, size), size);
      if (invEval > currentEval + 150) {
        plannedAbility = 'turnover_bomb';
      }
    }

    return { targetCell: bestMove, abilityToUse: plannedAbility };
  }

  // 2. Medium & Hard AI: Can Human win on their next turn? (Must block!)
  let criticalBlockCell: { r: number; c: number } | null = null;
  for (const cell of openCells) {
    const testBoard = board.map((row) => row.map((c) => ({ ...c })));
    testBoard[cell.r][cell.c].symbol = humanSymbol;
    const res = checkWinner(testBoard, size);
    if (res.winner === humanSymbol) {
      criticalBlockCell = cell;
      break;
    }
  }

  if (criticalBlockCell) {
    // If Hard AI and has Skip, Blind, Turnover Bomb (6x6), Retract, or Outer Board
    if (difficulty === 'hard') {
      if (size === 6 && (aiAbilitiesRemaining['turnover_bomb'] || 0) > 0) {
        const inverted = executeTurnoverBomb(board, size);
        const invRes = checkWinner(inverted, size);
        if (invRes.winner === aiSymbol) {
          return { targetCell: criticalBlockCell, abilityToUse: 'turnover_bomb' };
        }
      }
      if (size >= 4 && (aiAbilitiesRemaining['skip'] || 0) > 0 && Math.random() < 0.6) {
        plannedAbility = 'skip';
      } else if ((aiAbilitiesRemaining['blind'] || 0) > 0 && Math.random() < 0.5) {
        plannedAbility = 'blind';
      } else if (size < 6 && (aiAbilitiesRemaining['outer_board'] || 0) > 0 && Math.random() < 0.4) {
        // Expanding board changes winning condition from N to N+1, preventing instant loss!
        plannedAbility = 'outer_board';
      } else if (size >= 4 && (aiAbilitiesRemaining['retract'] || 0) > 0 && Math.random() < 0.35) {
        plannedAbility = 'retract';
      }
    }
    return { targetCell: criticalBlockCell, abilityToUse: plannedAbility };
  }

  // If Hard AI: Check for strategic opportunities & abilities
  if (difficulty === 'hard') {
    if (size === 6 && (aiAbilitiesRemaining['turnover_bomb'] || 0) > 0 && Math.random() < 0.45) {
      const inverted = executeTurnoverBomb(board, size);
      const invRes = checkWinner(inverted, size);
      if (invRes.winner === aiSymbol) {
        plannedAbility = 'turnover_bomb';
      }
    }
    if (!plannedAbility && size >= 5 && (aiAbilitiesRemaining['lunge'] || 0) > 0 && openCells.length >= 2 && Math.random() < 0.5) {
      plannedAbility = 'lunge';
    } else if (!plannedAbility && (aiAbilitiesRemaining['fakeout'] || 0) > 0 && Math.random() < 0.4) {
      plannedAbility = 'fakeout';
    } else if (!plannedAbility && (aiAbilitiesRemaining['blind'] || 0) > 0 && Math.random() < 0.3) {
      plannedAbility = 'blind';
    } else if (!plannedAbility && size >= 4 && (aiAbilitiesRemaining['retract'] || 0) > 0 && Math.random() < 0.3) {
      plannedAbility = 'retract';
    }

    // Prefer center or corners
    const center = Math.floor(size / 2);
    const centerCell = openCells.find((c) => c.r === center && c.c === center);
    if (centerCell && Math.random() < 0.8) {
      return { targetCell: centerCell, abilityToUse: plannedAbility };
    }

    const corners = openCells.filter(
      (c) =>
        (c.r === 0 || c.r === size - 1) &&
        (c.c === 0 || c.c === size - 1)
    );
    if (corners.length > 0 && Math.random() < 0.7) {
      return {
        targetCell: corners[Math.floor(Math.random() * corners.length)],
        abilityToUse: plannedAbility,
      };
    }
  }

  // Fallback to random open cell
  return {
    targetCell: openCells[Math.floor(Math.random() * openCells.length)],
    abilityToUse: plannedAbility,
  };
}
