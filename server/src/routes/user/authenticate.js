const UserErrors = require("../../errors/user/user-errors");
const UsersRepository = require("../../models/users-repository");
const TokenHashRepository = require("../../models/token-hash-repository");
const {PostResponseHandler} = require("../../services/response-handler");
const Routes = require("../../../../shared/constants/routes.json");
const users = new UsersRepository();

class AuthenticateUser extends PostResponseHandler {
    constructor(expressApp) {
        super(expressApp, Routes.User.AUTHENTICATE, "authenticate");
    }
    async authenticate(req) {
        const userId = req.user.id;

        if (!req.isAuthenticated()) {
            throw new UserErrors.UserNotAuthenticatedError(userId);
        }
        const user = await users.getUserById(userId);
        if (!user) {
            throw new UserErrors.UserDoesNotExist(user);
        }
        return {...user, success: true};
    }
}
module.exports = AuthenticateUser;