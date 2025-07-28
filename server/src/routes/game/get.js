const validateData = require("../../services/validation-service");
const {get: schema} = require("../../data-validations/game/validation-schemas");
const {GetResponseHandler} = require("../../services/response-handler");
const Routes = require("../../../../shared/constants/routes.json");
const {getGame, transformCurrentPlayerData} = require("../../services/game-service");
const {authorizeUser} = require("../../services/auth-service");
const GameErrors = require("../../errors/game/game-errors");


class GetGame extends GetResponseHandler {
    constructor(expressApp) {
        super(expressApp, Routes.Game.GET, "get");
    }

    async get(req) {
        const validData = validateData(req.query, schema);
        const {id, code} = validData;
        await authorizeUser(req.user.id, GameErrors.UserDoesNotExist, GameErrors.UserNotAuthorized);

        const game = await getGame(id, code, false, true)

        if (game) {
            transformCurrentPlayerData(game, req.user.id);

            return {...game, success: true};
        }
    }
}

module.exports = GetGame;
