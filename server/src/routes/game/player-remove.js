const GamesRepository = require("../../models/games-repository");
const validateData = require("../../services/validation-service");
const {playerRemove: schema} = require("../../data-validations/game/validation-schemas");
const {PostResponseHandler} = require("../../services/response-handler");
const Routes = require("../../../../shared/constants/routes.json");
const GameErrors = require("../../errors/game/game-errors");
const {transformCurrentPlayerData} = require("../../services/game-service");
const games = new GamesRepository();

class RemoveGamePlayer extends PostResponseHandler {
    constructor(expressApp, io) {
        super(expressApp, Routes.Game.PLAYER_REMOVE, "remove");
        this.io = io;
    }

    async remove(req) {
        const validData = await validateData(req.body, schema);
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
        let isPlayerInGame = game.playerList.find((player) =>
            player.userId === userId
        );
        if (!isPlayerInGame) {
            throw new GameErrors.PlayerNotInGame(validData);
        }
        //validation of playerList
        const isPossibleToRemove = !!(game.playerList.length > 1);
        if (isPossibleToRemove) {
            const newPlayers = this.#removePlayer(game, userId);
            if (newPlayers) {
                try {
                    const updatedGame = await games.updateGame(game.id, {...newPlayers, sys: game.sys});
                    transformCurrentPlayerData(updatedGame, userId);
                    this.io.to(gameCode).emit("playerRemoved", {
                        gameCode,
                        playerList: updatedGame.playerList,
                    });
                    return {...updatedGame, success: true};
                } catch (error) {
                    console.error("Failed to remove player:", error);
                    throw new GameErrors.FailedToRemovePlayer(error);
                }
            }
        } else {
            const newGame = await games.updateGame(game.id, {code: `${game.code}-#closed#`, state: "closed", sys: game.sys});
            //await game.deleteGame(game.id); //TODO na základě ještě nějaké podmínky
            return {...newGame, success: true};
        }

    }

    #removePlayer(game, userId) {
        let newPlayers;
        const copiedGame = JSON.parse(JSON.stringify(game));
        const userToRemove = copiedGame.playerList.findIndex(player => player.userId === userId);
        if (userToRemove !== -1) {
            const isPlayerCreator = copiedGame.playerList[userToRemove].creator;
            copiedGame.playerList.splice(userToRemove, 1);
            newPlayers = {
                playerList: [...copiedGame.playerList],
            }
            if (isPlayerCreator) {
                newPlayers.playerList[0].creator = true;
            }
        }
        return newPlayers;
    }
}

module.exports = RemoveGamePlayer;
