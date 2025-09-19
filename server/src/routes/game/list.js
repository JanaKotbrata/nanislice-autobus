const GamesRepository = require("../../models/games-repository");
const { validateAndGetUser } = require("../../services/validation-service");
const {
  list: schema,
} = require("../../input-validation-schemas/game/validation-schemas");
const {
  AuthenticatedGetResponseHandler,
} = require("../../services/response-handler");
const Routes = require("../../../../shared/constants/routes.json");
const { Roles } = require("../../../../shared/constants/game-constants");
const games = new GamesRepository();

class ListGame extends AuthenticatedGetResponseHandler {
  constructor(expressApp) {
    super(expressApp, Routes.Game.LIST, "list");
  }

  async list(req) {
    const { validData } = await validateAndGetUser(req, schema, [Roles.ADMIN]);
    const { state, pageInfo } = validData;

    let gameList;
    if (state) {
      gameList = await games.listByState(state, pageInfo);
    } else {
      gameList = await games.list(pageInfo);
    }

    return { ...gameList };
  }
}

module.exports = ListGame;
