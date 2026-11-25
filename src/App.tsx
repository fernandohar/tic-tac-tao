import { useEffect, useMemo, useReducer } from 'react';
import { chooseMove, type Difficulty } from './game/ai';
import {
  createBoard,
  currentPlayer,
  evaluate,
  isGameOver,
  play,
  type Board,
  type Player,
} from './game/engine';

const MARKS: Record<Player, string> = {
  yang: '\u25CB',
  yin: '\u2715',
};

const DIFFICULTIES: ReadonlyArray<{ value: Difficulty; label: string; hint: string }> = [
  { value: 'yielding', label: 'Yielding', hint: 'moves without intent' },
  { value: 'balanced', label: 'Balanced', hint: 'strong, but human' },
  { value: 'tao', label: 'Tao', hint: 'never loses' },
];

const HUMAN: Player = 'yang';
const MACHINE: Player = 'yin';

/** How long the opponent appears to deliberate before it answers, in ms. */
const THINKING_TIME = 320;

interface Tally {
  wins: number;
  draws: number;
  losses: number;
}

interface GameState {
  board: Board;
  difficulty: Difficulty;
  tally: Tally;
}

type GameAction =
  | { type: 'play'; index: number; by: Player }
  | { type: 'reset' }
  | { type: 'difficulty'; value: Difficulty };

const INITIAL_STATE: GameState = {
  board: createBoard(),
  difficulty: 'tao',
  tally: { wins: 0, draws: 0, losses: 0 },
};

function settle(tally: Tally, board: Board): Tally {
  const outcome = evaluate(board);
  return {
    wins: tally.wins + (outcome.winner === HUMAN ? 1 : 0),
    draws: tally.draws + (outcome.isDraw ? 1 : 0),
    losses: tally.losses + (outcome.winner === MACHINE ? 1 : 0),
  };
}

function reducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'play': {
      const { board } = state;
      if (isGameOver(board) || board[action.index] !== null) return state;
      if (currentPlayer(board) !== action.by) return state;

      const next = play(board, action.index);
      return {
        ...state,
        board: next,
        tally: isGameOver(next) ? settle(state.tally, next) : state.tally,
      };
    }
    case 'reset':
      return { ...state, board: createBoard() };
    case 'difficulty':
      return { ...state, difficulty: action.value, board: createBoard() };
  }
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const { board, difficulty, tally } = state;

  const outcome = useMemo(() => evaluate(board), [board]);
  const finished = outcome.winner !== null || outcome.isDraw;
  const turn = currentPlayer(board);

  useEffect(() => {
    if (finished || turn !== MACHINE) return;

    const timer = window.setTimeout(() => {
      const move = chooseMove(board, difficulty);
      if (move !== null) dispatch({ type: 'play', index: move, by: MACHINE });
    }, THINKING_TIME);

    return () => window.clearTimeout(timer);
  }, [board, difficulty, finished, turn]);

  let status: string;
  if (outcome.winner === HUMAN) status = 'You win.';
  else if (outcome.winner === MACHINE) status = 'The Tao wins.';
  else if (outcome.isDraw) status = 'Perfect balance \u2014 a draw.';
  else if (turn === HUMAN) status = 'Your move.';
  else status = 'The Tao is thinking\u2026';

  return (
    <main className="app">
      <header className="masthead">
        <h1>
          Tic<span className="dot" /> Tac<span className="dot" /> Tao
        </h1>
        <p className="subtitle">Yielding overcomes force. Take the centre anyway.</p>
      </header>

      <section className="panel" aria-label="Opponent">
        <span className="panel-label">Opponent</span>
        <div className="choices" role="radiogroup" aria-label="Difficulty">
          {DIFFICULTIES.map((option) => (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={difficulty === option.value}
              className={`choice${difficulty === option.value ? ' choice-active' : ''}`}
              onClick={() => dispatch({ type: 'difficulty', value: option.value })}
            >
              <span className="choice-label">{option.label}</span>
              <span className="choice-hint">{option.hint}</span>
            </button>
          ))}
        </div>
      </section>

      <p className="status" role="status" data-testid="status">
        {status}
      </p>

      <div className="board" role="grid" aria-label="Tic Tac Tao board">
        {board.map((cell, index) => {
          const winning = outcome.line?.includes(index) ?? false;
          return (
            <button
              key={index}
              type="button"
              role="gridcell"
              className={`square${winning ? ' square-winning' : ''}${
                cell ? ` square-${cell}` : ''
              }`}
              data-testid={`square-${index}`}
              aria-label={`Square ${index + 1}${cell ? `, ${cell}` : ', empty'}`}
              disabled={finished || cell !== null || turn !== HUMAN}
              onClick={() => dispatch({ type: 'play', index, by: HUMAN })}
            >
              {cell ? MARKS[cell] : ''}
            </button>
          );
        })}
      </div>

      <div className="controls">
        <button
          type="button"
          className="restart"
          onClick={() => dispatch({ type: 'reset' })}
          data-testid="restart"
        >
          New game
        </button>
        <dl className="tally" data-testid="tally">
          <div>
            <dt>Won</dt>
            <dd data-testid="tally-wins">{tally.wins}</dd>
          </div>
          <div>
            <dt>Drawn</dt>
            <dd data-testid="tally-draws">{tally.draws}</dd>
          </div>
          <div>
            <dt>Lost</dt>
            <dd data-testid="tally-losses">{tally.losses}</dd>
          </div>
        </dl>
      </div>
    </main>
  );
}
