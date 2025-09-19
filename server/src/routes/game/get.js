const { validateAndGetUser } = require("../../services/validation-service");
const {
  get: schema,
} = require("../../input-validation-schemas/game/validation-schemas");
const {
  AuthenticatedGetResponseHandler,
} = require("../../services/response-handler");
const Routes = require("../../../../shared/constants/routes.json");
const {
  transformCurrentPlayerData,
  getGameWithWarning,
} = require("../../services/game-service");

class GetGame extends AuthenticatedGetResponseHandler {
  constructor(expressApp) {
    super(expressApp, Routes.Game.GET, "get");
  }

  async get(req) {
    const { user, validData } = await validateAndGetUser(req, schema);

    const game = await getGameWithWarning(validData);

    if (game && !game.warning) {
      transformCurrentPlayerData(game, user.id);
      return { ...game };
    }

    return { success: false, ...game };
  }
}

module.exports = GetGame;
