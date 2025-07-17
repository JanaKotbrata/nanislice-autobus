const UsersRepository = require("../models/users-repository");
const users = new UsersRepository();
async function authorizeUser(userId, missingError, authError, requiredRoles = ["admin", "vip","pleb"]){
    const user = await users.getUserById(userId);
    if (!user) {
        throw new missingError(user);
    }
    if(!requiredRoles.includes(user.role)) {
        throw new authError(user);
    }
    return user;
}
async function authorizePlayer(user, game, authError) {
    const player = game.playerList.find((player) => player.userId === user.id);
    if (user.role !=="admin" && !player?.creator) {
        throw new authError(user.id);
    }
    return player;
}
module.exports = {
    authorizeUser,
    authorizePlayer
};