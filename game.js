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
    const resultOverlay = document.querySelector("#result-overlay");
    const resultMessage = document.querySelector("#result-message");
    const fireworks = document.querySelector("#fireworks");
    let resultTimer;
    let fireworkFrame;

    const createFireworks = () => {
      const colors = ["#ff8cad", "#6fdfe9", "#ffe66d", "#8e7dff", "#70ebba"];
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      const width = window.innerWidth;
      const height = window.innerHeight;
      const context = fireworks.getContext("2d");
      const particles = [];

      fireworks.width = width * pixelRatio;
      fireworks.height = height * pixelRatio;
      context.scale(pixelRatio, pixelRatio);

      for (let burst = 0; burst < 7; burst += 1) {
        const x = width * (0.12 + Math.random() * 0.76);
        const y = height * (0.12 + Math.random() * 0.5);

        for (let ray = 0; ray < 24; ray += 1) {
          const angle = (Math.PI * 2 * ray) / 24;
          const speed = 120 + Math.random() * 100;

          particles.push({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            delay: burst * 110 + Math.random() * 80,
            color: colors[(burst + ray) % colors.length],
            radius: 2.5 + Math.random() * 2.5,
          });
        }
      }

      const startedAt = performance.now();

      const draw = (now) => {
        const elapsed = now - startedAt;
        context.clearRect(0, 0, width, height);
        context.globalCompositeOperation = "lighter";

        particles.forEach((particle) => {
          const age = (elapsed - particle.delay) / 1000;

          if (age < 0 || age > 1.8) return;

          const opacity = 1 - age / 1.8;
          const x = particle.x + particle.vx * age;
          const y = particle.y + particle.vy * age + 45 * age * age;

          context.globalAlpha = opacity;
          context.strokeStyle = particle.color;
          context.lineWidth = particle.radius;
          context.beginPath();
          context.moveTo(x - particle.vx * 0.06, y - particle.vy * 0.06);
          context.lineTo(x, y);
          context.stroke();

          context.fillStyle = particle.color;
          context.beginPath();
          context.arc(x, y, particle.radius, 0, Math.PI * 2);
          context.fill();
        });

        context.globalAlpha = 1;

        if (elapsed < 2500) {
          fireworkFrame = requestAnimationFrame(draw);
        }
      };

      fireworkFrame = requestAnimationFrame(draw);
    };

    const hideResult = () => {
      clearTimeout(resultTimer);
      cancelAnimationFrame(fireworkFrame);
      const context = fireworks.getContext("2d");
      context.clearRect(0, 0, fireworks.width, fireworks.height);
      resultOverlay.classList.remove("show", "win");
      resultMessage.textContent = "";
    };

    const showResult = (message, withFireworks) => {
      hideResult();
      resultMessage.textContent = message;

      if (withFireworks) {
        createFireworks();
        resultOverlay.classList.add("win");
      }

      resultOverlay.getBoundingClientRect();
      resultOverlay.classList.add("show");
      resultTimer = setTimeout(hideResult, 3200);
    };

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
        const moved = game.play(Number(cell.dataset.index));
        render();

        if (moved && game.gameOver) {
          showResult(game.winner ? `${game.winner} Wins` : "Tied", Boolean(game.winner));
        }
      });
    });

    newGame.addEventListener("click", () => {
      hideResult();
      game.reset();
      render();
    });

    render();
  });
}

if (typeof module !== "undefined") {
  module.exports = { TicTacToe, WINNING_LINES };
}
