require("../services/setup-db");

const GetGame = require("../../src/routes/game/get");
const Routes = require("../../../shared/constants/routes.json");
const { Roles } = require("../../../shared/constants/game-constants.json");
const { generateGameCode } = require("../../src/utils/code-helper");
const { initialGame, basicUser } = require("../helpers/default-mocks");
const {
  cleanupTestContext,
  createUser,
  apiRequestSuccess,
  apiRequestError,
  apiRequest,
} = require("../test-helpers");
const applyBeforeAll = require("../helpers/before-all-helper");

describe("GET /game/get", () => {
  let ctx = applyBeforeAll(GetGame);

  afterEach(async () => {
    const { usersCollection, gamesCollection } = ctx;
    await cleanupTestContext({ usersCollection, gamesCollection });
  });

  it("should return a game by ID", async () => {
    const user = await createUser(ctx.usersCollection, { role: Roles.ADMIN });
    ctx.setTestUserId(user.id);
    const mockGame = initialGame({
      user: basicUser({ ...user, userId: user.id }),
    });
    const game = await ctx.gamesCollection.insertOne(mockGame);
    const id = game.insertedId.toString();
    const response = await apiRequestSuccess(
      ctx.app,
      "get",
      Routes.Game.GET,
      ctx.getToken,
      user.id,
      { id },
    );

    expect(response.body.id).toBe(id);
    expect(response.body.code).toBe(mockGame.code);
  });

  it("should return a game by CODE", async () => {
    const user = await createUser(ctx.usersCollection, { role: Roles.ADMIN });
    ctx.setTestUserId(user.id);
    const mockGame = { code: generateGameCode(), playerList: [] };
    await ctx.gamesCollection.insertOne(mockGame);
    const response = await apiRequestSuccess(
      ctx.app,
      "get",
      Routes.Game.GET,
      ctx.getToken,
      user.id,
      { code: mockGame.code },
    );

    expect(response.body.code).toBe(mockGame.code);
  });
  it("should return a warning ", async () => {
    const user = await createUser(ctx.usersCollection, { role: Roles.ADMIN });
    ctx.setTestUserId(user.id);
    const response = await apiRequest(
      ctx.app,
      "get",
      Routes.Game.GET,
      ctx.getToken,
      user.id,
      { code: generateGameCode() },
    );
    //expect(response.status).toBe(200);
    expect(response.body.success).toBe(false);
    expect(response.body.warning.code).toBe("gameNotFound");
    expect(response.body.warning.message).toBe(
      "The requested game has not been found.",
    );
  });
  it("should not return a game by CODE - UserNotAuthorized", async () => {
    const error = {
      status: 403,
      name: "UserNotAuthorized",
      message: "User is not authorized to perform this action",
    };
    const user = await createUser(ctx.usersCollection, { role: "undefined" });
    ctx.setTestUserId(user.id);
    const mockGame = initialGame({
      user: basicUser({ ...user, userId: user.id }),
    });
    await ctx.gamesCollection.insertOne(mockGame);
    await apiRequestError(
      ctx.app,
      "get",
      Routes.Game.GET,
      ctx.getToken,
      user.id,
      { code: mockGame.code },
      error,
    );
  });

  test("CODE must be string with length 6", async () => {
    const error = {
      status: 400,
      name: "InvalidDataError",
      message: '"code" length must be 6 characters long',
    };
    const user = await createUser(ctx.usersCollection, { role: Roles.ADMIN });
    ctx.setTestUserId(user.id);
    await apiRequestError(
      ctx.app,
      "get",
      Routes.Game.GET,
      ctx.getToken,
      user.id,
      { code: 1 },
      error,
    );
  });

  test("ID must be id", async () => {
    const error = {
      status: 400,
      name: "InvalidDataError",
      message: '"id" length must be 24 characters long',
    };
    const user = await createUser(ctx.usersCollection, { role: Roles.ADMIN });
    ctx.setTestUserId(user.id);
    await apiRequestError(
      ctx.app,
      "get",
      Routes.Game.GET,
      ctx.getToken,
      user.id,
      { id: 1 },
      error,
    );
  });
});
