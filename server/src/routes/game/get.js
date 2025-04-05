const GamesRepository = require("../../models/games-repository");
const validateData = require("../../services/validation-service");
const {get: schema} = require("../../data-validations/game/validation-schemas");
const {GetResponseHandler} = require("../../services/response-handler");
const Routes = require("../../../../shared/constants/routes");
const GameErrors = require("../../errors/game/game-errors");
const games = new GamesRepository();

class GetGame extends GetResponseHandler {
    constructor(expressApp) {
        super(expressApp, Routes.Games.GET, "get");
    }

    async get(req) {
        const validData = validateData(req.body, schema);
        const {id, code} = validData;

        let game;
        if (id) {
            game = await games.getGameById(id);
        } else {
            game = await games.getGameByCode(code);

        }
        if (!game) {
          throw new GameErrors.GameDoesNotExistError(validData);
            // return new GameErrors.GameDoesNotExistError(validData); //Použití jako warning - ale je lepší udělat novou třídu pro Warning
        }
        return {...game, success: true};
    }
}

module.exports = GetGame;
