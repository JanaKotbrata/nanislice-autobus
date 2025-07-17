const TokenHashRepository = require("../../models/token-hash-repository");
const {PostResponseHandler} = require("../../services/response-handler");
const Routes = require("../../../../shared/constants/routes.json");
const UserErrors = require("../../errors/user/user-errors");
const {authorizeUser} = require("../../services/auth-service");
const token = new TokenHashRepository();

class DeleteAllTokens extends PostResponseHandler {
    constructor(expressApp) {
        super(expressApp, Routes.User.DELETE_ALL_TOKEN, "delete");
    }

    async delete(req) {
        const userId = req.user.id;

        await authorizeUser(userId, UserErrors.UserDoesNotExist, UserErrors.UserNotAuthorized, ["admin"]);

        const result = await token.deleteAllTokens();
        return {
            deletedCount: result.deletedCount,
            success: true
        };
    }
}

module.exports = DeleteAllTokens;
