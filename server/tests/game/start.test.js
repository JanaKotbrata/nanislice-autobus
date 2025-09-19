require("../services/setup-db");
const StartGame = require("../../src/routes/game/start");
const Routes = require("../../../shared/constants/routes.json");
const { States } = require("../../../shared/constants/game-constants.json");
const {
  activeGame,
  generateRandomCode,
  getPlayerList,
  initialGame,
  closedGame,
} = require("../helpers/default-mocks");

const {
  cleanupTestContext,
  createUser,
  apiRequestSuccess,
  apiRequestError,
} = require("../test-helpers");
const applyBeforeAll = require("../helpers/before-all-helper");
const RematchGame = require("../../src/routes/game/rematch");
const GamesRepository = require("../../src/models/games-repository");

describe("POST /game/start", () => {
  let ctx = applyBeforeAll(StartGame);

  afterEach(async () => {
    const { usersCollection, gamesCollection } = ctx;
    await cleanupTestContext({ usersCollection, gamesCollection });
  });

  it("should start a game", async () => {
    const user = await createUser(ctx.usersCollection);
    ctx.setTestUserId(user.id);

    const playerList = getPlayerList();
    playerList[0].userId = user.id;
    const mockGame = initialGame({ playerList });
    await ctx.gamesCollection.insertOne(mockGame);

    const response = await apiRequestSuccess(
      ctx.app,
      "post",
      Routes.Game.START,
      ctx.getToken,
      user.id,
      { gameCode: mockGame.code },
    );

    expect(response.body.state).toBe(States.ACTIVE);
    expect(response.body.deck).toBeDefined();
    expect(response.body.playerList[0].hand).toBeDefined();
    expect(response.body.playerList[0].bus).toBeDefined();
    expect(response.body.playerList[0].busStop).toBeDefined();
  });
  it("failed to start a game", async () => {
    const error = {
      status: 500,
      name: "UpdateGameFailed",
      message: "Failed to update game",
    };
    const mocked = jest
      .spyOn(GamesRepository.prototype, "update")
      .mockImplementation(() => {
        throw new Error();
      });
    const user = await createUser(ctx.usersCollection);
    ctx.setTestUserId(user.id);

    const playerList = getPlayerList();
    playerList[0].userId = user.id;
    const mockGame = initialGame({ playerList });
    await ctx.gamesCollection.insertOne(mockGame);

    await apiRequestError(
      ctx.app,
      "post",
      Routes.Game.START,
      ctx.getToken,
      user.id,
      { gameCode: mockGame.code },
      error,
    );
    mocked.mockRestore();
  });
  it("should start a game if is ACTIVE", async () => {
    const user = await createUser(ctx.usersCollection);
    ctx.setTestUserId(user.id);

    const playerList = getPlayerList();
    playerList[0].userId = user.id;
    const mockGame = activeGame({ playerList });
    await ctx.gamesCollection.insertOne(mockGame);

    const response = await apiRequestSuccess(
      ctx.app,
      "post",
      Routes.Game.START,
      ctx.getToken,
      user.id,
      { gameCode: mockGame.code },
    );

    expect(response.body.state).toBe(States.ACTIVE);
  });
  it("should return an error if game is closed", async () => {
    const error = {
      name: "GameIsClosed",
      message: "Failed to start game, game is closed",
      status: 400,
    };
    const user = await createUser(ctx.usersCollection);
    ctx.setTestUserId(user.id);
    const mockGame = closedGame({ user: { ...user, userId: user.id } });
    const game = await ctx.gamesCollection.insertOne(mockGame);
    await apiRequestError(
      ctx.app,
      "post",
      Routes.Game.START,
      ctx.getToken,
      user.id,
      { gameId: game.insertedId.toString() },
      error,
    );
  });
  it("should return an error if startes is not creator", async () => {
    const error = {
      name: "UserCanNotStartGame",
      message: "User is not allowed to start the game",
      status: 403,
    };
    const user = await createUser(ctx.usersCollection);
    ctx.setTestUserId(user.id);
    const mockGame = initialGame({ user: { ...user, userId: user.id } });
    const game = await ctx.gamesCollection.insertOne(mockGame);

    await apiRequestError(
      ctx.app,
      "post",
      Routes.Game.START,
      ctx.getToken,
      user.id,
      { gameId: game.insertedId.toString() },
      error,
    );
  });
  it("should return an error if game does not exist", async () => {
    const error = {
      name: "GameDoesNotExist",
      message: "Requested game does not exist",
      status: 404,
    };
    const user = await createUser(ctx.usersCollection);
    ctx.setTestUserId(user.id);
    await apiRequestError(
      ctx.app,
      "post",
      Routes.Game.START,
      ctx.getToken,
      user.id,
      { gameCode: generateRandomCode() },
      error,
    );
  });
});
