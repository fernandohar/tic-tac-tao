# tic-tac-tao

Tic-tac-toe against an opponent that, at full strength, cannot be beaten.

Yang (○) always opens and is played by you. Yin (✕) is played by the machine, using
a minimax search over the whole game tree. Three opponents are available: **Yielding**
picks at random, **Balanced** usually plays the best move, and **Tao** plays perfectly —
the best you can do against it is a draw.

## Stack

React 19 and TypeScript on Vite, with Vitest for unit and component tests and
Playwright for browser tests. The game rules live in `src/game/engine.ts` as pure
functions, and the opponent in `src/game/ai.ts`; neither imports React, so both are
tested directly.

## Getting started

```bash
npm ci      # or: npm install
npm run dev # http://localhost:5173
```

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload on port 5173 |
| `npm run build` | Type-check, then build to `dist/` |
| `npm run preview` | Serve the production build on port 4173 |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint over the whole repository |
| `npm test` | Vitest unit and component tests |
| `npm run test:e2e` | Playwright browser tests (starts the dev server itself) |

The Playwright config uses the Chrome already installed on the machine
(`channel: 'chrome'`) rather than downloading a browser bundle. Point the suite at an
already-running server with `E2E_BASE_URL=http://127.0.0.1:5173 npm run test:e2e`.

## Layout

```
src/game/engine.ts   board, moves, win and draw detection — pure
src/game/ai.ts       minimax opponent and difficulty levels
src/App.tsx          board UI, turn handling, running tally
e2e/                 Playwright specs
```
