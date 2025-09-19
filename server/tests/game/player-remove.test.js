require("../services/setup-db");
const GamePlayerRemove = require("../../src/routes/game/player-remove");
const Routes = require("../../../shared/constants/routes");
const {
  initialGame,
  basicUser,
  activeGame,
} = require("../helpers/default-mocks");
const {
  cleanupTestContext,
  createUser,
  apiRequestSuccess,
  apiRequestError,
} = require("../test-helpers");
const {
  Roles,
  States,
} = require("../../../shared/constants/game-constants.json");
const applyBeforeAll = require("../helpers/before-all-helper");
const GamesRepository = require("../../src/models/games-repository");

describe("POST /game/player/remove", () => {
  let ctx = applyBeforeAll(GamePlayerRemove);
  afterEach(async () => {
    const { usersCollection, gamesCollection } = ctx;
    await cleanupTestContext({ usersCollection, gamesCollection });
  });

  it("should be able to remove a player", async () => {
    const user = await createUser(ctx.usersCollection);
    ctx.setTestUserId(user.id);
    const mockGame = initialGame({
      user: basicUser({ ...user, userId: user.id }),
    });
    await ctx.gamesCollection.insertOne(mockGame);
    const response = await apiRequestSuccess(
      ctx.app,
      "post",
      Routes.Game.PLAYER_REMOVE,
      ctx.getToken,
      user.id,
      { userId: user.id, gameCode: mockGame.code },
    );

    expect(response.body.playerList).toBeDefined();
    expect(response.body.playerList.length).toBe(1);
  });
  it("Failed to remove a player", async () => {
    const error = {
      status: 500,
      name: "FailedToRemovePlayer",
      message: "Failed to remove player",
    };
    const mocked = jest
      .spyOn(GamesRepository.prototype, "update")
      .mockImplementation(() => {
        throw new Error();
      });
    const user = await createUser(ctx.usersCollection);
    ctx.setTestUserId(user.id);
    const mockGame = initialGame({
      user: basicUser({ ...user, userId: user.id }),
    });
    await ctx.gamesCollection.insertOne(mockGame);
    await apiRequestError(
      ctx.app,
      "post",
      Routes.Game.PLAYER_REMOVE,
      ctx.getToken,
      user.id,
      { userId: user.id, gameCode: mockGame.code },
      error,
    );
    mocked.mockRestore();
  });

  it("should be able to remove a player - activegame", async () => {
    const user = await createUser(ctx.usersCollection);
    ctx.setTestUserId(user.id);
    const mockGame = activeGame({
      numberOfPlayers: 5,
      user: basicUser({ ...user, userId: user.id, creator: true }),
    });
    const game = await ctx.gamesCollection.insertOne(mockGame);
    const response = await apiRequestSuccess(
      ctx.app,
      "post",
      Routes.Game.PLAYER_REMOVE,
      ctx.getToken,
      user.id,
      { userId: user.id, gameId: game.insertedId.toString() },
    );
    const deletedPlayer = mockGame.playerList.find(
      (player) => player.userId === user.id,
    );

    expect(response.body.deck.length).not.toBe(mockGame.deck.length);
    expect(response.body.deck.length).toBe(
      mockGame.deck.length +
        deletedPlayer.hand.length +
        deletedPlayer.bus.length,
    );
  });

  it("should be able to remove a game- last player - it will deletes the game", async () => {
    const user = await createUser(ctx.usersCollection);
    ctx.setTestUserId(user.id);
    const mockGame = initialGame({
      playerList: [basicUser({ ...user, userId: user.id })],
    });
    await ctx.gamesCollection.insertOne(mockGame);
    const response = await apiRequestSuccess(
      ctx.app,
      "post",
      Routes.Game.PLAYER_REMOVE,
      ctx.getToken,
      user.id,
      { userId: user.id, gameCode: mockGame.code },
    );

    expect(response.body.playerList).toBeUndefined();
  });

  it("should be able to remove a game- creator", async () => {
    const user = await createUser(ctx.usersCollection);
    ctx.setTestUserId(user.id);
    const mockGame = initialGame({
      user: { ...user, userId: user.id, creator: true },
    });
    await ctx.gamesCollection.insertOne(mockGame);
    const response = await apiRequestSuccess(
      ctx.app,
      "post",
      Routes.Game.PLAYER_REMOVE,
      ctx.getToken,
      user.id,
      { userId: user.id, gameCode: mockGame.code },
    );

    expect(response.body.playerList.length).toBe(1);
  });

  it("should be able to remove a player and close and delete the game", async () => {
    const user = await createUser(ctx.usersCollection);
    ctx.setTestUserId(user.id);
    const mockGame = activeGame({
      playerList: [basicUser({ ...user, userId: user.id })],
    });
    await ctx.gamesCollection.insertOne(mockGame);
    const response = await apiRequestSuccess(
      ctx.app,
      "post",
      Routes.Game.PLAYER_REMOVE,
      ctx.getToken,
      user.id,
      { userId: user.id, gameCode: mockGame.code },
    );

    expect(response.body.state).toBe(States.CLOSED);
  });

  test("should return an error if user does not exist", async () => {
    const error = {
      status: 400,
      name: "UserNotInGame",
      message: "User is not in game",
    };
    const admin = await createUser(ctx.usersCollection, { role: Roles.ADMIN });
    const adminId = admin._id.toString();
    ctx.setTestUserId(adminId);
    const mockGame = initialGame();
    await ctx.gamesCollection.insertOne(mockGame);
    await apiRequestError(
      ctx.app,
      "post",
      Routes.Game.PLAYER_REMOVE,
      ctx.getToken,
      adminId,
      { userId: adminId, gameCode: mockGame.code },
      error,
    );
  });

  test("should return an error if user not allowed to remove player", async () => {
    const error = {
      status: 403,
      name: "UserNotAuthorized",
      message: "User is not authorized to perform this action",
    };
    const user = await createUser(ctx.usersCollection);
    const invalidUser = await createUser(ctx.usersCollection);
    const invalidUserId = invalidUser._id.toString();
    ctx.setTestUserId(invalidUserId);
    const mockGame = initialGame({
      playerList: [basicUser({ ...user, userId: user.id })],
    });
    await ctx.gamesCollection.insertOne(mockGame);
    await apiRequestError(
      ctx.app,
      "post",
      Routes.Game.PLAYER_REMOVE,
      ctx.getToken,
      invalidUserId,
      { userId: user.id, gameCode: mockGame.code },
      error,
    );
  });

  test("should return an error if game does not exist", async () => {
    const error = {
      status: 404,
      name: "GameDoesNotExist",
      message: "Requested game does not exist",
    };
    const admin = await createUser(ctx.usersCollection, { role: Roles.ADMIN });
    const adminId = admin._id.toString();
    ctx.setTestUserId(adminId);
    await apiRequestError(
      ctx.app,
      "post",
      Routes.Game.PLAYER_REMOVE,
      ctx.getToken,
      adminId,
      { userId: adminId, gameCode: "nonexi" },
      error,
    );
  });
});
