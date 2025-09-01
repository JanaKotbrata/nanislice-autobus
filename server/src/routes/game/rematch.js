const GamesRepository = require("../../models/games-repository");
const validateData = require("../../services/validation-service");
const {rematch: schema} = require("../../data-validations/game/validation-schemas");
const {PostResponseHandler} = require("../../services/response-handler");
const Routes = require("../../../../shared/constants/routes.json");
const GameErrors = require("../../errors/game/game-errors");
const {generateGameCode} = require("../../utils/helpers");
const {States} = require("../../utils/game-constants");
const {transformCurrentPlayerData, getGame, closeGame} = require("../../services/game-service");
const {authorizeUser} = require("../../services/auth-service");
const games = new GamesRepository();

const maxAttempts = 5;

class RematchGame extends PostResponseHandler {
    constructor(expressApp, io) {
        super(expressApp, Routes.Game.REMATCH, "rematch");
        this.io = io;
    }

    async rematch(req) {
        const validData = validateData(req.body, schema);
        const {gameId, gameCode} = validData;
        const userId = req.user.id;
        let isDuplicateKey = false;
        let tryCount = 0;

        const user = await authorizeUser(userId, GameErrors.UserDoesNotExist, GameErrors.UserNotAuthorized);
        const finishedGame = await getGame(gameId, gameCode, GameErrors.GameDoesNotExist);
        if (finishedGame.state !== States.FINISHED) {
            throw new GameErrors.GameIsNotFinished(validData);
        }
        if (!finishedGame.playerList.find((player) => {
            return player.userId === user.id
        })) {
            throw new GameErrors.UserNotInPreviousGame(validData);
        }
        const oldGameCode = finishedGame.code;
        const playerList = this.prepareRematchPlayers(finishedGame.playerList)

        do {
            const newCode = generateGameCode();
            const newGame = {
                code: newCode,
                state: States.INITIAL,
                playerList,
                gameBoard: [],
                completedCardList: [],
            };
            try {
                const game = await games.createGame(newGame);
                game.playerList.forEach(player => {
                    const playerId = player.userId;
                    console.log(`Emitting rematch event to ${oldGameCode}_${playerId}`);
                    this.io.to(`${oldGameCode}_${playerId}`).emit("rematch", {
                        gameCode: game.code,
                    });
                })
                transformCurrentPlayerData(game, userId);
                await closeGame(finishedGame);
                return {...game, success: true};
            } catch (error) { //TODO errors
                if (error.code !== 11000) {
                    console.error("Game already exist:", error);
                } else {
                    isDuplicateKey = true;
                    tryCount++;
                    console.log(`Trying execute again for ${tryCount}th time. Error: `, error);
                }
                if (tryCount >= maxAttempts) {
                    throw new GameErrors.FailedToRematchGame(error);
                }
            }
        } while (isDuplicateKey && tryCount < maxAttempts);
    }

    prepareRematchPlayers(playerList) {
        const filtered = [];
        let sortedList = playerList.sort((a, b) => a.bus.length - b.bus.length);
        let isThereCreator = false;
        for (let player of sortedList) {
            if (player.nextGame) {
                let newPlayer = {userId: player.userId, name: player.name};
                if (player.creator) {
                    isThereCreator = true;
                    newPlayer = {...newPlayer, creator: true};
                }
                filtered.push(newPlayer);

            }
        }

        if (filtered.length < 2) {
            throw new GameErrors.NotEnoughPlayersForRematch();
        }
        if (!isThereCreator) {
            filtered[0].creator = true;
        }
        return filtered;
    }


}


module.exports = RematchGame;
