import React from "react";

// PUBLIC_INTERFACE
function Controls({
  mode, onModeChange, currentPlayer, gameOver,
  gameId,
  onCreateGame,
  pendingJoinId,
  setPendingJoinId,
  onJoinGame,
}) {
  /**
   * Controls for game mode, game session creation/join, and current player display.
   * @param {'pvp'|'pvc'} mode
   * @param {Function} onModeChange
   * @param {'X'|'O'} currentPlayer
   * @param {boolean} gameOver
   * @param {string} gameId
   * @param {Function} onCreateGame
   * @param {string} pendingJoinId
   * @param {Function} setPendingJoinId
   * @param {Function} onJoinGame
   */
  return (
    <div className="ttt-controls">
      <div className="mode-switch">
        <button
          className={mode === "pvp" ? "active" : ""}
          onClick={() => onModeChange("pvp")}
          disabled={gameOver}
        >
          Player vs Player
        </button>
        <button
          className={mode === "pvc" ? "active" : ""}
          onClick={() => onModeChange("pvc")}
          disabled={gameOver}
        >
          Player vs Computer
        </button>
      </div>
      <div style={{
        margin: "12px 0 8px 0",
        padding: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
      }}>
        <button
          type="button"
          style={{
            background: "#1976d2",
            color: "#fff",
            border: "none",
            borderRadius: 5,
            padding: "7px 28px",
            fontWeight: 600,
            letterSpacing: 1,
            cursor: "pointer",
            marginBottom: 7,
            marginTop: 0,
            fontSize: "1rem",
            opacity: 0.92,
            transition: "background 0.16s",
          }}
          onClick={onCreateGame}
          tabIndex={0}
        >
          + Create New Game
        </button>
        <form
          style={{ display: "flex", gap: 7, alignItems: "center" }}
          onSubmit={e => {
            e.preventDefault();
            onJoinGame();
          }}
          autoComplete="off"
        >
          <input
            type="text"
            placeholder="Game ID"
            style={{
              padding: "8px 10px",
              borderRadius: 4,
              border: "1px solid #b6c3d3",
              fontSize: 15,
              width: 95,
              fontWeight: 500,
              letterSpacing: "1.5px",
            }}
            value={pendingJoinId}
            onChange={e => setPendingJoinId(e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 7))}
            maxLength={7}
            aria-label="Enter Game ID to join"
            inputMode="text"
          />
          <button
            style={{
              background: "#ef5350",
              color: "#fff",
              border: "none",
              borderRadius: 5,
              padding: "7px 14px",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: "1rem",
              opacity: pendingJoinId.length >= 3 ? 0.97 : 0.7,
            }}
            type="submit"
            disabled={pendingJoinId.length < 3}
            tabIndex={0}
          >
            Join Game
          </button>
        </form>
      </div>
      <div className="current-turn">
        {gameOver
          ? "Game Over"
          : (
            <>
              Turn: <b>{mode === "pvc" && currentPlayer === "O" ? "Computer" : currentPlayer}</b>
            </>
          )
        }
      </div>
    </div>
  );
}

export default Controls;
