const GamesRepository = require("../../models/games-repository");
const validateData = require("../../services/validation-service");
const {list: schema} = require("../../data-validations/game/validation-schemas");
const {GetResponseHandler} = require("../../services/response-handler");
const Routes = require("../../../../shared/constants/routes.json");
const GameErrors = require("../../errors/game/game-errors");
const {authorizeUser} = require("../../services/auth-service");
const games = new GamesRepository();

class ListGame extends GetResponseHandler {
    constructor(expressApp) {
        super(expressApp, Routes.Game.LIST, "list");
    }

    async list(req) {
        const validData = validateData(req.query, schema);
        const {state, pageInfo} = validData;
        await authorizeUser(req.user.id, GameErrors.UserDoesNotExist, GameErrors.UserNotAuthorized, ["admin"]);

        let gameList;

        if (state) {
            gameList = await games.listGameByState(state, pageInfo);
        } else {
            gameList = await games.listGame(pageInfo);
        }

        return {...gameList, success: true};
    }
}

module.exports = ListGame;
