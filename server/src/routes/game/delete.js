const GamesRepository = require("../../models/games-repository");
const validateData = require("../../services/validation-service");
const {gDelete: schema} = require("../../data-validations/game/validation-schemas");
const {PostResponseHandler} = require("../../services/response-handler");
const Routes = require("../../../../shared/constants/routes.json");
const GameErrors = require("../../errors/game/game-errors");
const {authorizeUser, authorizePlayer} = require("../../services/auth-service");
const games = new GamesRepository();

class DeleteGame extends PostResponseHandler {
    constructor(expressApp) {
        super(expressApp, Routes.Game.DELETE, "delete");
    }

    async delete(req) {
        const validData = validateData(req.body, schema);
        const {id, code} = validData;

        const user = await authorizeUser(req.user.id, GameErrors.UserDoesNotExist, GameErrors.UserNotAuthorized);

        let game;
        if (id) {
            game = await games.getGameById(id);
        } else {
            game = await games.getGameByCode(code);
        }

        if (!game) {
            throw new GameErrors.GameDoesNotExist(validData);
        }
        await authorizePlayer(user, game, GameErrors.UserIsNotAllowedToDeleteGame);

        try {
            await games.deleteGame(game.id);
            return {id: game.id, success: true};
        } catch (e) {
            throw new GameErrors.FailedToDeleteGame(e);
        }
    }
}

module.exports = DeleteGame;
