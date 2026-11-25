import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';

describe('<App />', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders an empty board and invites the first move', () => {
    render(<App />);
    expect(screen.getByTestId('status')).toHaveTextContent('Your move.');
    for (let index = 0; index < 9; index += 1) {
      expect(screen.getByTestId(`square-${index}`)).toHaveTextContent('');
    }
  });

  it('marks the clicked square and lets the opponent reply', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<App />);

    await user.click(screen.getByTestId('square-4'));
    expect(screen.getByTestId('square-4')).toHaveTextContent('\u25CB');

    await waitFor(() => {
      const marks = Array.from({ length: 9 }, (_, index) =>
        screen.getByTestId(`square-${index}`).textContent,
      ).filter(Boolean);
      expect(marks).toHaveLength(2);
    });
  });

  it('switches difficulty and clears the board', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<App />);

    await user.click(screen.getByTestId('square-0'));
    expect(screen.getByTestId('square-0')).toHaveTextContent('\u25CB');

    await user.click(screen.getByRole('radio', { name: /yielding/i }));

    expect(screen.getByRole('radio', { name: /yielding/i })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    expect(screen.getByTestId('square-0')).toHaveTextContent('');
  });

  it('starts the tally at zero', () => {
    render(<App />);
    const tally = within(screen.getByTestId('tally'));
    expect(tally.getByTestId('tally-wins')).toHaveTextContent('0');
    expect(tally.getByTestId('tally-draws')).toHaveTextContent('0');
    expect(tally.getByTestId('tally-losses')).toHaveTextContent('0');
  });
});
