export type Player = 'yang' | 'yin';
export type Cell = Player | null;
export type Board = readonly Cell[];

export const BOARD_SIZE = 9;

export const WINNING_LINES: ReadonlyArray<readonly [number, number, number]> = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export interface Outcome {
  winner: Player | null;
  line: readonly [number, number, number] | null;
  isDraw: boolean;
}

export function createBoard(): Board {
  return Array.from({ length: BOARD_SIZE }, () => null);
}

export function currentPlayer(board: Board): Player {
  const played = board.filter((cell) => cell !== null).length;
  return played % 2 === 0 ? 'yang' : 'yin';
}

export function availableMoves(board: Board): number[] {
  const moves: number[] = [];
  board.forEach((cell, index) => {
    if (cell === null) moves.push(index);
  });
  return moves;
}

export function evaluate(board: Board): Outcome {
  for (const line of WINNING_LINES) {
    const [a, b, c] = line;
    const mark = board[a];
    if (mark !== null && mark === board[b] && mark === board[c]) {
      return { winner: mark, line, isDraw: false };
    }
  }

  const isDraw = board.every((cell) => cell !== null);
  return { winner: null, line: null, isDraw };
}

export function isGameOver(board: Board): boolean {
  const outcome = evaluate(board);
  return outcome.winner !== null || outcome.isDraw;
}

export function play(board: Board, index: number): Board {
  if (index < 0 || index >= BOARD_SIZE) {
    throw new RangeError(`Square ${index} is outside the board`);
  }
  if (board[index] !== null) {
    throw new Error(`Square ${index} is already taken`);
  }
  if (isGameOver(board)) {
    throw new Error('The game is already decided');
  }

  const next = [...board];
  next[index] = currentPlayer(board);
  return next;
}
