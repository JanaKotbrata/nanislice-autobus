const fs = require("fs").promises;
const path = require("path");
const { GetFileResponseHandler } = require("../../services/response-handler");
const {
  getAvatar: schema,
} = require("../../input-validation-schemas/user/validation-schemas");
const Routes = require("../../../../shared/constants/routes.json");
const UserErrors = require("../../errors/user/user-errors");
const {
  AVATAR_FOLDER,
  getExistingAvatar,
  DEFAULT_AVATAR,
} = require("../../services/avatar-service");
const { validateData } = require("../../services/validation-service");
const { getUser } = require("../../services/user-service");

class GetAvatar extends GetFileResponseHandler {
  constructor(expressApp) {
    super(expressApp, Routes.User.GET_AVATAR, "get");
  }

  async get(req, res) {
    const { userId } = validateData(req, schema);
    await getUser(userId, UserErrors.UserDoesNotExist);

    try {
      const avatarFile = await getExistingAvatar(userId);
      if (!avatarFile) {
        await fs.stat(DEFAULT_AVATAR); // ensure existing file
        return res.sendFile(DEFAULT_AVATAR);
      }
      const filePath = path.join(AVATAR_FOLDER, avatarFile);
      return res.sendFile(filePath);
    } catch (e) {
      if (e.code === "ENOENT") {
        throw new UserErrors.AvatarNotFound(userId);
      }
      throw new UserErrors.FailToDownloadAvatar(userId);
    }
  }
}

module.exports = GetAvatar;
