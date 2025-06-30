import React from "react";

// PUBLIC_INTERFACE
function Cell({ value, onClick, disabled }) {
  /**
   * Single cell of the Tic Tac Toe board.
   * @param {string|null} value "X", "O" or null.
   * @param {Function} onClick Cell click handler.
   * @param {boolean} disabled Is cell clickable.
   */
  return (
    <button
      className="ttt-cell"
      onClick={onClick}
      disabled={disabled}
      type="button"
      aria-label={`Cell: ${value || "empty"}`}
    >
      {value}
    </button>
  );
}

export default Cell;
