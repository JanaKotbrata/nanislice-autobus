const GamesRepository = require("../../models/games-repository");
const validateData = require("../../services/validation-service");
const {get: schema} = require("../../data-validations/game/validation-schemas");
const {GetResponseHandler} = require("../../services/response-handler");
const Routes = require("../../../../shared/constants/routes.json");
const GameErrors = require("../../errors/game/game-errors");
const {transformCurrentPlayerData} = require("../../services/game-service");
const games = new GamesRepository();

class GetGame extends GetResponseHandler {
    constructor(expressApp) {
        super(expressApp, Routes.Game.GET, "get");
    }

    async get(req) {
        const validData = validateData(req.query, schema);
        const {id, code} = validData;

        let game;
        if (id) {
            game = await games.getGameById(id);
        } else {
            game = await games.getGameByCode(code);
        }

        if (!game) {
          throw new GameErrors.GameDoesNotExist(validData);
            // TODO return new GameErrors.GameDoesNotExist(validData); //Použití jako warning - ale je lepší udělat novou třídu pro Warning
        }

        //important is only the current players data - so only other players bus stop and 1 card from autobus
        transformCurrentPlayerData(game,req.user.id);

        return {...game, success: true};
    }
}

module.exports = GetGame;
