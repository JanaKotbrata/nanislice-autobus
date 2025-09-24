const UsersRepository = require("../../models/users-repository");
const { validateAndGetUser } = require("../../services/validation-service");
const {
  update: schema,
} = require("../../input-validation-schemas/user/validation-schemas");
const {
  PostFormDataResponseHandler,
} = require("../../services/response-handler");
const Routes = require("../../../../shared/constants/routes.json");
const UserErrors = require("../../errors/user/user-errors");
const { storeAvatar } = require("../../services/avatar-service");
const GamesRepository = require("../../models/games-repository");
const { getPlayerIndex } = require("../../services/game-service");
const users = new UsersRepository();
const games = new GamesRepository();

class UpdateUser extends PostFormDataResponseHandler {
  constructor(expressApp) {
    super(expressApp, Routes.User.UPDATE, "picture", "update");
  }

  async update(req) {
    let userId = req.user.id;
    let dataToValidate = req.body;
    if (req.file) {
      dataToValidate = { body: { ...dataToValidate, picture: "yes" } };
    }
    let { validData, user } = await validateAndGetUser(
      { ...req, ...dataToValidate },
      schema,
      undefined,
      UserErrors.UserNotAuthorized,
      UserErrors.UserDoesNotExist,
    );
    const { name, language, picture } = validData;

    const activeGameWithUser = await games.findNotClosedGameByUserId(userId);

    let toUpdate = { ...validData, sys: user.sys };

    if (language) {
      if (language === "null") {
        toUpdate.language = null;
      } else {
        toUpdate.language = language;
      }
    }

    try {
      user = await users.update(userId, toUpdate);
    } catch (e) {
      throw new UserErrors.UserUpdateFailed(e);
    }
    if (picture) {
      try {
        await storeAvatar(userId, req.file.buffer, req.file.mimetype);
      } catch (e) {
        throw new UserErrors.UserUpdateFailed(e);
      }
    }
    if (activeGameWithUser) {
      const playerIndex = getPlayerIndex(activeGameWithUser.playerList, userId);
      let newPlayerList = structuredClone(activeGameWithUser.playerList);
      if (name) {
        newPlayerList[playerIndex].name = name;
      }
      newPlayerList[playerIndex].rev = user.sys.rev;
      try {
        await games.update(activeGameWithUser.id, {
          playerList: newPlayerList,
          sys: activeGameWithUser.sys,
        });
      } catch (e) {
        throw new UserErrors.UserUpdateFailed(e);
      }
    }

    return { ...user };
  }
}

module.exports = UpdateUser;
