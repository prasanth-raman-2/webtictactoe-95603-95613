//
// Minimal WebSocket-based real-time API for Tic Tac Toe multiplayer sync.
// Provides subscribe, unsubscribe, and sendMove functions.
//

const WS_BASE_URL =
  (window.location.protocol === "https:"
    ? "wss://"
    : "ws://") + window.location.host + "/ws/game/";

let _sockets = {}; // Map gameId -> WebSocket
let _handlers = {}; // Map gameId -> [(data) => void]

/**
 * PUBLIC_INTERFACE
 * Subscribe to real-time updates for a game.
 * @param {string} gameId
 * @param {(data: Object) => void} handler - Called on every message
 */
export function subscribeGame(gameId, handler) {
  if (!gameId) return;

  if (!_sockets[gameId]) {
    const ws = new window.WebSocket(WS_BASE_URL + gameId);
    _sockets[gameId] = ws;
    _handlers[gameId] = [];
    ws.onmessage = (event) => {
      let data = null;
      try {
        data = JSON.parse(event.data);
      } catch {
        data = { type: "unknown", raw: event.data };
      }
      _handlers[gameId].forEach((h) => h(data));
    };
    ws.onclose = () => {
      // Clean up socket/handlers on close
      delete _sockets[gameId];
      delete _handlers[gameId];
    };
  }
  _handlers[gameId].push(handler);
}

/**
 * PUBLIC_INTERFACE
 * Unsubscribe all real-time updates for a game.
 * @param {string} gameId
 */
export function unsubscribeGame(gameId) {
  if (_sockets[gameId]) {
    _sockets[gameId].close();
    delete _sockets[gameId];
    delete _handlers[gameId];
  }
}

/**
 * PUBLIC_INTERFACE
 * Send a move to the backend for the current game.
 * @param {string} gameId
 * @param {Object} moveData
 */
export function sendMove(gameId, moveData) {
  const ws = _sockets[gameId];
  if (!ws || ws.readyState !== 1) {
    // Not connected yet
    return false;
  }
  ws.send(JSON.stringify(moveData));
  return true;
}
