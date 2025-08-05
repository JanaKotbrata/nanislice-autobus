const GamesRepository = require("../../models/games-repository");
const validateData = require("../../services/validation-service");
const {playerRemove: schema} = require("../../data-validations/game/validation-schemas");
const {PostResponseHandler} = require("../../services/response-handler");
const Routes = require("../../../../shared/constants/routes.json");
const GameErrors = require("../../errors/game/game-errors");
const {transformCurrentPlayerData, closeGame, getGame} = require("../../services/game-service");
const {States} = require("../../utils/game-constants");
const {shuffleDeck} = require("../../services/card-service");
const {authorizeUser} = require("../../services/auth-service");
const games = new GamesRepository();

class RemoveGamePlayer extends PostResponseHandler {
    constructor(expressApp, io) {
        super(expressApp, Routes.Game.PLAYER_REMOVE, "remove");
        this.io = io;
    }

    async remove(req) {
        const validData = await validateData(req.body, schema);
        const {userId, gameCode, gameId} = validData;

        const user = await authorizeUser(userId, GameErrors.UserDoesNotExist, GameErrors.UserNotAuthorized);
        if(req.user.id !== userId && user.role !== "admin") {
            throw new GameErrors.UserNotAuthorized(validData);
        }

        let game = await getGame(gameId, gameCode, GameErrors.GameDoesNotExist);

        let isPlayerInGame = game.playerList.find((player) =>
            player.userId === userId
        );
        if (!isPlayerInGame) {
            throw new GameErrors.PlayerNotInGame(validData);
        }

        //validation of playerList
        const minLength = game.state === States.ACTIVE ? 2 : 1;
        const isPossibleToRemove = !!(game.playerList.length > minLength);
        if (isPossibleToRemove) {
            const {newPlayers, newDeck} = this.#removePlayer(game, userId);
            if (newPlayers) {
                let updateData = {...newPlayers, sys: game.sys};
                if (game.state === States.ACTIVE) {
                    updateData = {...updateData, ...newDeck};
                }
                try {
                    const updatedGame = await games.updateGame(game.id, updateData);
                  this.#emit(updatedGame, gameCode, userId);
                    return {...updatedGame, success: true};
                } catch (error) {
                    console.error("Failed to remove player:", error);
                    throw new GameErrors.FailedToRemovePlayer(error);
                }
            }
        } else {
            if (game.state === States.ACTIVE) {
                const newGame = await closeGame(game);
                this.#emit(newGame, gameCode, userId);
                await games.deleteGame(game.id);
                return {...newGame, success: true};
            } else if (game.state === States.INITIAL) {
                await games.deleteGame(game.id);
                return {success: true};
            }
        }

    }

    #removePlayer(game, userId) {
        let newPlayers;
        let newDeck;
        const copiedGame = JSON.parse(JSON.stringify(game));
        const userToRemove = copiedGame.playerList.findIndex(player => player.userId === userId);
        if (userToRemove !== -1) {
            const player = copiedGame.playerList[userToRemove];
            const isPlayerCreator = player.creator;
            if (game.state === States.ACTIVE) {
                newDeck = {deck: shuffleDeck([...game.deck, ...player?.hand, ...player?.busStop?.[0], ...player?.busStop?.[1], ...player?.busStop?.[2], ...player?.busStop?.[3], ...player?.bus])};
            }
            copiedGame.playerList.splice(userToRemove, 1);
            newPlayers = {
                playerList: [...copiedGame.playerList],
            }
            if (isPlayerCreator) {
                newPlayers.playerList[0].creator = true;
            }
        }
        return {newPlayers, newDeck};
    }
    #emit(updatedGame,gameCode, userId) {
        transformCurrentPlayerData(updatedGame, userId);
        updatedGame.playerList.forEach(player => {
            const playerId = player.userId;
            const playerGame = structuredClone(updatedGame);
            transformCurrentPlayerData(playerGame, playerId);
            console.log(`Emitting playerRemoved event to ${gameCode}_${playerId}`);
            this.io.to(`${gameCode}_${playerId}`).emit("playerRemoved", playerGame);
        })
    }
}

module.exports = RemoveGamePlayer;
