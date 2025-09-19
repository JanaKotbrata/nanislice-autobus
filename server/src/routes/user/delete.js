const UsersRepository = require("../../models/users-repository");
const { validateAndGetUser } = require("../../services/validation-service");
const {
  deleteUser: schema,
} = require("../../input-validation-schemas/user/validation-schemas");
const {
  AuthenticatedPostResponseHandler,
} = require("../../services/response-handler");
const Routes = require("../../../../shared/constants/routes.json");
const UserErrors = require("../../errors/user/user-errors");
const users = new UsersRepository();

class DeleteUser extends AuthenticatedPostResponseHandler {
  constructor(expressApp) {
    super(expressApp, Routes.User.DELETE, "delete");
  }

  async delete(req) {
    const { validData } = await validateAndGetUser(
      req,
      schema,
      undefined,
      UserErrors.UserNotAuthorized,
      UserErrors.UserDoesNotExist,
    );

    let result = await users.delete(validData.userId);

    return { ...result };
  }
}

module.exports = DeleteUser;
