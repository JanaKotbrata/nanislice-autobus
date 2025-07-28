const TokenHashRepository = require("../../models/token-hash-repository");
const validateData = require("../../services/validation-service");
const {tDelete: schema} = require("../../data-validations/user/validation-schemas");
const {PostResponseHandler} = require("../../services/response-handler");
const Routes = require("../../../../shared/constants/routes.json");
const UserErrors = require("../../errors/user/user-errors");
const {authorizeUser} = require("../../services/auth-service");
const token = new TokenHashRepository();

class DeleteToken extends PostResponseHandler {
    constructor(expressApp) {
        super(expressApp, Routes.User.DELETE_TOKEN, "delete");
    }

    async delete(req) {
        //const validData = validateData(req.body, schema);
        const userId = req.user.id;
        const user= await authorizeUser(userId, UserErrors.UserDoesNotExist, UserErrors.UserNotAuthorized);

        await token.deleteTokenByIdAndHash(user.id, req.user.loginHash.hash);
        return {id: user.id, success: true};

    }
}

module.exports = DeleteToken;
