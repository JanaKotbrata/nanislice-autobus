require("../services/setup-db");

const AuthenticateUser = require("../../src/routes/user/authenticate");
const Routes = require("../../../shared/constants/routes.json");
const {
  cleanupTestContext,
  createUser,
  apiRequestSuccess,
  apiRequestError,
} = require("../test-helpers");
const applyBeforeAll = require("../helpers/before-all-helper");
const { generateRandomId } = require("../helpers/default-mocks");

describe("POST /user/authenticate", () => {
  let ctx = applyBeforeAll(AuthenticateUser);
  afterEach(async () => {
    const { usersCollection } = ctx;
    await cleanupTestContext({ usersCollection });
  });

  it("should authenticate and return user object if authenticated and user exists", async () => {
    const user = await createUser(ctx.usersCollection);
    ctx.setTestUserId(user.id);
    const response = await apiRequestSuccess(
      ctx.app,
      "post",
      Routes.User.AUTHENTICATE,
      ctx.getToken,
      user.id,
      {},
    );
    expect(response.body.success).toBe(true);
    expect(response.body.id).toBe(user.id);
    // Optionally: check for sensitive fields
    expect(response.body.password).toBeUndefined();
  });
  describe("user not auth", () => {
    let ctx = applyBeforeAll(AuthenticateUser, false, true);

    afterEach(async () => {
      const { usersCollection, gamesCollection } = ctx;
      await cleanupTestContext({ usersCollection, gamesCollection });
    });
    it("should return error if not authenticated", async () => {
      const error = {
        status: 401,
        name: "UserNotAuthenticated",
        message: "User is not authenticated",
      };
      const user = await createUser(ctx.usersCollection);
      await apiRequestError(
        ctx.app,
        "post",
        Routes.User.AUTHENTICATE,
        ctx.getToken,
        user.id,
        {},
        error,
      );
    });
  });
  describe("user does not exist", () => {
    let ctx = applyBeforeAll(AuthenticateUser, true, true);

    afterEach(async () => {
      const { usersCollection, gamesCollection } = ctx;
      await cleanupTestContext({ usersCollection, gamesCollection });
    });
    it("should return error if user does not exist", async () => {
      const error = {
        status: 404,
        name: "UserDoesNotExist",
        message: "Requested user does not exist",
      };
      const fakeUserId = generateRandomId();
      ctx.setTestUserId(fakeUserId);
      await apiRequestError(
        ctx.app,
        "post",
        Routes.User.AUTHENTICATE,
        ctx.getToken,
        fakeUserId,
        {},
        error,
      );
    });
  });
});
