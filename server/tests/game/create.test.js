require("../services/setup-db");

const CreateGame = require("../../src/routes/game/create");
const GamesRepository = require("../../src/models/games-repository");
const Routes = require("../../../shared/constants/routes.json");
const { States } = require("../../../shared/constants/game-constants.json");
const {
  generateRandomId,
  closedGame,
  initialGame,
  activeGame,
} = require("../helpers/default-mocks");
const {
  cleanupTestContext,
  createUser,
  apiRequestSuccess,
  apiRequestError,
} = require("../test-helpers");
const applyBeforeAll = require("../helpers/before-all-helper");

describe("POST /game/create (all)", () => {
  describe("valid user", () => {
    let ctx = applyBeforeAll(CreateGame);

    afterEach(async () => {
      const { usersCollection, gamesCollection } = ctx;
      await cleanupTestContext({ usersCollection, gamesCollection });
    });

    it("should create a game", async () => {
      const user = await createUser(ctx.usersCollection);
      ctx.setTestUserId(user.id);
      const response = await apiRequestSuccess(
        ctx.app,
        "post",
        Routes.Game.CREATE,
        ctx.getToken,
        user.id,
        {},
      );
      expect(response.body.code).toHaveLength(6);
      expect(response.body.state).toBe(States.INITIAL);
    });

    it("should return existing game", async () => {
      const user = await createUser(ctx.usersCollection);
      ctx.setTestUserId(user.id);
      const mockGame = activeGame({ user: { ...user, userId: user.id } });
      await ctx.gamesCollection.insertOne(mockGame);
      const response = await apiRequestSuccess(
        ctx.app,
        "post",
        Routes.Game.CREATE,
        ctx.getToken,
        user.id,
      );
      expect(response.body.code).toHaveLength(6);
      expect(response.body.state).toBe(States.ACTIVE);
    });

    it("should create a game – some closed game exist", async () => {
      const user = await createUser(ctx.usersCollection);
      ctx.setTestUserId(user.id);
      const closed = closedGame({ user });
      const game = await ctx.gamesCollection.insertOne(closed);
      const response = await apiRequestSuccess(
        ctx.app,
        "post",
        Routes.Game.CREATE,
        ctx.getToken,
        user.id,
      );

      expect(response.body.id).not.toBe(game.insertedId.toString());
      expect(response.body.code).toHaveLength(6);
      expect(response.body.state).toBe(States.INITIAL);
    });

    it("should create a game – some game exist", async () => {
      const user = await createUser(ctx.usersCollection);
      ctx.setTestUserId(user.id);
      await ctx.gamesCollection.insertOne(
        initialGame({ user: { ...user, userId: user.id } }),
      );
      const response = await apiRequestSuccess(
        ctx.app,
        "post",
        Routes.Game.CREATE,
        ctx.getToken,
        user.id,
      );

      expect(response.body.state).toBe(States.INITIAL);
    });

    it("should fail to create game – db error", async () => {
      const error = {
        status: 500,
        name: "FailedToCreateGame",
        message: "Failed to create game",
      };
      const mocked = jest
        .spyOn(GamesRepository.prototype, "create")
        .mockImplementation(() => {
          throw new Error();
        });

      const user = await createUser(ctx.usersCollection);
      ctx.setTestUserId(user.id);
      await apiRequestError(
        ctx.app,
        "post",
        Routes.Game.CREATE,
        ctx.getToken,
        user.id,
        {},
        error,
      );

      mocked.mockRestore();
    });
  });
  describe("user does not exist", () => {
    let ctx = applyBeforeAll(CreateGame, true);

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
        Routes.Game.CREATE,
        ctx.getToken,
        randomUserId,
        {},
        error,
      );
    });
  });
});
