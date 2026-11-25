import { describe, expect, it } from 'vitest';
import { chooseMove } from './ai';
import {
  availableMoves,
  createBoard,
  currentPlayer,
  evaluate,
  isGameOver,
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

/** Deterministic stand-in for Math.random so move choice is reproducible. */
const alwaysFirst = () => 0;

describe('chooseMove', () => {
  it('returns null once the game is decided', () => {
    expect(chooseMove(boardFrom('OOO XX. ...'))).toBeNull();
    expect(chooseMove(boardFrom('OXO XXO OOX'))).toBeNull();
  });

  it('takes an immediate win', () => {
    expect(chooseMove(boardFrom('OO. XX. ...'), 'tao', alwaysFirst)).toBe(2);
  });

  it('blocks the opponent rather than wandering off', () => {
    expect(chooseMove(boardFrom('XX. O.. ..O'), 'tao', alwaysFirst)).toBe(2);
  });

  it('opens on the centre or a corner', () => {
    const move = chooseMove(createBoard(), 'tao', alwaysFirst);
    expect([0, 2, 4, 6, 8]).toContain(move);
  });

  it('only ever picks an empty square', () => {
    const board = boardFrom('OX. ..X ...');
    expect(availableMoves(board)).toContain(chooseMove(board, 'tao', alwaysFirst));
  });

  it('plays a legal move at every difficulty', () => {
    const board = boardFrom('OX. ..X ...');
    for (const difficulty of ['yielding', 'balanced', 'tao'] as const) {
      expect(availableMoves(board)).toContain(chooseMove(board, difficulty, alwaysFirst));
    }
  });
});

describe('a perfect game', () => {
  it('is always drawn when tao plays both sides', () => {
    let board = createBoard();
    while (!isGameOver(board)) {
      const move = chooseMove(board, 'tao', alwaysFirst);
      expect(move).not.toBeNull();
      board = play(board, move as number);
    }
    expect(evaluate(board).isDraw).toBe(true);
  });

  it('never loses to a player who always takes the first free square', () => {
    for (let opening = 0; opening < 9; opening += 1) {
      let board = play(createBoard(), opening);
      while (!isGameOver(board)) {
        const move =
          currentPlayer(board) === 'yin'
            ? chooseMove(board, 'tao', alwaysFirst)
            : availableMoves(board)[0];
        board = play(board, move as number);
      }
      expect(evaluate(board).winner).not.toBe('yang');
    }
  });
});
