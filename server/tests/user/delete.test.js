require("../services/setup-db");
const DeleteUser = require("../../src/routes/user/delete");
const Routes = require("../../../shared/constants/routes.json");
const {
  cleanupTestContext,
  createUser,
  apiRequestSuccess,
  apiRequestError,
} = require("../test-helpers");
const applyBeforeAll = require("../helpers/before-all-helper");

describe("POST /user/delete", () => {
  let ctx = applyBeforeAll(DeleteUser);

  afterEach(async () => {
    const { usersCollection, gamesCollection } = ctx;
    await cleanupTestContext({ usersCollection, gamesCollection });
  });

  it("should delete user", async () => {
    const user = await createUser(ctx.usersCollection);
    ctx.setTestUserId(user.id);
    await apiRequestSuccess(
      ctx.app,
      "post",
      Routes.User.DELETE,
      ctx.getToken,
      user.id,
      { userId: user.id },
    );
  });
  it("not authorized", async () => {
    const error = {
      status: 403,
      name: "UserNotAuthorized",
      message: "User is not authorized to perform this action",
    };
    const user = await createUser(ctx.usersCollection);
    const userForDelete = await createUser(ctx.usersCollection);
    ctx.setTestUserId(user.id);
    await apiRequestError(
      ctx.app,
      "post",
      Routes.User.DELETE,
      ctx.getToken,
      user.id,
      { userId: userForDelete.id },
      error,
    );
  });
});
