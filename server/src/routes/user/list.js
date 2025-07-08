const UsersRepository = require("../../models/users-repository");
const validateData = require("../../services/validation-service");
const {list: schema} = require("../../data-validations/user/validation-schemas");
const {GetResponseHandler} = require("../../services/response-handler");
const Routes = require("../../../../shared/constants/routes.json");
const users = new UsersRepository();

class ListGame extends GetResponseHandler {
    constructor(expressApp) {
        super(expressApp, Routes.User.LIST, "list");
    }

    async list(req) {
        const validData = validateData(req.body, schema);
        const {role, pageInfo} = validData;

        let userList
        if (role) {
            userList = await users.listUserByRole(role,pageInfo);
        } else {
            userList = await users.listUser(pageInfo);
        }

        return {...userList, success: true};
    }
}

module.exports = ListGame;
