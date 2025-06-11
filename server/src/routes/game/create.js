const GamesRepository = require("../../models/games-repository");
const UsersRepository = require("../../models/users-repository");
const validateData = require("../../services/validation-service");
const {create: schema} = require("../../data-validations/game/validation-schemas");
const {PostResponseHandler} = require("../../services/response-handler");
const Routes = require("../../../../shared/constants/routes.json");
const GameErrors = require("../../errors/game/game-errors");
const {generateGameCode} = require("../../utils/helpers");
const {States} = require("../../utils/game-constants");
const {transformCurrentPlayerData} = require("../../services/game-service");
const games = new GamesRepository();
const users = new UsersRepository();

const maxAttempts = 5;

class CreateGame extends PostResponseHandler {
    constructor(expressApp) {
        super(expressApp, Routes.Game.CREATE, "create");
    }

    async create(req) {
        //const validData = validateData(req.body, schema);
        //const {userId} = validData;
        const userId = req.user.id;
        let isDuplicateKey = false;
        let tryCount = 0;

        const user = await users.getUserById(userId);
        if (!user) {
            throw new GameErrors.UserDoesNotExist(user);
        }

        const activeGameWithUser = await games.findNotClosedGameByUserId(userId);

        if (activeGameWithUser) {
           transformCurrentPlayerData(activeGameWithUser, userId);
            return {...activeGameWithUser, success: true};
        }

        do {
            const gameCode = generateGameCode();

            // creates new game
            const newGame = {
                code: gameCode,
                state: States.INITIAL,
                playerList: [{userId: user.id, picture: user.picture, name: user.name, creator: true}],
                gameBoard: [],
                completedCardList: [],
            };
            try {
                const game = await games.createGame(newGame);
                transformCurrentPlayerData(game, userId);
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
                    throw new GameErrors.FailedToCreateGame(error);
                }
            }
        } while (isDuplicateKey && tryCount < maxAttempts);
    }
}


module.exports = CreateGame;
