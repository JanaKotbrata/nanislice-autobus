const GamesRepository = require("../../models/games-repository");
const UsersRepository = require("../../models/users-repository");
const validateData = require("../../services/validation-service");
const {playerAdd:schema} = require("../../data-validations/game/validation-schemas");
const { PostResponseHandler} = require("../../services/response-handler");
const Routes = require("../../../../shared/constants/routes");
const GameErrors = require("../../errors/game/game-errors");
const games = new GamesRepository();
const users = new UsersRepository();

class AddGamePlayer extends PostResponseHandler {
    constructor(expressApp) {
        super(expressApp, Routes.Games.PLAYER_ADD, "add");
    }

    async add(req) {
        const validData = validateData(req.body, schema);
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

        const user = await users.getUserById(userId);
        if (!user) {
            return new GameErrors.UserDoesNotExistError(validData);
        }

        //validation of playerList
        const isPlayerInGame = game.playerList.find((player) =>
            player.userId === userId
        );
        if (isPlayerInGame) {
            return new GameErrors.PlayerAlreadyInGameError(validData);
        }

        const newPlayers = {
            playerList: [...game.playerList, {userId, name: user.name, creator: false}],
        };
        try {
            const updatedGame = await games.updateGame(game.id, newPlayers);
            return {...updatedGame, success: true};

        } catch (error) {
            console.error("Failed to add player:", error);
            return new GameErrors.FailedToAddPlayerError(error);
        }
    }
}
module.exports = AddGamePlayer;
