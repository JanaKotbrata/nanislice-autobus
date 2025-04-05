const GamesRepository = require("../../models/games-repository");
const validateData = require("../../services/validation-service");
const {gDelete:schema} = require("../../data-validations/game/validation-schemas");
const { PostResponseHandler} = require("../../services/response-handler");
const Routes = require("../../../../shared/constants/routes");
const GameErrors = require("../../errors/game/game-errors");
const games = new GamesRepository();

class DeleteGame extends PostResponseHandler {
    constructor(expressApp) {
        super(expressApp, Routes.Games.DELETE, "delete");
    }

    async delete(req) {
        const validData = validateData(req.body, schema);
        const {id, code} = validData;

        let game;

        if (id) {
            game = await games.getGameById(id);
        } else {
            game = await games.getGameByCode(code);
        }

        if (!game) {
            return new GameErrors.GameDoesNotExistError(validData);
        }
        try {
            await games.deleteGame(game.id);
            return {id: game.id, success: true};
        } catch (e) {
            console.error("Failed to delete game:", e);
            return new GameErrors.FailedToDeleteGame(e);
        }
    }
}

module.exports = DeleteGame;
