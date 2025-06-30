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

// Returns winner ("X" or "O") or null plus draw check
function getGameStatus(board) {
  // Rows, columns, diagonals
  const lines = [
    // Rows
    [ [0,0], [0,1], [0,2] ],
    [ [1,0], [1,1], [1,2] ],
    [ [2,0], [2,1], [2,2] ],
    // Columns
    [ [0,0], [1,0], [2,0] ],
    [ [0,1], [1,1], [2,1] ],
    [ [0,2], [1,2], [2,2] ],
    // Diagonals
    [ [0,0], [1,1], [2,2] ],
    [ [0,2], [1,1], [2,0] ],
  ];
  for (const [[a1, a2], [b1, b2], [c1, c2]] of lines) {
    const val = board[a1][a2];
    if (val && val === board[b1][b2] && val === board[c1][c2])
      return { winner: val, isFull: !board.flat().includes(null) };
  }
  return { winner: null, isFull: !board.flat().includes(null) };
}

/**
 * Returns a shallow-equality test for board state arrays.
 */
function isSameBoard(a, b) {
  return a.flat().join("") === b.flat().join("");
}

// --- Simple AI for Tic Tac Toe (random valid move; replace with smarter AI if desired)
function aiMove(board) {
  // Find all empty cells
  const empties = [];
  for(let i=0;i<3;i++) for(let j=0;j<3;j++)
    if(!board[i][j]) empties.push([i,j]);
  if (empties.length === 0) return null;
  // Randomly pick an empty cell
  return empties[Math.floor(Math.random()*empties.length)];
}

// PUBLIC_INTERFACE
function App() {
  /**
   * Core Tic Tac Toe App with real-time and local AI support.
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

  // Track latest refs for real-time sync and AI
  const boardRef = useRef();
  const currentPlayerRef = useRef();
  const modeRef = useRef();
  boardRef.current = board;
  currentPlayerRef.current = currentPlayer;
  modeRef.current = mode;

  // Subscribe/unsubscribe realtime for PvP only
  useEffect(() => {
    if (!gameId || mode !== "pvp") return;
    // Handler for incoming real-time move updates
    function onRealtimeMsg(msg) {
      // Accept { type: 'move', board, currentPlayer }
      if (msg.type === "move" && Array.isArray(msg.board)) {
        if (!isSameBoard(msg.board, boardRef.current)) {
          setBoard(msg.board);
          setCurrentPlayer(msg.currentPlayer === "X" ? "X" : "O");
        }
      }
      // Handle resets or gameOver here if needed from backend
    }
    subscribeGame(gameId, onRealtimeMsg);
    return () => unsubscribeGame(gameId);
  }, [gameId, mode]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Watch for game win/draw
  useEffect(() => {
    const { winner, isFull } = getGameStatus(board);
    if (winner) {
      setGameOver(true);
      setScores((prev) => ({ ...prev, [winner]: prev[winner] + 1 }));
    } else if (isFull) {
      setGameOver(true);
    }
  // eslint-disable-next-line
  }, [board]);

  // AI MOVE LOGIC — after player makes move in PvC mode, if not gameOver and AI's turn, AI moves
  useEffect(() => {
    if (mode !== "pvc" || gameOver || (currentPlayer !== "O")) return;
    // (AI is always "O" in this implementation)
    // Delay AI move for 400ms for natural feel
    const timer = setTimeout(() => {
      const aiNext = aiMove(boardRef.current);
      if (aiNext) {
        handleCellClick(aiNext[0], aiNext[1], true);
      }
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line
  }, [board, currentPlayer, mode, gameOver]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  // PUBLIC_INTERFACE
  // Extra arg "isAI" for internal calls -- disables switch turns during AI step
  const handleCellClick = (i, j, isAI = false) => {
    if (board[i][j] || gameOver) return;
    // Only allow moves for correct player in PvC
    if (mode === "pvc" && ((currentPlayer === "X" && isAI) || (currentPlayer === "O" && !isAI)))
      return;
    // For PvP: allow moves for either player (real-time disables moves by wrong local player)
    const updated = board.map(row => [...row]);
    updated[i][j] = currentPlayer;
    setBoard(updated);

    if (mode === "pvp" && gameId) {
      sendMove(gameId, {
        type: "move",
        player: currentPlayer,
        position: [i, j],
        board: updated,
        currentPlayer: currentPlayer === "X" ? "O" : "X"
      });
    }
    // "O" is always AI; after AI move do NOT switch turn (AI effect hook watches board/currentPlayer)
    setCurrentPlayer((prev) => (prev === "X" ? "O" : "X"));
  };

  // PUBLIC_INTERFACE
  const handleReset = () => {
    setBoard(emptyBoard());
    setGameOver(false);
    setCurrentPlayer("X");

    if (mode === "pvp" && gameId) {
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
    setGameId(""); // Exits any PvP session when changing mode
    handleReset();
    setScores({ X: 0, O: 0 });
  };

  // PUBLIC_INTERFACE
  const handleCreateGame = () => {
    // Generate a new short pseudo-random game ID for demo
    const newId =
      Math.random().toString(36).substr(2, 6).toUpperCase();
    setGameId(newId);
    setMode("pvp");
    setBoard(emptyBoard());
    setScores({ X: 0, O: 0 });
    setGameOver(false);
    setCurrentPlayer("X");
  };

  // PUBLIC_INTERFACE
  const handleJoinGame = () => {
    if (pendingJoinId && pendingJoinId.length >= 3) {
      setGameId(pendingJoinId.toUpperCase());
      setMode("pvp");
      setBoard(emptyBoard());
      setScores({ X: 0, O: 0 });
      setGameOver(false);
      setCurrentPlayer("X");
    }
  };

  // Determine winner or draw (real implementation used above): adds winner/draw displays for "Game Over"
  const status = getGameStatus(board);

  let resultMsg = null;
  if (gameOver && status.winner) {
    if (mode === "pvc") {
      resultMsg = status.winner === "O" ? "You lost! 😢" : "You win! 🎉";
    } else {
      resultMsg = `Winner: ${status.winner}`;
    }
  } else if (gameOver && status.isFull) {
    resultMsg = "Draw";
  }

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
        {gameId && mode === "pvp" && (
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
        {resultMsg && <div style={{
          color: status.winner === "O" ? "#ef5350" : "#41E879",
          fontWeight: "bold",
          fontSize: "1.15rem",
          marginBottom: 6,
          letterSpacing: "1px"
        }}>{resultMsg}</div>}
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
