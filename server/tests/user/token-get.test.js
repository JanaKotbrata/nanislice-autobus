require("../services/setup-db");

const TokenGet = require("../../src/routes/service/token-get");
const Routes = require("../../../shared/constants/routes.json");
const { Roles } = require("../../../shared/constants/game-constants.json");
const {
  cleanupTestContext,
  createUser,
  apiRequestSuccess,
  apiRequestError,
} = require("../test-helpers");
const applyBeforeAll = require("../helpers/before-all-helper");

const TOKEN_SECRET = "hello-world";

jest.mock("../../../server/token-secret", () => TOKEN_SECRET);

describe("GET /user/token/get", () => {
  let ctx = applyBeforeAll(TokenGet);

  afterEach(async () => {
    const { usersCollection, gamesCollection } = ctx;
    await cleanupTestContext({ usersCollection, gamesCollection });
  });

  it("should get token", async () => {
    const user = await createUser(ctx.usersCollection, { role: Roles.ADMIN });
    ctx.setTestUserId(user.id);
    await apiRequestSuccess(
      ctx.app,
      "get",
      Routes.User.TOKEN_GET,
      ctx.getToken,
      user.id,
      { secret: TOKEN_SECRET },
    );
  });

  it("should get error", async () => {
    const error = {
      status: 403,
      error: "UserNotAuthorized",
      message: "User is not authorized to perform this action",
    };
    const user = await createUser(ctx.usersCollection, { role: Roles.ADMIN });
    ctx.setTestUserId(user.id);
    await apiRequestError(
      ctx.app,
      "get",
      Routes.User.TOKEN_GET,
      ctx.getToken,
      user.id,
      { secret: "zblept" },
      error,
    );
  });
});
