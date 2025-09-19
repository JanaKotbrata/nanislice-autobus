require("../services/setup-db");

const TokenDeleteAll = require("../../src/routes/service/token-delete-all");
const Routes = require("../../../shared/constants/routes.json");
const { Roles } = require("../../../shared/constants/game-constants.json");
const {
  cleanupTestContext,
  createUser,
  apiRequestSuccess,
} = require("../test-helpers");
const applyBeforeAll = require("../helpers/before-all-helper");

describe("POST /user/token/deleteAll", () => {
  let ctx = applyBeforeAll(TokenDeleteAll);

  afterEach(async () => {
    const { usersCollection, gamesCollection } = ctx;
    await cleanupTestContext({ usersCollection, gamesCollection });
  });

  it("should delete token", async () => {
    const user = await createUser(ctx.usersCollection, { role: Roles.ADMIN });
    ctx.setTestUserId(user.id);
    await apiRequestSuccess(
      ctx.app,
      "post",
      Routes.User.DELETE_ALL_TOKEN,
      ctx.getToken,
      user.id,
      {},
    );
  });
});
