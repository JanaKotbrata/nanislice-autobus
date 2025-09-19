require("../services/setup-db");
const GamePlayerSetOrder = require("../../src/routes/game/player-set-order");
const Routes = require("../../../shared/constants/routes.json");
const {
  initialGame,
  generateRandomId,
  basicUser,
  activeGame,
} = require("../helpers/default-mocks");
const {
  cleanupTestContext,
  createUser,
  apiRequestSuccess,
  apiRequestError,
} = require("../test-helpers");
const applyBeforeAll = require("../helpers/before-all-helper");
const GamesRepository = require("../../src/models/games-repository");

describe("POST /game/player-set-order", () => {
  let ctx = applyBeforeAll(GamePlayerSetOrder);

  afterEach(async () => {
    const { usersCollection, gamesCollection } = ctx;
    await cleanupTestContext({ usersCollection, gamesCollection });
  });

  it("should set a players order", async () => {
    const user = await createUser(ctx.usersCollection);
    ctx.setTestUserId(user.id);
    const mockGame = initialGame({
      user: basicUser({ ...user, userId: user.id }),
    });
    mockGame.playerList[0].creator = false;
    mockGame.playerList[1].creator = true;
    const playerList = [mockGame.playerList[1], mockGame.playerList[0]];
    await ctx.gamesCollection.insertOne(mockGame);
    const response = await apiRequestSuccess(
      ctx.app,
      "post",
      Routes.Game.PLAYER_SET_ORDER,
      ctx.getToken,
      user.id,
      { playerList, gameCode: mockGame.code },
    );

    expect(response.body.playerList).toBeDefined();
    for (let i = 0; i < playerList.length; i++) {
      expect(response.body.playerList[i].userId).toBe(playerList[i].userId);
      expect(response.body.playerList[i].name).toBe(playerList[i].name);
    }
  });
  it("failed to set a players order", async () => {
    const error = {
      status: 500,
      name: "FailedToSetPlayersOrder",
      message: "Failed to set players order",
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
    mockGame.playerList[0].creator = false;
    mockGame.playerList[1].creator = true;
    const playerList = [mockGame.playerList[1], mockGame.playerList[0]];
    await ctx.gamesCollection.insertOne(mockGame);
    await apiRequestError(
      ctx.app,
      "post",
      Routes.Game.PLAYER_SET_ORDER,
      ctx.getToken,
      user.id,
      { playerList, gameCode: mockGame.code },
      error,
    );
    mocked.mockRestore();
  });

  it("should not set players order to active game", async () => {
    const error = {
      status: 400,
      name: "GameAlreadyActive",
      message: "Game is already active is not possible to add player.",
    };
    const user = await createUser(ctx.usersCollection);
    ctx.setTestUserId(user.id);
    const mockGame = activeGame({
      user: basicUser({ ...user, userId: user.id }),
    });
    const game = await ctx.gamesCollection.insertOne(mockGame);
    await apiRequestError(
      ctx.app,
      "post",
      Routes.Game.PLAYER_SET_ORDER,
      ctx.getToken,
      user.id,
      { playerList: [], gameId: game.insertedId.toString() },
      error,
    );
  });

  it("should not set an order players - players are longer", async () => {
    const error = {
      status: 400,
      name: "InvalidPlayerList",
      message: "Invalid player list",
    };
    const user = await createUser(ctx.usersCollection);
    user.creator = true;
    ctx.setTestUserId(user.id);
    const mockGame = initialGame({ user: { ...user, userId: user.id } });
    const game = await ctx.gamesCollection.insertOne(mockGame);
    const playerList = [
      mockGame.playerList[1],
      mockGame.playerList[0],
      { userId: generateRandomId(), name: "name" },
    ];
    await apiRequestError(
      ctx.app,
      "post",
      Routes.Game.PLAYER_SET_ORDER,
      ctx.getToken,
      user.id,
      { playerList, gameId: game.insertedId.toString() },
      error,
    );
  });

  it("should not set an order players - playerList contains different values", async () => {
    const error = {
      status: 400,
      name: "InvalidPlayerList",
      message: "Invalid player list",
    };
    const user = await createUser(ctx.usersCollection);
    user.creator = true;
    ctx.setTestUserId(user.id);
    const mockGame = initialGame({ user: { ...user, userId: user.id } });
    const game = await ctx.gamesCollection.insertOne(mockGame);
    const playerList = [
      mockGame.playerList[1],
      { userId: generateRandomId(), name: "name" },
    ];
    await apiRequestError(
      ctx.app,
      "post",
      Routes.Game.PLAYER_SET_ORDER,
      ctx.getToken,
      user.id,
      { playerList, gameId: game.insertedId.toString() },
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
      Routes.Game.PLAYER_SET_ORDER,
      ctx.getToken,
      user.id,
      { playerList: [], gameCode: "nonexi" },
      error,
    );
  });
  test("should return an error if UserNotInGame", async () => {
    const error = {
      status: 400,
      name: "UserNotInGame",
      message: "User is not in game",
    };
    const user = await createUser(ctx.usersCollection);
    ctx.setTestUserId(user.id);
    const mockGame = initialGame();
    const game = await ctx.gamesCollection.insertOne(mockGame);
    const playerList = [
      mockGame.playerList[0],
      { userId: user.id, name: "name" },
    ];

    await apiRequestError(
      ctx.app,
      "post",
      Routes.Game.PLAYER_SET_ORDER,
      ctx.getToken,
      user.id,
      { playerList, gameId: game.insertedId.toString() },
      error,
    );
  });
  test("should return an error if user is not creator", async () => {
    const error = {
      status: 403,
      name: "UserCanNotSetPlayers",
      message: "User is not allowed to set players",
    };
    const user = await createUser(ctx.usersCollection);
    ctx.setTestUserId(user.id);
    const mockGame = initialGame({ user: { ...user, userId: user.id } });
    const game = await ctx.gamesCollection.insertOne(mockGame);
    const playerList = mockGame.playerList;

    await apiRequestError(
      ctx.app,
      "post",
      Routes.Game.PLAYER_SET_ORDER,
      ctx.getToken,
      user.id,
      { playerList, gameId: game.insertedId.toString() },
      error,
    );
  });
});
