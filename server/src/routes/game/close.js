const GamesRepository = require("../../models/games-repository");
const {PostResponseHandler} = require("../../services/response-handler");
const Routes = require("../../../../shared/constants/routes.json");
const {close: schema} = require("../../data-validations/game/validation-schemas");
const validateData = require("../../services/validation-service");
const GameErrors = require("../../errors/game/game-errors");
const {closeGame, getGame} = require("../../services/game-service");
const {authorizeUser, authorizePlayer} = require("../../services/auth-service");

const games = new GamesRepository();

class CloseGame extends PostResponseHandler {
    constructor(expressApp) {
        super(expressApp, Routes.Game.CLOSE, "close");
    }

    async close(req) {
        const validData = validateData(req.body, schema);
        const {gameId, gameCode} = validData;

        const user = await authorizeUser(req.user.id, GameErrors.UserDoesNotExist, GameErrors.UserNotAuthorized);

        const game= await getGame(gameId, gameCode, GameErrors.GameDoesNotExist);
        await authorizePlayer(user, game, GameErrors.UserIsNotAllowedToCloseGame);

        //updates state of the game if exists
        const closedGame = await closeGame(game);
        return {...closedGame, success: true}

    }
}

module.exports = CloseGame;
