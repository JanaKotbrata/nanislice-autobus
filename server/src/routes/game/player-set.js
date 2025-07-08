const GamesRepository = require("../../models/games-repository");
const UsersRepository = require("../../models/users-repository");
const validateData = require("../../services/validation-service");
const {playerSet:schema} = require("../../data-validations/game/validation-schemas");
const { PostResponseHandler} = require("../../services/response-handler");
const Routes = require("../../../../shared/constants/routes.json");
const GameErrors = require("../../errors/game/game-errors");
const {transformCurrentPlayerData} = require("../../services/game-service");
const {States} = require("../../utils/game-constants");
const games = new GamesRepository();
const users = new UsersRepository();

class SetGamePlayer extends PostResponseHandler {
    constructor(expressApp, io) {
        super(expressApp, Routes.Game.PLAYER_SET, "set");
        this.io = io;
    }

    async set(req) {
        const validData = validateData(req.body, schema);
        const {userId, gameCode, gameId} = validData;

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

        const user = await users.getUserById(userId);
        if (!user) {
            throw new GameErrors.UserDoesNotExist(validData);
        }

        //validation of playerList
        const playerIndex = game.playerList.findIndex((player) =>
            player.userId === userId
        );
        if (playerIndex === -1) {
            throw new GameErrors.PlayerNotInGame(validData);
        }
        let newPlayerList = structuredClone(game.playerList);
        newPlayerList[playerIndex].ready = validData.ready;
        try {
            const updatedGame = await games.updateGame(game.id, {playerList:newPlayerList, sys: game.sys});
            updatedGame.playerList.forEach(player => {
                const playerId = player.userId;
                const playerGame = structuredClone(updatedGame);
                transformCurrentPlayerData(playerGame, playerId);
                console.log(`Emitting playerAdded event to ${gameCode}_${playerId}`);
                this.io.to(`${gameCode}_${playerId}`).emit("playerAdded", playerGame);
            })
            transformCurrentPlayerData(updatedGame, userId);
            return {...updatedGame, success: true};
        } catch (error) {
            console.error("Failed to add player:", error);
            throw new GameErrors.FailedToSetPlayer(error);
        }
    }
}
module.exports = SetGamePlayer;
