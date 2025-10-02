const UsersRepository = require("../../models/users-repository");
const { calculateLevel } = require("../../services/game-service");
const {
  AuthenticatedPostResponseHandler,
} = require("../../services/response-handler");
const Routes = require("../../../../shared/constants/routes.json");
const { Roles } = require("../../../../shared/constants/game-constants.json");
const UserErrors = require("../../errors/user/user-errors");
const {
  getUseCaseAuthorizedUser,
} = require("../../services/validation-service");
const users = new UsersRepository();

class RecalculateAllUserLevels extends AuthenticatedPostResponseHandler {
  constructor(expressApp) {
    super(expressApp, Routes.User.RECALCULATE_LEVEL, "recalculate");
  }

  async recalculate(req) {
    const userId = req.user.id;

    await getUseCaseAuthorizedUser(
      userId,
      {},
      [Roles.ADMIN],
      UserErrors.UserNotAuthorized,
      UserErrors.UserDoesNotExist,
    );

    // This maintenance endpoint recalculates 1000 user levels at once.
    // Pagination is not used here because this is a one-time operation
    // and the expected number of users is reasonable for bulk processing.
    // If the user base grows significantly, consider batch processing.
    const allUsersResult = await users.list();
    const allUsers = allUsersResult.list || [];
    let updatedCount = 0;
    for (const user of allUsers) {
      const correctLevel = calculateLevel(user.xp || 0);
      if (user.level !== correctLevel) {
        await users.setLevel(user._id.toString(), correctLevel);
        updatedCount++;
      }
    }
    return { success: true, updatedCount };
  }
}

module.exports = RecalculateAllUserLevels;
