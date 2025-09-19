const {
  AuthenticatedPostResponseHandler,
} = require("../../services/response-handler");
const Routes = require("../../../../shared/constants/routes.json");
const {
  close: schema,
} = require("../../input-validation-schemas/game/validation-schemas");
const GameErrors = require("../../errors/game/game-errors");
const { closeGame } = require("../../services/game-service");
const {
  validateAndAuthorizeForGame,
} = require("../../services/validation-service");

class CloseGame extends AuthenticatedPostResponseHandler {
  constructor(expressApp) {
    super(expressApp, Routes.Game.CLOSE, "close");
  }

  async close(req) {
    const { game } = await validateAndAuthorizeForGame(
      req,
      schema,
      GameErrors.UserIsNotAllowedToCloseGame,
    );
    //updates state of the game if exists
    const closedGame = await closeGame(game);
    return { ...closedGame };
  }
}

module.exports = CloseGame;
