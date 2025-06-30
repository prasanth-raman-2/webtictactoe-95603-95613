import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import Board from "./components/Board";
import ScorePanel from "./components/ScorePanel";
import Controls from "./components/Controls";
import ResetButton from "./components/ResetButton";
import { subscribeGame, unsubscribeGame, sendMove } from "./realtime";

// Utility to create an empty 3x3 board
const emptyBoard = () => [
  [null, null, null],
  [null, null, null],
  [null, null, null],
];

// Winner/draw stub
function getGameStatus(board) {
  // TODO: Implement winner detection
  return {
    winner: null,
    isFull: !board.flat().includes(null),
  };
}

/**
 * Returns a shallow-equality test for board state arrays.
 */
function isSameBoard(a, b) {
  return a.flat().join("") === b.flat().join("");
}

// PUBLIC_INTERFACE
function App() {
  /**
   * Core Tic Tac Toe App
   * - Provides game state and layout.
   * - Handles theme, board, score, and controls.
   * - Handles game session ID and session switching.
   */
  const [theme, setTheme] = useState('light');
  const [board, setBoard] = useState(emptyBoard());
  const [currentPlayer, setCurrentPlayer] = useState("X");
  const [mode, setMode] = useState("pvp"); // "pvp" or "pvc"
  const [scores, setScores] = useState({ X: 0, O: 0 });
  const [gameOver, setGameOver] = useState(false);

  // Session and joining/creating game state
  const [gameId, setGameId] = useState("");
  const [pendingJoinId, setPendingJoinId] = useState(""); // for join input field

  // Track latest refs for real-time sync
  const boardRef = useRef();
  const currentPlayerRef = useRef();
  boardRef.current = board;
  currentPlayerRef.current = currentPlayer;

  // Subscribe/unsubscribe realtime
  useEffect(() => {
    if (!gameId) return;
    // Handler for incoming real-time move updates
    function onRealtimeMsg(msg) {
      // Accept { type: 'move', board, currentPlayer }
      if (msg.type === "move" && Array.isArray(msg.board)) {
        if (!isSameBoard(msg.board, boardRef.current)) {
          setBoard(msg.board);
          setCurrentPlayer(msg.currentPlayer === "X" ? "X" : "O");
        }
      }
      // Implement handling of reset/gameOver updates if implemented backend
    }
    subscribeGame(gameId, onRealtimeMsg);
    return () => unsubscribeGame(gameId);
  }, [gameId]);

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

    // Try to send move to backend (if in a session)
    if (gameId) {
      sendMove(gameId, {
        type: "move",
        player: currentPlayer,
        position: [i, j],
        board: updated,
        currentPlayer: currentPlayer === "X" ? "O" : "X"
      });
    }
    setCurrentPlayer((prev) => (prev === "X" ? "O" : "X"));
  };

  // PUBLIC_INTERFACE
  const handleReset = () => {
    setBoard(emptyBoard());
    setGameOver(false);
    setCurrentPlayer("X");

    if (gameId) {
      sendMove(gameId, {
        type: "reset",
        board: emptyBoard(),
        currentPlayer: "X"
      });
    }
  };

  // PUBLIC_INTERFACE
  const handleModeChange = (newMode) => {
    setMode(newMode);
    handleReset();
    setScores({ X: 0, O: 0 });
  };

  // PUBLIC_INTERFACE
  const handleCreateGame = () => {
    // Generate a new short pseudo-random game ID for demo
    const newId =
      Math.random().toString(36).substr(2, 6).toUpperCase();
    setGameId(newId);
    setBoard(emptyBoard());
    setScores({ X: 0, O: 0 });
    setGameOver(false);
    setCurrentPlayer("X");
  };

  // PUBLIC_INTERFACE
  const handleJoinGame = () => {
    if (pendingJoinId && pendingJoinId.length >= 3) {
      setGameId(pendingJoinId.toUpperCase());
      setBoard(emptyBoard());
      setScores({ X: 0, O: 0 });
      setGameOver(false);
      setCurrentPlayer("X");
    }
  };

  // Determine winner or draw (stub)
  const status = getGameStatus(board);

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
        <h1 className="ttt-title" style={{ color: "#1976d2" }}>Tic Tac ToeEe</h1>
        {gameId && (
          <div style={{
            marginBottom: 10,
            padding: "6px 0",
            fontWeight: 600,
            color: "#1976d2",
            letterSpacing: "1px"
          }}>
            <span>Active Game ID:&nbsp;<span style={{background:'#eee',padding:'1px 7px',borderRadius:'4px',color:'#1976d2'}}>{gameId}</span></span>
          </div>
        )}
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
          gameId={gameId}
          onCreateGame={handleCreateGame}
          pendingJoinId={pendingJoinId}
          setPendingJoinId={setPendingJoinId}
          onJoinGame={handleJoinGame}
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
