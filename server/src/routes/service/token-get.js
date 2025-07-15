const {PostResponseHandler} = require("../../services/response-handler");
const Routes = require("../../../../shared/constants/routes.json");

class TokenGet extends PostResponseHandler {
    constructor(expressApp, io) {
        super(expressApp, Routes.Game.START, "start");
        this.io = io;
    }

    get(req) {
        const user = req.user;
        if (!user) {
            return {success: false, message: "User not authenticated"};
        }

        // Generate a token for the user
        const token = this.generateToken(user.id);

        // Return the token
        return {success: true, token};
    }
}

module.exports = TokenGet;