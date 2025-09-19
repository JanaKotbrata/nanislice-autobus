const UsersRepository = require("../models/users-repository");
const GameErrors = require("../errors/game/game-errors");
const users = new UsersRepository();

/**
 * Gets a user by ID or throws an error if not found.
 * @param {string} userId - The user ID
 * @param {Function} [error] - Error constructor for missing user
 * @returns {Promise<object>} The user object
 */
async function getUser(userId, error = GameErrors.UserDoesNotExist) {
  const user = await users.getById(userId);
  if (!user) {
    throw new error();
  }
  return user;
}
module.exports = {
  getUser,
};
