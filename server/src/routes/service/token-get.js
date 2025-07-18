const {NotAuthenticatedGetResponseHandler} = require("../../services/response-handler");
const Routes = require("../../../../shared/constants/routes.json");
const {createTokenHash} = require("../../services/token-service");
const jwt = require("jsonwebtoken");
const {authorizeUser} = require("../../services/auth-service");
const UserErrors = require("../../errors/user/user-errors");
const config = require("../../../config/config.json");
const JWT_SECRET = config.secret;

class TokenGet extends NotAuthenticatedGetResponseHandler {
    constructor(expressApp, io) {
        super(expressApp, Routes.User.TOKEN_GET, "get");
        this.io = io;
    }

    async get(req) {
        const userId = req.query.userId;
        await authorizeUser(userId, UserErrors.UserDoesNotExist, UserErrors.UserNotAuthorized, ["admin"]);
        const {hash} = await createTokenHash(userId);
        const token = jwt.sign({id: userId, loginHash: hash}, JWT_SECRET, {expiresIn: '24h'});
        return {success: true, token};
    }
}

module.exports = TokenGet;