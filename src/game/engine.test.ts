import { describe, expect, it } from 'vitest';
import {
  availableMoves,
  createBoard,
  currentPlayer,
  evaluate,
  isGameOver,
  opponentOf,
  play,
  type Board,
} from './engine';

function boardFrom(pattern: string): Board {
  return pattern
    .split('')
    .filter((character) => character !== ' ')
    .map((character) => {
      if (character === 'O') return 'yang';
      if (character === 'X') return 'yin';
      return null;
    });
}

describe('createBoard', () => {
  it('starts with nine empty squares', () => {
    const board = createBoard();
    expect(board).toHaveLength(9);
    expect(board.every((cell) => cell === null)).toBe(true);
  });
});

describe('currentPlayer', () => {
  it('opens with yang', () => {
    expect(currentPlayer(createBoard())).toBe('yang');
  });

  it('alternates after every move', () => {
    const board = play(createBoard(), 4);
    expect(currentPlayer(board)).toBe('yin');
    expect(currentPlayer(play(board, 0))).toBe('yang');
  });
});

describe('play', () => {
  it('rejects squares outside the board', () => {
    expect(() => play(createBoard(), 9)).toThrow(RangeError);
    expect(() => play(createBoard(), -1)).toThrow(RangeError);
  });

  it('rejects an occupied square', () => {
    const board = play(createBoard(), 0);
    expect(() => play(board, 0)).toThrow(/already taken/);
  });

  it('rejects a move once the game is decided', () => {
    const board = boardFrom('OOO XX. ...');
    expect(() => play(board, 5)).toThrow(/already decided/);
  });

  it('does not mutate the board it was given', () => {
    const board = createBoard();
    play(board, 3);
    expect(board[3]).toBeNull();
  });
});

describe('evaluate', () => {
  it('reports no result for an unfinished game', () => {
    expect(evaluate(boardFrom('OX. ... ...'))).toEqual({
      winner: null,
      line: null,
      isDraw: false,
    });
  });

  const winningCases: Array<{ name: string; pattern: string; line: number[] }> = [
    { name: 'row', pattern: 'OOO XX. ...', line: [0, 1, 2] },
    { name: 'column', pattern: 'OX. OX. O..', line: [0, 3, 6] },
    { name: 'diagonal', pattern: 'OX. XO. ..O', line: [0, 4, 8] },
    { name: 'anti-diagonal', pattern: '.XO XO. O..', line: [2, 4, 6] },
  ];

  it.each(winningCases)('detects a winning $name', ({ pattern, line }) => {
    const outcome = evaluate(boardFrom(pattern));
    expect(outcome.winner).not.toBeNull();
    expect(outcome.line).toEqual(line);
    expect(outcome.isDraw).toBe(false);
  });

  it('detects a full board with no winner as a draw', () => {
    const outcome = evaluate(boardFrom('OXO XXO OOX'));
    expect(outcome.winner).toBeNull();
    expect(outcome.isDraw).toBe(true);
  });
});

describe('availableMoves', () => {
  it('lists only empty squares', () => {
    expect(availableMoves(boardFrom('OX. ..X ...'))).toEqual([2, 3, 4, 6, 7, 8]);
  });
});

describe('isGameOver', () => {
  it('is false while squares remain and nobody has won', () => {
    expect(isGameOver(boardFrom('OX. ... ...'))).toBe(false);
  });

  it('is true on a win and on a draw', () => {
    expect(isGameOver(boardFrom('OOO XX. ...'))).toBe(true);
    expect(isGameOver(boardFrom('OXO XXO OOX'))).toBe(true);
  });
});

describe('opponentOf', () => {
  it('maps each player to the other', () => {
    expect(opponentOf('yang')).toBe('yin');
    expect(opponentOf('yin')).toBe('yang');
  });
});
