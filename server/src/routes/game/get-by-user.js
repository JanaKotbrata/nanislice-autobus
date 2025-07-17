const {GetResponseHandler} = require("../../services/response-handler");
const Routes = require("../../../../shared/constants/routes.json");
const {transformCurrentPlayerData, getGame} = require("../../services/game-service");
const GameErrors = require("../../errors/game/game-errors");
const GamesRepository = require("../../models/games-repository");
const {authorizeUser} = require("../../services/auth-service");
const games = new GamesRepository();


class GetGameByUser extends GetResponseHandler {
    constructor(expressApp) {
        super(expressApp, Routes.Game.GET_BY_USER, "getByUser");
    }

    async getByUser(req) {
        const userId = req.user.id;

        await authorizeUser(userId, GameErrors.UserDoesNotExist, GameErrors.UserNotAuthorized);


        const game = await games.findNotClosedGameByUserId(userId); //does it need try catch?

        if (game) {
            transformCurrentPlayerData(game, req.user.id);

            return {...game, success: true};
        }
    }
}

module.exports = GetGameByUser;
