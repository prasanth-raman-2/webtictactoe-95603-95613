import React from "react";
import Cell from "./Cell";

// PUBLIC_INTERFACE
function Board({ board, onCellClick, gameOver }) {
  /**
   * Renders the game board grid.
   * @param {Array} board 2D array for board state.
   * @param {Function} onCellClick Callback for cell selection.
   * @param {boolean} gameOver Is the game finished.
   */
  return (
    <div className={`ttt-board${gameOver ? " game-over" : ""}`}>
      {board.map((row, i) =>
        row.map((cell, j) => (
          <Cell
            key={`${i}-${j}`}
            value={cell}
            onClick={() => !gameOver && onCellClick(i, j)}
            disabled={!!cell || gameOver}
          />
        ))
      )}
    </div>
  );
}

export default Board;
