require("../services/setup-db");

const RematchGame = require("../../src/routes/game/rematch");
const Routes = require("../../../shared/constants/routes.json");
const { States } = require("../../../shared/constants/game-constants.json");
const {
  activeGame,
  finishedGame,
  basicUser,
  generateRandomCode,
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

describe("POST /game/rematch", () => {
  describe("standard rematch scenarios", () => {
    let ctx = applyBeforeAll(RematchGame);

    afterEach(async () => {
      const { usersCollection, gamesCollection } = ctx;
      await cleanupTestContext({ usersCollection, gamesCollection });
    });

    it("should rematch a game without creator", async () => {
      const user = await createUser(ctx.usersCollection);
      ctx.setTestUserId(user.id);
      let mockGame = finishedGame({
        user: basicUser({ ...user, userId: user.id }),
      });
      mockGame.playerList[0].nextGame = true;
      delete mockGame.playerList[0].creator;
      mockGame.playerList[1].nextGame = true;
      const game = await ctx.gamesCollection.insertOne(mockGame);
      const response = await apiRequestSuccess(
        ctx.app,
        "post",
        Routes.Game.REMATCH,
        ctx.getToken,
        user.id,
        { gameCode: mockGame.code },
      );
      const finGame = await ctx.gamesCollection.findOne({
        _id: game.insertedId,
      });

      expect(response.body.code).toHaveLength(6);
      expect(response.body.state).toBe(States.INITIAL);
      expect(response.body.playerList[0]?.creator).toBe(true);
      expect(finGame.state).toBe(States.CLOSED);
    });

    it("should rematch a game", async () => {
      const user = await createUser(ctx.usersCollection);
      ctx.setTestUserId(user.id);
      let mockGame = finishedGame({
        user: basicUser({ ...user, userId: user.id }),
      });
      mockGame.playerList[0].nextGame = true;
      mockGame.playerList[1].nextGame = true;
      const game = await ctx.gamesCollection.insertOne(mockGame);
      const response = await apiRequestSuccess(
        ctx.app,
        "post",
        Routes.Game.REMATCH,
        ctx.getToken,
        user.id,
        { gameCode: mockGame.code },
      );
      const finGame = await ctx.gamesCollection.findOne({
        _id: game.insertedId,
      });

      expect(response.body.code).toHaveLength(6);
      expect(response.body.state).toBe(States.INITIAL);
      expect(response.body.playerList[0]?.creator).toBe(true);
      expect(finGame.state).toBe(States.CLOSED);
    });
    it("should fail to create game – db error", async () => {
      const error = {
        status: 500,
        name: "FailedToRematchGame",
        message: "Failed to rematch game",
      };
      const mocked = jest
        .spyOn(GamesRepository.prototype, "uniqueCreate")
        .mockImplementation(() => {
          throw new Error();
        });

      const user = await createUser(ctx.usersCollection);
      ctx.setTestUserId(user.id);

      let mockGame = finishedGame({
        user: basicUser({ ...user, userId: user.id }),
      });
      mockGame.playerList[0].nextGame = true;
      delete mockGame.playerList[0].creator;
      mockGame.playerList[1].nextGame = true;
      await ctx.gamesCollection.insertOne(mockGame);
      await apiRequestError(
        ctx.app,
        "post",
        Routes.Game.REMATCH,
        ctx.getToken,
        user.id,
        { gameCode: mockGame.code },
        error,
      );

      mocked.mockRestore();
    });
    it("should fail rematch if game is not in finished state", async () => {
      const error = {
        status: 400,
        name: "GameIsNotFinished",
        message: "Game has to be in finished state.",
      };
      const user = await createUser(ctx.usersCollection);
      ctx.setTestUserId(user.id);
      const mockGame = activeGame({
        user: basicUser({ ...user, userId: user.id }),
      });
      const game = await ctx.gamesCollection.insertOne(mockGame);
      const finGame = await ctx.gamesCollection.findOne({
        _id: game.insertedId,
      });
      await apiRequestError(
        ctx.app,
        "post",
        Routes.Game.REMATCH,
        ctx.getToken,
        user.id,
        { gameId: game.insertedId.toString() },
        error,
      );
      expect(finGame.state).not.toBe(States.CLOSED);
    });
    it("should fail rematch if user not in previous game", async () => {
      const error = {
        status: 400,
        name: "UserNotInPreviousGame",
        message: "User was not in the previous game",
      };
      const user = await createUser(ctx.usersCollection);
      ctx.setTestUserId(user.id);
      let mockGame = finishedGame({
        user: basicUser(),
      });
      mockGame.playerList[0].nextGame = true;
      mockGame.playerList[1].nextGame = true;
      const game = await ctx.gamesCollection.insertOne(mockGame);
      const finGame = await ctx.gamesCollection.findOne({
        _id: game.insertedId,
      });
      await apiRequestError(
        ctx.app,
        "post",
        Routes.Game.REMATCH,
        ctx.getToken,
        user.id,
        { gameId: game.insertedId.toString() },
        error,
      );
      expect(finGame.state).not.toBe(States.CLOSED);
    });
    it("should fail rematch if NotEnoughPlayersForRematch", async () => {
      const error = {
        status: 400,
        name: "NotEnoughPlayersForRematch",
        message: "Not enough players for rematch",
      };
      const user = await createUser(ctx.usersCollection);
      ctx.setTestUserId(user.id);
      let mockGame = finishedGame({
        user: basicUser({ ...user, userId: user.id }),
      });
      mockGame.playerList[0].nextGame = true;
      mockGame.playerList[1].nextGame = false;
      const game = await ctx.gamesCollection.insertOne(mockGame);
      const finGame = await ctx.gamesCollection.findOne({
        _id: game.insertedId,
      });
      await apiRequestError(
        ctx.app,
        "post",
        Routes.Game.REMATCH,
        ctx.getToken,
        user.id,
        { gameId: game.insertedId.toString() },
        error,
      );
      expect(finGame.state).not.toBe(States.CLOSED);
    });
  });

  describe("user does not exist", () => {
    let ctx = applyBeforeAll(RematchGame, true);

    afterEach(async () => {
      const { usersCollection, gamesCollection } = ctx;
      await cleanupTestContext({ usersCollection, gamesCollection });
    });
    it("should return an error if user does not exist", async () => {
      const error = {
        status: 404,
        name: "UserDoesNotExist",
        message: "Requested user does not exist",
      };
      const randomUserId = generateRandomId();
      ctx.setTestUserId(randomUserId);
      await apiRequestError(
        ctx.app,
        "post",
        Routes.Game.REMATCH,
        ctx.getToken,
        randomUserId,
        { gameCode: generateRandomCode() },
        error,
      );
    });
  });
});
