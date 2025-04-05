const GamesRepository = require("../../models/games-repository");
const {PostResponseHandler} = require("../../services/response-handler");
const Routes = require("../../../../shared/constants/routes");
const {close: schema} = require("../../data-validations/game/validation-schemas");
const validateData = require("../../services/validation-service");
const GameErrors = require("../../errors/game/game-errors");

const games = new GamesRepository();
class CloseGame extends PostResponseHandler {
    constructor(expressApp) {
        super(expressApp, Routes.Games.CLOSE, "close");
    }

    async close(req) {
        const validData = validateData(req.body, schema);
        const {gameCode} = validData;

        //tries to get the game by code
        const game = await games.getGameByCode(gameCode);
        if (!game) {
            throw new GameErrors.GameDoesNotExistError(validData);
        }

        //updates state of the game if exists
        try {
            const updatedGame = await games.updateGame(game.id, {code: `${game.code}-#closed#`, status: "closed"});
            return {...updatedGame, success: true};
        } catch (e) {
            console.error("Failed to set state of the game:", e);
            throw new GameErrors.UpdateGameFailed(validData);
        }
    }
}
module.exports = CloseGame;
