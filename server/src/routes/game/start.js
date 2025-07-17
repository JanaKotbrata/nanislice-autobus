const GamesRepository = require("../../models/games-repository");
const UsersRepository = require("../../models/users-repository");
const validateData = require("../../services/validation-service");
const {startGame: schema} = require("../../data-validations/game/validation-schemas");
const {PostResponseHandler} = require("../../services/response-handler");
const Routes = require("../../../../shared/constants/routes.json");
const GameErrors = require("../../errors/game/game-errors");
const {initDeck, dealCardPerPlayer} = require("../../services/card-service");
const {transformCurrentPlayerData} = require("../../services/game-service");
const {authorizeUser} = require("../../services/auth-service");

const games = new GamesRepository();
const users = new UsersRepository();

class StartGame extends PostResponseHandler {
    constructor(expressApp, io) {
        super(expressApp, Routes.Game.START, "start");
        this.io = io;
    }

    async start(req) {
        const validData = validateData(req.body, schema);
        const {gameCode, gameId} = validData;
        const userId = req.user.id;
        let game;

        await authorizeUser(userId, GameErrors.UserDoesNotExist, GameErrors.UserNotAuthorized);

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
        const player = game.playerList.find(player => player.userId === userId);
        if (!player?.creator) {
            throw new GameErrors.UserCanNotStartGame({...validData, userId});
        }
        const fullDeck = initDeck(game.playerList);
        const [deck, playerList] = dealCardPerPlayer(fullDeck, game.playerList);
        let newGame = {...game, state: "active", deck, playerList, currentPlayer: 0}
        try {
            const startedGame = await games.updateGame(game.id, newGame);
            startedGame.playerList.forEach(player => {
                const playerId = player.userId;
                const playerGame = structuredClone(startedGame);
                transformCurrentPlayerData(playerGame, playerId);
                this.io.to(`${gameCode}_${playerId}`).emit("gameStarted", {
                    ...playerGame
                });
            })
            transformCurrentPlayerData(startedGame, userId);
            return {...startedGame, success: true};
        } catch (e) {
            throw new GameErrors.UpdateGameFailed(validData);
        }
    }

}


module.exports = StartGame;
