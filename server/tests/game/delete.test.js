require("../services/setup-db");
const DeleteGame = require("../../src/routes/game/delete");
const Routes = require("../../../shared/constants/routes.json");
const { initialGame, generateRandomCode } = require("../helpers/default-mocks");
const {
  cleanupTestContext,
  createUser,
  apiRequestSuccess,
  apiRequestError,
} = require("../test-helpers");
const { Roles } = require("../../../shared/constants/game-constants.json");
const applyBeforeAll = require("../helpers/before-all-helper");
const GamesRepository = require("../../src/models/games-repository");

describe("POST /game/delete", () => {
  let ctx = applyBeforeAll(DeleteGame);
  afterEach(async () => {
    const { usersCollection, gamesCollection } = ctx;
    await cleanupTestContext({ usersCollection, gamesCollection });
  });

  it("should delete a game ADMIN", async () => {
    const user = await createUser(ctx.usersCollection, { role: Roles.ADMIN });
    ctx.setTestUserId(user.id);
    const mockGame = initialGame({ user: { ...user, userId: user.id } });
    const game = await ctx.gamesCollection.insertOne(mockGame);
    const id = game.insertedId.toString();
    await apiRequestSuccess(
      ctx.app,
      "post",
      Routes.Game.DELETE,
      ctx.getToken,
      user.id,
      { id },
    );
  });
  it("failed to delete a game ADMIN", async () => {
    const error = {
      status: 500,
      code: "FailedToDeleteGame",
      message: "Failed to delete game",
    };
    const mocked = jest
      .spyOn(GamesRepository.prototype, "delete")
      .mockImplementation(() => {
        throw new Error();
      });
    const user = await createUser(ctx.usersCollection, { role: Roles.ADMIN });
    ctx.setTestUserId(user.id);
    const mockGame = initialGame({ user: { ...user, userId: user.id } });
    const game = await ctx.gamesCollection.insertOne(mockGame);
    const id = game.insertedId.toString();
    await apiRequestError(
      ctx.app,
      "post",
      Routes.Game.DELETE,
      ctx.getToken,
      user.id,
      { id },
      error,
    );
    mocked.mockRestore();
  });

  it("should delete a game creator", async () => {
    const user = await createUser(ctx.usersCollection);
    ctx.setTestUserId(user.id);
    const mockGame = initialGame({ user: { ...user, userId: user.id } });
    mockGame.playerList[1].creator = true;
    const game = await ctx.gamesCollection.insertOne(mockGame);
    const id = game.insertedId.toString();
    await apiRequestSuccess(
      ctx.app,
      "post",
      Routes.Game.DELETE,
      ctx.getToken,
      user.id,
      { id },
    );
  });
  it("should return an error if game does not exist", async () => {
    const error = {
      status: 404,
      code: "GameDoesNotExist",
      message: "Requested game does not exist",
    };
    const user = await createUser(ctx.usersCollection, { role: Roles.ADMIN });
    ctx.setTestUserId(user.id);
    await apiRequestError(
      ctx.app,
      "post",
      Routes.Game.DELETE,
      ctx.getToken,
      user.id,
      { code: generateRandomCode() },
      error,
    );
  });
  it("should return an error if UserIsNotAllowedToDeleteGame", async () => {
    const error = {
      status: 403,
      code: "UserIsNotAllowedToDeleteGame",
      message: "User is not allowed to delete this game",
    };
    const user = await createUser(ctx.usersCollection);
    ctx.setTestUserId(user.id);
    const mockGame = initialGame({ user: { ...user, userId: user.id } });
    const game = await ctx.gamesCollection.insertOne(mockGame);
    const id = game.insertedId.toString();
    await apiRequestError(
      ctx.app,
      "post",
      Routes.Game.DELETE,
      ctx.getToken,
      user.id,
      { id },
      error,
    );
  });
});
