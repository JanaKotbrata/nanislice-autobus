require("../../services/setup-db");

const ProcessAction = require("../../../src/routes/game/action-process");
const Routes = require("../../../../shared/constants/routes.json");
const GameActions = require("../../../../shared/constants/game-actions.json");
const { activeGame, basicUser } = require("../../helpers/default-mocks");
const {
  cleanupTestContext,
  createUser,
  apiRequestSuccess,
  apiRequestError,
} = require("../../test-helpers");
const applyBeforeAll = require("../../helpers/before-all-helper");

describe("POST /game/action/process - drawcard", () => {
  let ctx = applyBeforeAll(ProcessAction);

  afterEach(async () => {
    const { usersCollection, gamesCollection } = ctx;
    await cleanupTestContext({ usersCollection, gamesCollection });
  });

  it("Draw card", async () => {
    const user = await createUser(ctx.usersCollection);
    ctx.setTestUserId(user.id);
    const mockGame = activeGame({
      handNumber: 4,
      user: basicUser({ ...user, userId: user.id }, { isCardDrawed: false }),
    });
    const game = await ctx.gamesCollection.insertOne(mockGame);
    const response = await apiRequestSuccess(
      ctx.app,
      "post",
      Routes.Game.ACTION_PROCESS,
      ctx.getToken,
      user.id,
      { gameId: game.insertedId.toString(), action: GameActions.DRAW_CARD },
    );

    expect(response.body.newGame.deck).toHaveLength(mockGame.deck.length - 1);
  });

  it("Draw card - NotPossibleToDraw", async () => {
    const error = {
      status: 400,
      name: "NotPossibleToDraw",
      message: "Not possible to draw card",
    };
    const user = await createUser(ctx.usersCollection);
    ctx.setTestUserId(user.id);
    const mockGame = activeGame({
      handNumber: 4,
      user: basicUser({ ...user, userId: user.id }, { isCardDrawed: true }),
    });
    const game = await ctx.gamesCollection.insertOne(mockGame);
    await apiRequestError(
      ctx.app,
      "post",
      Routes.Game.ACTION_PROCESS,
      ctx.getToken,
      user.id,
      { gameId: game.insertedId.toString(), action: GameActions.DRAW_CARD },
      error,
    );
  });

  it("Draw card - full hand", async () => {
    const error = {
      status: 400,
      name: "InvalidHandLength",
      message: "Invalid hand length",
    };
    const user = await createUser(ctx.usersCollection);
    ctx.setTestUserId(user.id);
    const mockGame = activeGame({
      user: basicUser({ ...user, userId: user.id }),
    });
    await ctx.gamesCollection.insertOne(mockGame);
    await apiRequestError(
      ctx.app,
      "post",
      Routes.Game.ACTION_PROCESS,
      ctx.getToken,
      user.id,
      { gameCode: mockGame.code, action: GameActions.DRAW_CARD },
      error,
    );
  });

  it("Draw card - user is not currentPlayer", async () => {
    const error = {
      status: 400,
      name: "UserIsNotCurrentPlayer",
      message: "User is not current player",
    };
    const user = await createUser(ctx.usersCollection);
    ctx.setTestUserId(user.id);
    const mockGame = activeGame({
      currentPlayer: 0,
      handNumber: 4,
      user: basicUser({ ...user, userId: user.id }),
    });
    await ctx.gamesCollection.insertOne(mockGame);
    await apiRequestError(
      ctx.app,
      "post",
      Routes.Game.ACTION_PROCESS,
      ctx.getToken,
      user.id,
      { gameCode: mockGame.code, action: GameActions.DRAW_CARD },
      error,
    );
  });
});
