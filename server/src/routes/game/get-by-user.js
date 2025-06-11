const {GetResponseHandler} = require("../../services/response-handler");
const Routes = require("../../../../shared/constants/routes.json");
const {transformCurrentPlayerData, getGame} = require("../../services/game-service");
const {States} = require("../../utils/game-constants");
const GameErrors = require("../../errors/game/game-errors");
const GamesRepository = require("../../models/games-repository");
const UsersRepository = require("../../models/users-repository");
const games = new GamesRepository();
const users = new UsersRepository();


class GetGameByUser extends GetResponseHandler {
    constructor(expressApp) {
        super(expressApp, Routes.Game.GET_BY_USER, "getByUser");
    }

    async getByUser(req) {
        const userId = req.user.id;

        const user = await users.getUserById(userId); //Does it make a sense? If this come from client?
        if (!user) {
            throw new GameErrors.UserDoesNotExist(user);
        }

        const game = await games.findNotClosedGameByUserId(userId); //does it need try catch?

        if (game) {
            transformCurrentPlayerData(game, req.user.id);

            return {...game, success: true};
        }
    }
}

module.exports = GetGameByUser;
