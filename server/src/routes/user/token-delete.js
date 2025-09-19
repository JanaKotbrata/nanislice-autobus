const TokenHashRepository = require("../../models/token-hash-repository");
const { validateAndGetUser } = require("../../services/validation-service");
const {
  tDelete: schema,
} = require("../../input-validation-schemas/user/validation-schemas");
const {
  AuthenticatedPostResponseHandler,
} = require("../../services/response-handler");
const Routes = require("../../../../shared/constants/routes.json");
const UserErrors = require("../../errors/user/user-errors");

class DeleteToken extends AuthenticatedPostResponseHandler {
  constructor(expressApp) {
    super(expressApp, Routes.User.DELETE_TOKEN, "delete");
    this.tokenRepo = new TokenHashRepository();
  }

  async delete(req) {
    const { user } = await validateAndGetUser(
      req,
      schema,
      undefined,
      UserErrors.UserNotAuthorized,
      UserErrors.UserDoesNotExist,
    );

    await this.tokenRepo.deleteByIdAndHash(user.id, req.user.loginHash.hash);
    return { id: user.id };
  }
}

module.exports = DeleteToken;
