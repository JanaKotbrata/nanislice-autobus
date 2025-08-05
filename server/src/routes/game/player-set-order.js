const GamesRepository = require("../../models/games-repository");
const validateData = require("../../services/validation-service");
const {playerSetOrder:schema} = require("../../data-validations/game/validation-schemas");
const { PostResponseHandler} = require("../../services/response-handler");
const Routes = require("../../../../shared/constants/routes.json");
const GameErrors = require("../../errors/game/game-errors");
const {transformCurrentPlayerData} = require("../../services/game-service");
const {States} = require("../../utils/game-constants");
const {authorizeUser} = require("../../services/auth-service");
const {getGame} = require("../../services/game-service");
const games = new GamesRepository();

class SetOrderPlayer extends PostResponseHandler {
    constructor(expressApp, io) {
        super(expressApp, Routes.Game.PLAYER_SET_ORDER, "setOrder");
        this.io = io;
    }

    async setOrder(req) {
        const validData = validateData(req.body, schema);
        const {playerList, gameCode, gameId} = validData;
        const userId = req.user.id;
        await authorizeUser(userId, GameErrors.UserDoesNotExist, GameErrors.UserNotAuthorized);

        let game = await getGame(gameId, gameCode, GameErrors.GameDoesNotExist);

        if(game.state === States.ACTIVE){
            throw new GameErrors.GameAlreadyActive(validData);
        }

        //validation of playerList
        this.validatePlayerList(game.playerList, playerList);
        const isPlayerInGame = game.playerList.find((player) =>
            player.userId === userId
        );
        if (!isPlayerInGame) {
            throw new GameErrors.PlayerNotInGame(validData);
        }
        if(!isPlayerInGame.creator){
            throw new GameErrors.UserCanNotSetPlayers(validData);
        }

        try {
            const updatedGame = await games.updateGame(game.id, {playerList, sys: game.sys});
            updatedGame.playerList.forEach(player => {
                const playerId = player.userId;
                const playerGame = structuredClone(updatedGame);
                transformCurrentPlayerData(playerGame, playerId);
                console.log(`Emitting playerSetOrder event to ${gameCode}_${playerId}`);
                this.io.to(`${gameCode}_${playerId}`).emit("playerSetOrder", playerGame);
            })
            transformCurrentPlayerData(updatedGame,userId)
            return {...updatedGame, success: true};
        } catch (error) {
            console.error("Failed to set players order:", error);
            throw new GameErrors.FailedToSetPlayersOrder(error);
        }
    }
    validatePlayerList(originalPlayerList, inputtedPlayerList){
            if (originalPlayerList.length !== inputtedPlayerList.length){
                throw new GameErrors.InvalidPlayerList(inputtedPlayerList);
            }

            const serialize = obj => JSON.stringify(Object.fromEntries(Object.entries(obj).sort()));

            const normalizedArr1 = originalPlayerList.map(serialize);
            const normalizedArr2 = inputtedPlayerList.map(serialize);

            normalizedArr1.sort();
            normalizedArr2.sort();

            for (let i = 0; i < normalizedArr1.length; i++) {
                if(!normalizedArr2[i].myself) {
                    if (normalizedArr1[i] !== normalizedArr2[i]) {
                        throw new GameErrors.InvalidPlayerList(inputtedPlayerList);
                    }
                }
            }
    }
}
module.exports = SetOrderPlayer;
