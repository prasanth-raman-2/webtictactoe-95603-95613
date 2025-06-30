import React from "react";

// PUBLIC_INTERFACE
function ScorePanel({ scores, mode }) {
  /**
   * ScorePanel displays current scores for both players.
   * @param {{X: number, O: number}} scores - Current score object.
   * @param {'pvp'|'pvc'} mode - Game mode.
   */
  return (
    <div className="ttt-score-panel">
      <span className="score-x">
        {mode === "pvc" ? "You" : "X"}: <b>{scores.X}</b>
      </span>
      <span className="score-o">
        {mode === "pvc" ? "Computer" : "O"}: <b>{scores.O}</b>
      </span>
    </div>
  );
}

export default ScorePanel;
