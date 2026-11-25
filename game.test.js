const test = require("node:test");
const assert = require("node:assert/strict");
const { TicTacToe } = require("./game.js");

test("detects a win and stops further moves", () => {
  const game = new TicTacToe();

  [0, 3, 1, 4, 2].forEach((index) => game.play(index));

  assert.equal(game.winner, "X");
  assert.equal(game.getStatus(), "X wins!");
  assert.equal(game.gameOver, true);
  assert.equal(game.play(5), false);
});

test("detects a full-board draw", () => {
  const game = new TicTacToe();

  [0, 1, 2, 4, 3, 5, 7, 6, 8].forEach((index) => game.play(index));

  assert.equal(game.winner, null);
  assert.equal(game.isDraw, true);
  assert.equal(game.getStatus(), "It's a draw!");
});

test("reset clears the game and returns the turn to X", () => {
  const game = new TicTacToe();
  game.play(0);
  game.play(4);

  game.reset();

  assert.deepEqual(game.board, Array(9).fill(""));
  assert.equal(game.currentPlayer, "X");
  assert.equal(game.gameOver, false);
  assert.equal(game.getStatus(), "X's turn");
});
