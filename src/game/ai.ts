import {
  availableMoves,
  currentPlayer,
  evaluate,
  isGameOver,
  play,
  type Board,
  type Player,
} from './engine';

export type Difficulty = 'yielding' | 'balanced' | 'tao';

interface ScoredMove {
  move: number;
  score: number;
}

/**
 * Scores are expressed from `perspective`'s point of view and shrink with depth
 * so the search prefers winning sooner and losing later.
 */
function search(board: Board, perspective: Player, depth: number): number {
  const outcome = evaluate(board);
  if (outcome.winner !== null) {
    return outcome.winner === perspective ? 10 - depth : depth - 10;
  }
  if (outcome.isDraw) return 0;

  const maximizing = currentPlayer(board) === perspective;
  const scores = availableMoves(board).map((move) =>
    search(play(board, move), perspective, depth + 1),
  );

  return maximizing ? Math.max(...scores) : Math.min(...scores);
}

function rankMoves(board: Board): ScoredMove[] {
  const perspective = currentPlayer(board);
  return availableMoves(board)
    .map((move) => ({ move, score: search(play(board, move), perspective, 1) }))
    .sort((a, b) => b.score - a.score);
}

/**
 * Picks the opponent's reply. `tao` plays perfectly, `balanced` plays the best
 * move most of the time, and `yielding` takes whatever comes first.
 */
export function chooseMove(
  board: Board,
  difficulty: Difficulty = 'tao',
  random: () => number = Math.random,
): number | null {
  if (isGameOver(board)) return null;

  const moves = availableMoves(board);
  if (moves.length === 0) return null;

  if (difficulty === 'yielding') {
    return moves[Math.floor(random() * moves.length)];
  }

  const ranked = rankMoves(board);
  if (difficulty === 'balanced' && ranked.length > 1 && random() < 0.35) {
    return ranked[1 + Math.floor(random() * (ranked.length - 1))].move;
  }

  const best = ranked[0].score;
  const equallyGood = ranked.filter((entry) => entry.score === best);
  return equallyGood[Math.floor(random() * equallyGood.length)].move;
}
