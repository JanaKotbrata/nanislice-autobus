require("../services/setup-db");

const TokenDelete = require("../../src/routes/user/token-delete");
const Routes = require("../../../shared/constants/routes.json");
const {
  cleanupTestContext,
  createUser,
  apiRequestSuccess,
} = require("../test-helpers");
const applyBeforeAll = require("../helpers/before-all-helper");

describe("POST /user/token/delete", () => {
  let ctx = applyBeforeAll(TokenDelete);

  afterEach(async () => {
    const { usersCollection, gamesCollection } = ctx;
    await cleanupTestContext({ usersCollection, gamesCollection });
  });

  it("should delete token", async () => {
    const user = await createUser(ctx.usersCollection);
    ctx.setTestUserId(user.id);
    await apiRequestSuccess(
      ctx.app,
      "post",
      Routes.User.DELETE_TOKEN,
      ctx.getToken,
      user.id,
      {},
    );
  });
});
