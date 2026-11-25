const WINNING_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];


function debugBoard(board) {
  return board.map((cell) => cell || "-").join(" | ");
}

function debugMoveCount(board) {
  return board.filter(Boolean).length;
}


class TicTacToe {
  constructor() {
    this.reset();
  }

  play(index) {
    if (this.gameOver || index < 0 || index > 8 || this.board[index]) {
      return false;
    }

    this.board[index] = this.currentPlayer;
    this.winner = this.findWinner();

    if (this.winner) {
      this.gameOver = true;
    } else if (this.board.every(Boolean)) {
      this.isDraw = true;
      this.gameOver = true;
    } else {
      this.currentPlayer = this.currentPlayer === "X" ? "O" : "X";
    }

    return true;
  }

  findWinner() {
    const line = WINNING_LINES.find(([a, b, c]) => (
      this.board[a]
      && this.board[a] === this.board[b]
      && this.board[a] === this.board[c]
    ));

    return line ? this.board[line[0]] : null;
  }

  getStatus() {
    if (this.winner) return `${this.winner} wins!`;
    if (this.isDraw) return "It's a draw!";
    return `${this.currentPlayer}'s turn`;
  }

  reset() {
    this.board = Array(9).fill("");
    this.currentPlayer = "X";
    this.winner = null;
    this.isDraw = false;
    this.gameOver = false;
  }
}

if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => {
    const game = new TicTacToe();
    const cells = [...document.querySelectorAll(".cell")];
    const status = document.querySelector("#status");
    const newGame = document.querySelector("#new-game");

    const render = () => {
      cells.forEach((cell, index) => {
        const mark = game.board[index];
        cell.textContent = mark;
        cell.className = `cell${mark ? ` ${mark.toLowerCase()}` : ""}`;
        cell.disabled = game.gameOver || Boolean(mark);
      });

      status.textContent = game.getStatus();
      status.classList.toggle("win", Boolean(game.winner));
    };

    cells.forEach((cell) => {
      cell.addEventListener("click", () => {
        game.play(Number(cell.dataset.index));
        render();
      });
    });

    newGame.addEventListener("click", () => {
      game.reset();
      render();
    });

    render();
  });
}

if (typeof module !== "undefined") {
  module.exports = { TicTacToe, WINNING_LINES };
}
