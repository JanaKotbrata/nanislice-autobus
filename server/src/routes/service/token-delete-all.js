const TokenHashRepository = require("../../models/token-hash-repository");
const {PostResponseHandler} = require("../../services/response-handler");
const Routes = require("../../../../shared/constants/routes.json");
const GameErrors = require("../../errors/user/user-errors");

const token = new TokenHashRepository();

class DeleteAllTokens extends PostResponseHandler {
    constructor(expressApp) {
        super(expressApp, Routes.User.DELETE_ALL_TOKENS, "delete"); // přidej novou route do `routes.json`
    }

    async delete(req) {
        const userId = req.user.id; //TODO does not work
        const user = await users.getUserById(userId);
        if (!user) {
            throw new GameErrors.UserDoesNotExist(user);
        }
        if(user.role !== 'admin') {
            throw new GameErrors.UserNotAuthorizedError(user);
        }
        const result = await token.deleteAllTokens();
        return {
            deletedCount: result.deletedCount,
            success: true
        };
    }
}

module.exports = DeleteAllTokens;
