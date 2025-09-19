const TokenHashRepository = require("../../models/token-hash-repository");
const {
  AuthenticatedPostResponseHandler,
} = require("../../services/response-handler");
const Routes = require("../../../../shared/constants/routes.json");
const { Roles } = require("../../../../shared/constants/game-constants.json");
const UserErrors = require("../../errors/user/user-errors");
const {
  getUseCaseAuthorizedUser,
} = require("../../services/validation-service");
const token = new TokenHashRepository();

class DeleteAllTokens extends AuthenticatedPostResponseHandler {
  constructor(expressApp) {
    super(expressApp, Routes.User.DELETE_ALL_TOKEN, "delete");
  }

  async delete(req) {
    const userId = req.user.id;

    await getUseCaseAuthorizedUser(
      userId,
      {},
      [Roles.ADMIN],
      UserErrors.UserNotAuthorized,
      UserErrors.UserDoesNotExist,
    );

    const result = await token.deleteAll();
    return {
      deletedCount: result.deletedCount,
    };
  }
}

module.exports = DeleteAllTokens;
