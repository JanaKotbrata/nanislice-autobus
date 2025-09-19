const { transformCurrentPlayerData } = require("./game-service");

/**
 * Service for emitting game events to players and spectators via WebSocket (socket.io).
 * @class
 */
class WebSocketService {
  constructor(io) {
    this.io = io;
  }

  emitToPlayer(gameCode, playerId, event, data) {
    this.io.to(`${gameCode}_${playerId}`).emit(event, data);
  }

  emitToPlayers(game, event, dataFn) {
    const { playerList, code: gameCode } = game;
    playerList.forEach((player) => {
      const playerId = player.userId;
      const playerGame = structuredClone(game);
      transformCurrentPlayerData(playerGame, playerId);
      const data =
        typeof dataFn === "function"
          ? dataFn(playerId, playerGame)
          : playerGame;
      this.emitToPlayer(gameCode, playerId, event, data);
    });
  }

  emitToSpectators(gameCode, event, data) {
    this.io.to(`spectate_${gameCode}`).emit(event, data);
  }

  emitPlayerAdded(game) {
    this.emitToPlayers(game, "playerAdded");
  }

  emitPlayerRemoved(game) {
    this.emitToPlayers(game, "playerRemoved");
  }

  emitPlayerSetOrder(game) {
    this.emitToPlayers(game, "playerSetOrder");
  }

  emitRematch(oldGameCode, playerList, newGameCode) {
    playerList.forEach((player) => {
      const playerId = player.userId;
      this.emitToPlayer(oldGameCode, playerId, "rematch", () => ({
        gameCode: newGameCode,
      }));
    });
  }

  emitProcessAction(game, extraPayloadFn) {
    this.emitToPlayers(game, "processAction", (playerId, playerGame) => {
      const extra = extraPayloadFn ? extraPayloadFn(playerId) : {};
      return {
        userId: playerId,
        newGame: playerGame,
        ...extra,
      };
    });
  }

  emitGameStarted(game) {
    this.emitToPlayers(game, "gameStarted");
  }
}

module.exports = WebSocketService;
