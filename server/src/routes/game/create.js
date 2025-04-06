const GamesRepository = require("../../models/games-repository");
const UsersRepository = require("../../models/users-repository");
const validateData = require("../../services/validation-service");
const {create: schema} = require("../../data-validations/game/validation-schemas");
const {PostResponseHandler} = require("../../services/response-handler");
const Routes = require("../../../../shared/constants/routes");
const GameErrors = require("../../errors/game/game-errors");

const {generateGameCode} = require("../../utils/helpers");
const games = new GamesRepository();
const users = new UsersRepository();

const maxAttempts = 5;

class CreateGame extends PostResponseHandler {
    constructor(expressApp) {
        super(expressApp, Routes.Games.CREATE, "create");
    }

    async create(req) {
        //  const validData = validateData(req.body, schema);
        //const {userId} = validData;
        const userId = req.user._id;
        let isDuplicateKey = false;
        let tryCount = 0;

        const user = await users.getUserById(userId);
        if (!user) {
            throw new GameErrors.UserDoesNotExistError(user);
        }

        const activeGamesWithUser = await games.findNotClosedGamesByUserId(userId);

        if (activeGamesWithUser.length > 0) {
            throw new GameErrors.UserAlreadyInGameError(userId); //TODO na FE vyhodit alert, že už je v nějaké hře a jestli chce přesměrovat na existující hru
        }

        do {
            const gameCode = generateGameCode();

            // creates new game
            const newGame = {
                code: gameCode,
                status: "initial",
                playerList: [{userId, name: user.name, creator: true}],
            };
            try {
                const game = await games.createGame(newGame);
                return {...game, success: true};

            } catch (error) {
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
