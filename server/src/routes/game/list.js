const GamesRepository = require("../../models/games-repository");
const validateData = require("../../services/validation-service");
const {list:schema} = require("../../data-validations/game/validation-schemas");
const { GetResponseHandler} = require("../../services/response-handler");
const Routes = require("../../../../shared/constants/routes");
const GameErrors = require("../../errors/game/game-errors");
const games = new GamesRepository();

class ListGame extends GetResponseHandler {
    constructor(expressApp) {
        super(expressApp, Routes.Games.LIST, "list");
    }

    async list(req) {
        const validData = validateData(req.body, schema);
        const {state} = validData;

        let gameList;

        if (state) {
            gameList = await games.listGameByState(state);
        } else {
            gameList = await games.listGame();
        }

        return {...gameList, success: true};
    }
}

module.exports = ListGame;
