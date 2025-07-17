const UsersRepository = require("../../models/users-repository");
const validateData = require("../../services/validation-service");
const {list: schema} = require("../../data-validations/user/validation-schemas");
const {GetResponseHandler} = require("../../services/response-handler");
const Routes = require("../../../../shared/constants/routes.json");
const {authorizeUser} = require("../../services/auth-service");
const UserErrors = require("../../errors/user/user-errors");
const users = new UsersRepository();

class ListGame extends GetResponseHandler {
    constructor(expressApp) {
        super(expressApp, Routes.User.LIST, "list");
    }

    async list(req) {
        const validData = validateData(req.query, schema);
        const {role, pageInfo} = validData;
        const user = await authorizeUser(req.user.id, UserErrors.UserDoesNotExist, UserErrors.UserNotAuthorized,);
        let result
        if (role) {
            result = await users.listUserByRole(role, pageInfo);
        } else {
            result = await users.listUser(pageInfo);
        }
        if (user.role !== "admin") {
            result.list = this.#transformData(result.list)
        }
        return {...result, success: true};
    }

    #transformData(userList) {
        let transformedList = [];
        for (let user of userList) {
            transformedList.push({
                id: user.id,
                name: user.name,
                picture: user.picture,
                level: user.level,
                xp: user.xp,
                sys: user.sys
            });
        }
        return transformedList;
    }
}

module.exports = ListGame;
