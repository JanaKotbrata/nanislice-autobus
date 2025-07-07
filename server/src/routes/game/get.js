const validateData = require("../../services/validation-service");
const {get: schema} = require("../../data-validations/game/validation-schemas");
const {GetResponseHandler} = require("../../services/response-handler");
const Routes = require("../../../../shared/constants/routes.json");
const {transformCurrentPlayerData, getGame} = require("../../services/game-service");


class GetGame extends GetResponseHandler {
    constructor(expressApp) {
        super(expressApp, Routes.Game.GET, "get");
    }

    async get(req) {
        const validData = validateData(req.query, schema);
        const {id, code} = validData;

        const game = await getGame(id, code, false, true)

        transformCurrentPlayerData(game, req.user.id);

        return {...game, success: true};
    }
}

module.exports = GetGame;
