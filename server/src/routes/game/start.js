const GamesRepository = require("../../models/games-repository");
const validateData = require("../../services/validation-service");
const {startGame: schema} = require("../../data-validations/game/validation-schemas");
const {PostResponseHandler} = require("../../services/response-handler");
const Routes = require("../../../../shared/constants/routes.json");
const GameErrors = require("../../errors/game/game-errors");
const games = new GamesRepository();
const {initDeck, dealCardPerPlayer} = require("../../services/card-service");

class StartGame extends PostResponseHandler {
    constructor(expressApp) {
        super(expressApp, Routes.Game.START, "start");
    }

    async start(req) {
        const validData = validateData(req.body, schema);
        const {gameCode, gameId} = validData;
        let game;

        if (gameId) {
            game = await games.getGameById(gameId);
        } else {
            game = await games.getGameByCode(gameCode);
        }
        if (!game) {
            throw new GameErrors.GameDoesNotExist(validData);
        }
        if (game.state === "active") {
            return {...game, success: true};
        }
        if (game.state === "closed") {
            throw new GameErrors.GameIsClosed(validData);
        }
        const fullDeck = initDeck(game.playerList);
        const [deck, playerList] = dealCardPerPlayer(fullDeck, game.playerList);
        let newGame = {...game, state: "active", deck, playerList, currentPlayer: 0} //TODO maybe random number between 0 and playerList.length
        try {
            const startedGame = await games.updateGame(game.id, newGame);
            return {...startedGame, success: true};
        } catch (e) {
            throw new GameErrors.UpdateGameFailed(validData);
        }
    }

}


module.exports = StartGame;
