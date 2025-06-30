import React from "react";

// PUBLIC_INTERFACE
function Controls({ mode, onModeChange, currentPlayer, gameOver }) {
  /**
   * Controls for game mode and current player display.
   * @param {'pvp'|'pvc'} mode
   * @param {Function} onModeChange
   * @param {'X'|'O'} currentPlayer
   * @param {boolean} gameOver
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
