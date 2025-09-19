require("../services/setup-db");

const GamePlayerAdd = require("../../src/routes/game/player-add");
const Routes = require("../../../shared/constants/routes.json");
const {
  activeGame,
  initialGame,
  generateRandomId,
} = require("../helpers/default-mocks");

const {
  cleanupTestContext,
  createUser,
  apiRequestSuccess,
  apiRequestError,
} = require("../test-helpers");
const applyBeforeAll = require("../helpers/before-all-helper");
const GamesRepository = require("../../src/models/games-repository");

describe("POST /game/player-add", () => {
  let ctx = applyBeforeAll(GamePlayerAdd);

  afterEach(async () => {
    const { usersCollection, gamesCollection } = ctx;
    await cleanupTestContext({ usersCollection, gamesCollection });
  });

  it("should add a player to a game", async () => {
    const user = await createUser(ctx.usersCollection);
    ctx.setTestUserId(user.id);
    const mockGame = initialGame();
    await ctx.gamesCollection.insertOne(mockGame);
    const response = await apiRequestSuccess(
      ctx.app,
      "post",
      Routes.Game.PLAYER_ADD,
      ctx.getToken,
      user.id,
      { gameCode: mockGame.code },
    );
    expect(response.body.playerList).toBeDefined();
    expect(response.body.playerList[1].userId).toBe(user.id);
  });
  it("failed to add a player to a game", async () => {
    const error = {
      status: 500,
      name: "FailedToAddPlayer",
      message: "Failed to add player",
    };
    const mocked = jest
      .spyOn(GamesRepository.prototype, "update")
      .mockImplementation(() => {
        throw new Error();
      });
    const user = await createUser(ctx.usersCollection);
    ctx.setTestUserId(user.id);
    const mockGame = initialGame();
    await ctx.gamesCollection.insertOne(mockGame);
    await apiRequestError(
      ctx.app,
      "post",
      Routes.Game.PLAYER_ADD,
      ctx.getToken,
      user.id,
      { gameCode: mockGame.code },
      error,
    );
    mocked.mockRestore();
  });

  it("should not add a player into active game", async () => {
    const error = {
      status: 400,
      name: "GameAlreadyActive",
      message: "Game is already active is not possible to add player.",
    };
    const user = await createUser(ctx.usersCollection);
    ctx.setTestUserId(user.id);
    const mockGame = activeGame();
    await ctx.gamesCollection.insertOne(mockGame);
    await apiRequestError(
      ctx.app,
      "post",
      Routes.Game.PLAYER_ADD,
      ctx.getToken,
      user.id,
      { gameCode: mockGame.code },
      error,
    );
  });

  it("should not add a same player into game", async () => {
    const error = {
      status: 400,
      name: "PlayerAlreadyInGame",
      message: "Player already in game",
    };
    const user = await createUser(ctx.usersCollection);
    ctx.setTestUserId(user.id);
    const mockGame = initialGame({ user: { ...user, userId: user.id } });
    await ctx.gamesCollection.insertOne(mockGame);
    await apiRequestError(
      ctx.app,
      "post",
      Routes.Game.PLAYER_ADD,
      ctx.getToken,
      user.id,
      { gameCode: mockGame.code },
      error,
    );
  });

  test("should return an error if game does not exist", async () => {
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
      Routes.Game.PLAYER_ADD,
      ctx.getToken,
      user.id,
      { gameId: generateRandomId() },
      error,
    );
  });
});

describe("Player add - not exist user", () => {
  let ctx = applyBeforeAll(GamePlayerAdd, true);

  afterEach(async () => {
    const { usersCollection, gamesCollection } = ctx;
    await cleanupTestContext({ usersCollection, gamesCollection });
  });

  test("should return an error if user does not exist", async () => {
    const error = {
      status: 404,
      name: "UserDoesNotExist",
      message: "Requested user does not exist",
    };
    const mockGame = initialGame();
    await ctx.gamesCollection.insertOne(mockGame);
    await apiRequestError(
      ctx.app,
      "post",
      Routes.Game.PLAYER_ADD,
      ctx.getToken,
      generateRandomId(),
      { gameCode: mockGame.code },
      error,
    );
  });
});
