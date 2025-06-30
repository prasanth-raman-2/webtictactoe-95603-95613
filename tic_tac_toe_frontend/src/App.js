import React, { useState, useEffect } from 'react';
import './App.css';
import Board from "./components/Board";
import ScorePanel from "./components/ScorePanel";
import Controls from "./components/Controls";
import ResetButton from "./components/ResetButton";

// Utility to create an empty 3x3 board
const emptyBoard = () => [
  [null, null, null],
  [null, null, null],
  [null, null, null],
];

// Checks if the board is full or there's a winner (stub, logic to be added)
function getGameStatus(board) {
  // TODO: Implement winner detection
  return {
    winner: null,
    isFull: !board.flat().includes(null),
  };
}

// PUBLIC_INTERFACE
function App() {
  /**
   * Core Tic Tac Toe App
   * - Provides game state and layout.
   * - Handles theme, board, score, and controls.
   */
  const [theme, setTheme] = useState('light');
  const [board, setBoard] = useState(emptyBoard());
  const [currentPlayer, setCurrentPlayer] = useState("X");
  const [mode, setMode] = useState("pvp"); // "pvp" or "pvc"
  const [scores, setScores] = useState({ X: 0, O: 0 });
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  // PUBLIC_INTERFACE
  const handleCellClick = (i, j) => {
    if (board[i][j] || gameOver) return;
    const updated = board.map(row => [...row]);
    updated[i][j] = currentPlayer;
    setBoard(updated);
    // Game status would be recalculated here
    // TODO: Add logic for winner/computer/player turn handling
    setCurrentPlayer((prev) => (prev === "X" ? "O" : "X"));
  };

  // PUBLIC_INTERFACE
  const handleReset = () => {
    setBoard(emptyBoard());
    setGameOver(false);
    setCurrentPlayer("X");
  };

  // PUBLIC_INTERFACE
  const handleModeChange = (newMode) => {
    setMode(newMode);
    handleReset();
    setScores({ X: 0, O: 0 });
  };

  // Determine winner or draw (stub)
  const status = getGameStatus(board);

  // Example: on game over, setGameOver(true);
  // (Stub integration – game logic and AI not included yet)

  return (
    <div className="App">
      <button
        className="theme-toggle"
        onClick={toggleTheme}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
      </button>
      <main className="ttt-main-container">
        <h1 className="ttt-title">Tic Tac Toe</h1>
        <ScorePanel scores={scores} mode={mode} />
        <Board
          board={board}
          onCellClick={handleCellClick}
          gameOver={gameOver}
        />
        <Controls
          mode={mode}
          onModeChange={handleModeChange}
          currentPlayer={currentPlayer}
          gameOver={gameOver}
        />
        <ResetButton onReset={handleReset} gameOver={gameOver} />
      </main>
      <footer className="ttt-footer">
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          React Minimal TicTacToe
        </a>
      </footer>
    </div>
  );
}

export default App;
