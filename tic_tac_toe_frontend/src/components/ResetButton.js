import React from "react";

// PUBLIC_INTERFACE
function ResetButton({ onReset, gameOver }) {
  /**
   * Button to reset the Tic Tac Toe game.
   * @param {Function} onReset
   * @param {boolean} gameOver
   */
  return (
    <button className="ttt-reset-btn" type="button" onClick={onReset}>
      {gameOver ? "Restart Game" : "Reset"}
    </button>
  );
}

export default ResetButton;
