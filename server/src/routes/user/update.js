const UsersRepository = require("../../models/users-repository");
const validateData = require("../../services/validation-service");
const {update: schema} = require("../../data-validations/user/validation-schemas");
const {PostFormDataResponseHandler} = require("../../services/response-handler");
const Routes = require("../../../../shared/constants/routes.json");
const UserErrors = require("../../errors/user/user-errors");
const {storeAvatar} = require("../../utils/download-image");
const GamesRepository = require("../../models/games-repository");
const {authorizeUser} = require("../../services/auth-service");
const users = new UsersRepository();
const games = new GamesRepository();

class UpdateUser extends PostFormDataResponseHandler {
    constructor(expressApp) {
        super(expressApp, Routes.User.UPDATE, "picture", "update");
    }

    async update(req) {
        const userId = req.user.id;
        let dataToValidate = req.body;
        if (req.file) {
            dataToValidate = {...dataToValidate, picture: "yes"};
        }
        const validData = validateData(dataToValidate, schema);
        const {name, language, picture} = validData;

        let user = await authorizeUser(userId, UserErrors.UserDoesNotExist, UserErrors.UserNotAuthorized);//TODO admin or update own user
        const activeGameWithUser = await games.findNotClosedGameByUserId(userId);

        let toUpdate = {sys: user.sys}
        if (name) {
            toUpdate.name = name;
        }
        if (language) {
            if (language === "null") {
                toUpdate.language = null;
            } else {
                toUpdate.language = language;
            }
        }
        try {
            user = await users.updateUser(userId, toUpdate);
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
            const playerIndex = activeGameWithUser.playerList.findIndex((player) =>
                player.userId === userId
            );
            let newPlayerList = structuredClone(activeGameWithUser.playerList);
            if (name) {
                newPlayerList[playerIndex].name = name;
            }
            newPlayerList[playerIndex].rev = user.sys.rev;
            try {
                await games.updateGame(activeGameWithUser.id, {playerList: newPlayerList, sys: activeGameWithUser.sys});
            } catch (e) {
                throw new UserErrors.UserUpdateFailed(e);
            }
        }

        return {...user, success: true};
    }
}

module.exports = UpdateUser;
