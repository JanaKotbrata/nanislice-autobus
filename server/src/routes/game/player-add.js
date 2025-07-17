const GamesRepository = require("../../models/games-repository");
const validateData = require("../../services/validation-service");
const {playerAdd:schema} = require("../../data-validations/game/validation-schemas");
const { PostResponseHandler} = require("../../services/response-handler");
const Routes = require("../../../../shared/constants/routes.json");
const GameErrors = require("../../errors/game/game-errors");
const {transformCurrentPlayerData} = require("../../services/game-service");
const {States} = require("../../utils/game-constants");
const {authorizeUser} = require("../../services/auth-service");
const games = new GamesRepository();

class AddGamePlayer extends PostResponseHandler {
    constructor(expressApp, io) {
        super(expressApp, Routes.Game.PLAYER_ADD, "add");
        this.io = io;
    }

    async add(req) {
        const validData = validateData(req.body, schema);
        const {userId, gameCode, gameId} = validData;
        const user = await authorizeUser(userId, GameErrors.UserDoesNotExist, GameErrors.UserNotAuthorized);

        let game;

        if (gameId) {
            game = await games.getGameById(gameId);
        } else {
            game = await games.getGameByCode(gameCode);
        }

        if (!game) {
            throw new GameErrors.GameDoesNotExist(validData);
        }

        if(game.state === States.ACTIVE){
            throw new GameErrors.GameAlreadyActive(validData);
        }

        //validation of playerList
        const isPlayerInGame = game.playerList.find((player) =>
            player.userId === userId
        );
        if (isPlayerInGame) {
            throw new GameErrors.PlayerAlreadyInGame(validData);
        }

        const newPlayers = {
            playerList: [...game.playerList, {userId, name: user.name, creator: false, rev: user.sys.rev }],
        };
        try {
            const updatedGame = await games.updateGame(game.id, {...newPlayers, sys: game.sys});
            updatedGame.playerList.forEach(player => {
                const playerId = player.userId;
                const playerGame = structuredClone(updatedGame);
                transformCurrentPlayerData(playerGame, playerId);
                console.log(`Emitting playerAdded event to ${gameCode}_${playerId}`);
                this.io.to(`${gameCode}_${playerId}`).emit("playerAdded", playerGame);
            })
            transformCurrentPlayerData(updatedGame,userId)
            return {...updatedGame, success: true};
        } catch (error) {
            console.error("Failed to add player:", error);
            throw new GameErrors.FailedToAddPlayer(error);
        }
    }
}
module.exports = AddGamePlayer;
