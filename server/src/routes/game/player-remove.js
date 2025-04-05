const GamesRepository = require("../../models/games-repository");
const UsersRepository = require("../../models/users-repository");
const validateData = require("../../services/validation-service");
const {playerRemove: schema} = require("../../data-validations/game/validation-schemas"); //TODO game vs game - udělat revizi všude ale :D
const {PostResponseHandler} = require("../../services/response-handler");
const Routes = require("../../../../shared/constants/routes");
const GameErrors = require("../../errors/game/game-errors");
const games = new GamesRepository();
const users = new UsersRepository();

class RemoveGamePlayer extends PostResponseHandler {
    constructor(expressApp) {
        super(expressApp, Routes.Games.PLAYER_REMOVE, "remove");
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
            return new GameErrors.GameDoesNotExistError(validData);
        }
        let isPlayerInGame = game.players.find((player) =>
            player.userId === userId
        );
        if (!isPlayerInGame) {
            return new GameErrors.PlayerNotInGameError(validData);
        }
        //validation of players
        const isPossibleToRemove = !!(game.players.length > 1);
        if (isPossibleToRemove) {
            const newPlayers = this.#removePlayer(game, userId);
            if (newPlayers) {
                try {
                    const updatedGame = await games.updateGame(game.id, newPlayers);
                    return {...updatedGame, success: true};

                } catch (error) {
                    console.error("Failed to remove player:", error);
                    return new GameErrors.FailedToRemovePlayerError(error);
                }
            }
        } else {
            //await game.deleteGame(game.id); //TODO na základě ještě nějaké podmínky
            const newGame = await games.updateGame(game.id, {code: `${game.code}-#closed#`, status: "closed"});
            return {...newGame, success: true};
        }

    }

    #removePlayer(game, userId) {
        let newPlayers;
        const copiedGame = JSON.parse(JSON.stringify(game));
        const userToRemove = copiedGame.players.findIndex(player => player.userId === userId);
        if (userToRemove !== -1) {
            const isPlayerCreator = copiedGame.players[userToRemove].creator;
            copiedGame.players.splice(userToRemove, 1);
            newPlayers = {
                players: [...copiedGame.players],
            }
            if (isPlayerCreator) {
                newPlayers.players[0].creator = true;
            }
        }
        return newPlayers;
    }
}

module.exports = RemoveGamePlayer;
