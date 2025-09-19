const {
  NotAuthenticatedGetResponseHandler,
} = require("../../services/response-handler");
const Routes = require("../../../../shared/constants/routes.json");
const { Roles } = require("../../../../shared/constants/game-constants.json");
const { createTokenHash } = require("../../services/token-service");
const jwt = require("jsonwebtoken");
const UserErrors = require("../../errors/user/user-errors");
const config = require("../../../config/config.json");
const {
  getUseCaseAuthorizedUser,
} = require("../../services/validation-service");
const JWT_SECRET = config.secret;

class TokenGet extends NotAuthenticatedGetResponseHandler {
  constructor(expressApp, io) {
    super(expressApp, Routes.User.TOKEN_GET, "get");
    this.io = io;
  }

  async get(req) {
    const userId = req.query.userId;
    await getUseCaseAuthorizedUser(
      userId,
      {},
      [Roles.ADMIN],
      UserErrors.UserNotAuthorized,
      UserErrors.UserDoesNotExist,
    );
    const { hash } = await createTokenHash(userId);
    const token = jwt.sign({ id: userId, loginHash: hash }, JWT_SECRET, {
      expiresIn: "24h",
    });
    return { token };
  }
}

module.exports = TokenGet;
