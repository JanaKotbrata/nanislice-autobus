require("../services/setup-db");
const CloseGame = require("../../src/routes/game/close");
const Routes = require("../../../shared/constants/routes.json");
const { States } = require("../../../shared/constants/game-constants.json");
const { activeGame, generateRandomCode } = require("../helpers/default-mocks");
const applyBeforeAll = require("../helpers/before-all-helper");
const {
  cleanupTestContext,
  createUser,
  apiRequestSuccess,
  apiRequestError,
} = require("../test-helpers");

describe("POST /game/close", () => {
  let ctx = applyBeforeAll(CloseGame);

  afterEach(async () => {
    const { usersCollection, gamesCollection } = ctx;
    await cleanupTestContext({ usersCollection, gamesCollection });
  });

  it("should close a game by CODE", async () => {
    const user = await createUser(ctx.usersCollection);
    ctx.setTestUserId(user.id);
    const mockGame = activeGame({
      user: { ...user, userId: user.id, creator: true },
    });
    await ctx.gamesCollection.insertOne(mockGame);
    const response = await apiRequestSuccess(
      ctx.app,
      "post",
      Routes.Game.CLOSE,
      ctx.getToken,
      user.id,
      { gameCode: mockGame.code },
    );

    expect(response.body.state).toBe(States.CLOSED);
    expect(response.body.code).toBe(mockGame.code + "-#closed#");
  });

  it("should not close a game by CODE- UserIsNotAllowedToCloseGame", async () => {
    const error = {
      status: 403,
      name: "UserIsNotAllowedToCloseGame",
      message: "User is not allowed to close this game",
    };
    const user = await createUser(ctx.usersCollection);
    ctx.setTestUserId(user.id);
    const mockGame = activeGame({ user: { ...user, userId: user.id } });
    await ctx.gamesCollection.insertOne(mockGame);
    await apiRequestError(
      ctx.app,
      "post",
      Routes.Game.CLOSE,
      ctx.getToken,
      user.id,
      { gameCode: mockGame.code },
      error,
    );
  });

  test("CODE must be string with length 6", async () => {
    const error = {
      status: 400,
      name: "InvalidDataError",
      message: '"gameCode" must be a string',
    };
    const user = await createUser(ctx.usersCollection);
    ctx.setTestUserId(user.id);
    await apiRequestError(
      ctx.app,
      "post",
      Routes.Game.CLOSE,
      ctx.getToken,
      user.id,
      {
        gameCode: 1,
      },
      error,
    );
  });

  it("should return an error if game does not exist", async () => {
    const error = {
      status: 404,
      name: "GameDoesNotExist",
      message: "Requested game does not exist",
    };
    const user = await createUser(ctx.usersCollection);
    ctx.setTestUserId(user.id);
    await apiRequestError(
      ctx.app,
      "post",
      Routes.Game.CLOSE,
      ctx.getToken,
      user.id,
      { gameCode: generateRandomCode() },
      error,
    );
  });
});
