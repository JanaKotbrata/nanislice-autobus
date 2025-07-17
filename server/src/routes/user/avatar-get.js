const fs = require("fs");
const path = require("path");
const {GetFileResponseHandler} = require("../../services/response-handler");
const Routes = require("../../../../shared/constants/routes.json");
const UserErrors = require("../../errors/user/user-errors");
const {authorizeUser} = require("../../services/auth-service");

class GetAvatar extends GetFileResponseHandler {
    constructor(expressApp) {
        super(expressApp, Routes.User.GET_AVATAR, "get");
    }

    async get(req, res) {
        const userId = req.query.userId;
        const user = await authorizeUser(userId, UserErrors.UserDoesNotExist, UserErrors.UserNotAuthorized);

        try {
            const avatarDir = path.resolve(__dirname, "../../../avatars");
            const files = await fs.promises.readdir(avatarDir);

            const avatarFile = files.find(file => file.startsWith(`${userId}.`));
            if (!avatarFile) {
                const filePath = path.join(avatarDir, "pig-face.png");
                return res.sendFile(filePath);
            }

            const filePath = path.join(avatarDir, avatarFile);
            return res.sendFile(filePath);
        } catch (e) {
            if (e instanceof UserErrors.AvatarNotFound) {
                throw e;
            }
            throw new UserErrors.FailToDownloadAvatar(user);
        }
    }
}

module.exports = GetAvatar;
