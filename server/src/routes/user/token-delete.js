const UsersRepository = require("../../models/users-repository");
const TokenHashRepository = require("../../models/token-hash-repository");
const validateData = require("../../services/validation-service");
const {tDelete: schema} = require("../../data-validations/user/validation-schemas");
const {PostResponseHandler} = require("../../services/response-handler");
const Routes = require("../../../../shared/constants/routes.json");
const GameErrors = require("../../errors/user/user-errors");
const users = new UsersRepository();
const token = new TokenHashRepository();

class DeleteToken extends PostResponseHandler {
    constructor(expressApp) {
        super(expressApp, Routes.User.DELETE_TOKEN, "delete");
    }

    async delete(req) {
        //const validData = validateData(req.body, schema);
        const userId = req.user.id;

        const user = await users.getUserById(userId);
        if (!user) {
            throw new GameErrors.UserDoesNotExist(user);
        }

        await token.deleteTokenByIdAndHash(user.id, req.user.loginHash);
        return {id: user.id, success: true};

    }
}

module.exports = DeleteToken;
