require("../services/setup-db");
const GamePlayerSet = require("../../src/routes/game/player-set");
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
describe("POST /game/player-set all", () => {
  describe("POST /game/player-set (standard)", () => {
    let ctx = applyBeforeAll(GamePlayerSet);

    afterEach(async () => {
      const { usersCollection, gamesCollection } = ctx;
      await cleanupTestContext({ usersCollection, gamesCollection });
    });

    it("should set a player to a game", async () => {
      const user = await createUser(ctx.usersCollection);
      ctx.setTestUserId(user.id);
      const mockGame = initialGame({
        user: basicUser({ ...user, userId: user.id }),
      });
      await ctx.gamesCollection.insertOne(mockGame);
      const response = await apiRequestSuccess(
        ctx.app,
        "post",
        Routes.Game.PLAYER_SET,
        ctx.getToken,
        user.id,
        {
          gameCode: mockGame.code,
          ready: true,
          nextGame: false,
        },
      );
      expect(response.body.playerList).toBeDefined();
      expect(response.body.playerList[1].userId).toBe(user.id);
      expect(response.body.playerList[1].ready).toBe(true);
    });
    it("failed to set a player to a game", async () => {
      const error = {
        status: 500,
        name: "FailedToSetPlayer",
        message: "Failed to set player",
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
        Routes.Game.PLAYER_SET,
        ctx.getToken,
        user.id,
        {
          gameCode: mockGame.code,
          ready: true,
          nextGame: false,
        },
        error,
      );
      mocked.mockRestore();
    });

    it("should not set a player to active game", async () => {
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
        Routes.Game.PLAYER_SET,
        ctx.getToken,
        user.id,
        { gameId: game.insertedId.toString(), ready: true },
        error,
      );
    });

    it("should not set a player which is not in a game", async () => {
      const error = {
        status: 400,
        name: "UserNotInGame",
        message: "User is not in game",
      };
      const user = await createUser(ctx.usersCollection);
      ctx.setTestUserId(user.id);
      const mockGame = initialGame();
      const game = await ctx.gamesCollection.insertOne(mockGame);
      await apiRequestError(
        ctx.app,
        "post",
        Routes.Game.PLAYER_SET,
        ctx.getToken,
        user.id,
        { gameId: game.insertedId.toString(), ready: true },
        error,
      );
    });

    it("should set a player to a game", async () => {
      const user = await createUser(ctx.usersCollection);
      ctx.setTestUserId(user.id);
      const mockGame = initialGame({
        user: basicUser({ ...user, userId: user.id }),
      });
      await ctx.gamesCollection.insertOne(mockGame);
      const response = await apiRequestSuccess(
        ctx.app,
        "post",
        Routes.Game.PLAYER_SET,
        ctx.getToken,
        user.id,
        { gameCode: mockGame.code, ready: true },
      );

      expect(response.body.playerList).toBeDefined();
      expect(response.body.playerList[1].userId).toBe(user.id);
      expect(response.body.playerList[1].ready).toBe(true);
    });

    it("should not set a player to active game", async () => {
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
        Routes.Game.PLAYER_SET,
        ctx.getToken,
        user.id,
        { gameId: game.insertedId.toString(), ready: true },
        error,
      );
    });

    it("should not set a player which is not in a game", async () => {
      const error = {
        status: 400,
        name: "UserNotInGame",
        message: "User is not in game",
      };
      const user = await createUser(ctx.usersCollection);
      ctx.setTestUserId(user.id);
      const mockGame = initialGame();
      const game = await ctx.gamesCollection.insertOne(mockGame);
      await apiRequestError(
        ctx.app,
        "post",
        Routes.Game.PLAYER_SET,
        ctx.getToken,
        user.id,
        { gameId: game.insertedId.toString(), ready: true },
        error,
      );
    });

    test("should return an error if game does not exist", async () => {
      const user = await createUser(ctx.usersCollection);
      ctx.setTestUserId(user.id);
      const error = {
        status: 404,
        name: "GameDoesNotExist",
        message: "Requested game does not exist",
      };
      await apiRequestError(
        ctx.app,
        "post",
        Routes.Game.PLAYER_SET,
        ctx.getToken,
        user.id,
        { gameCode: "nonexi" },
        error,
      );
    });
  });
  describe("POST /game/player-set (notExistUser)", () => {
    let ctx = applyBeforeAll(GamePlayerSet, true);

    afterEach(async () => {
      const { usersCollection, gamesCollection } = ctx;
      await cleanupTestContext({ usersCollection, gamesCollection });
    });

    test("should return an error if user does not exist", async () => {
      const mockGame = initialGame();
      await ctx.gamesCollection.insertOne(mockGame);
      const randomId = generateRandomId();
      ctx.setTestUserId(randomId);
      const error = {
        status: 404,
        name: "UserDoesNotExist",
        message: "Requested user does not exist",
      };
      await apiRequestError(
        ctx.app,
        "post",
        Routes.Game.PLAYER_SET,
        ctx.getToken,
        randomId,
        { gameCode: mockGame.code },
        error,
      );
    });
  });
});
