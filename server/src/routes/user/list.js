const UsersRepository = require("../../models/users-repository");
const { validateAndGetUser } = require("../../services/validation-service");
const {
  list: schema,
} = require("../../input-validation-schemas/user/validation-schemas");
const {
  AuthenticatedGetResponseHandler,
} = require("../../services/response-handler");
const Routes = require("../../../../shared/constants/routes.json");
const { Roles } = require("../../../../shared/constants/game-constants.json");
const UserErrors = require("../../errors/user/user-errors");
// Ensure all error handling uses canonical error classes/messages if relevant
const users = new UsersRepository();

class ListGame extends AuthenticatedGetResponseHandler {
  constructor(expressApp) {
    super(expressApp, Routes.User.LIST, "list");
  }

  async list(req) {
    const { validData, user } = await validateAndGetUser(
      req,
      schema,
      undefined,
      UserErrors.UserNotAuthorized,
      UserErrors.UserDoesNotExist,
    );
    const { role, pageInfo } = validData;

    let result;
    if (role) {
      result = await users.listByRole(role, pageInfo);
    } else {
      result = await users.list(pageInfo);
    }

    result.list = this.#transformData(result.list, user.role, user);

    return { ...result };
  }

  #getHiddenEmail(email) {
    const splitedEmail = email.split("@");
    return splitedEmail[0][0] + "**********@" + splitedEmail[1];
  }

  #transformData(userList, role, myself) {
    let transformedList = [];
    for (let user of userList) {
      let newUser = { ...user, id: user._id.toString() };
      delete newUser._id;
      if (role !== Roles.ADMIN) {
        delete newUser.sys;
        delete newUser.googleId;
        delete newUser.seznamId;
        delete newUser.discordId;
        if (myself.id !== newUser.id) {
          newUser.email = this.#getHiddenEmail(newUser.email);
        }
        transformedList.push(newUser);
      } else {
        transformedList.push(newUser);
      }
    }
    return transformedList;
  }
}

module.exports = ListGame;
