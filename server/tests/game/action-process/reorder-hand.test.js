require("../../services/setup-db");

const ProcessAction = require("../../../src/routes/game/action-process");
const Routes = require("../../../../shared/constants/routes.json");
const GameActions = require("../../../../shared/constants/game-actions.json");
const { activeGame, basicUser } = require("../../helpers/default-mocks");
const { generateGameCode } = require("../../../src/utils/code-helper");
const {
  cleanupTestContext,
  createUser,
  apiRequestSuccess,
  apiRequestError,
} = require("../../test-helpers");
const applyBeforeAll = require("../../helpers/before-all-helper");

describe("POST /game/action/process - reorder hand", () => {
  let ctx = applyBeforeAll(ProcessAction);
  afterEach(async () => {
    const { usersCollection, gamesCollection } = ctx;
    await cleanupTestContext({ usersCollection, gamesCollection });
  });

  it("Reorder hand", async () => {
    const user = await createUser(ctx.usersCollection);
    ctx.setTestUserId(user.id);
    const mockGame = activeGame({
      user: basicUser({ ...user, userId: user.id }),
    });
    await ctx.gamesCollection.insertOne(mockGame);
    const oldHand = mockGame.playerList[1].hand;
    const newHand = [
      oldHand[2],
      oldHand[0],
      oldHand[1],
      oldHand[3],
      oldHand[4],
    ];
    const response = await apiRequestSuccess(
      ctx.app,
      "post",
      Routes.Game.ACTION_PROCESS,
      ctx.getToken,
      user.id,
      {
        gameCode: mockGame.code,
        action: GameActions.REORDER_HAND,
        hand: newHand,
      },
    );

    for (let i = 0; i < newHand.length; i++) {
      expect(response.body.newGame.playerList[1].hand[i].i).toBe(newHand[i].i);
      expect(response.body.newGame.playerList[1].hand[i].rank).toBe(
        newHand[i].rank,
      );
      expect(response.body.newGame.playerList[1].hand[i].suit).toBe(
        newHand[i].suit,
      );
    }
  });

  it("Reorder hand - hand is required", async () => {
    const error = {
      status: 400,
      name: "InvalidDataError",
      message: '"hand" is required',
    };
    const user = await createUser(ctx.usersCollection);
    ctx.setTestUserId(user.id);
    await apiRequestError(
      ctx.app,
      "post",
      Routes.Game.ACTION_PROCESS,
      ctx.getToken,
      user.id,
      {
        gameCode: generateGameCode(),
        action: GameActions.REORDER_HAND,
      },
      error,
    );
  });

  it("Reorder hand - invalid hand", async () => {
    const error = {
      status: 400,
      name: "InvalidDataError",
      message: '"hand" must be an array',
    };
    const user = await createUser(ctx.usersCollection);
    ctx.setTestUserId(user.id);
    await apiRequestError(
      ctx.app,
      "post",
      Routes.Game.ACTION_PROCESS,
      ctx.getToken,
      user.id,
      {
        gameCode: generateGameCode(),
        action: GameActions.REORDER_HAND,
        hand: "invalid",
      },
      error,
    );
  });

  it("Reorder hand - invalid hand", async () => {
    const error = {
      status: 400,
      name: "InvalidHandReorder",
      message: "Invalid hand reorder",
    };
    const user = await createUser(ctx.usersCollection);
    ctx.setTestUserId(user.id);
    const mockGame = activeGame({
      user: basicUser({ ...user, userId: user.id }),
    });
    await ctx.gamesCollection.insertOne(mockGame);
    const oldHand = mockGame.playerList[1].hand;
    const newHand = [oldHand[2], oldHand[0], oldHand[1], oldHand[3], ""];
    await apiRequestError(
      ctx.app,
      "post",
      Routes.Game.ACTION_PROCESS,
      ctx.getToken,
      user.id,
      {
        gameCode: mockGame.code,
        action: GameActions.REORDER_HAND,
        hand: newHand,
      },
      error,
    );
  });

  it("Reorder hand - new hand is different length than old hand", async () => {
    const error = {
      status: 400,
      name: "InvalidHandReorder",
      message: "Invalid hand reorder",
    };
    const user = await createUser(ctx.usersCollection);
    ctx.setTestUserId(user.id);
    const mockGame = activeGame({
      user: basicUser({ ...user, userId: user.id }),
    });
    await ctx.gamesCollection.insertOne(mockGame);
    const oldHand = mockGame.playerList[1].hand;
    const newHand = [oldHand[2], oldHand[0], oldHand[1], oldHand[3]];
    await apiRequestError(
      ctx.app,
      "post",
      Routes.Game.ACTION_PROCESS,
      ctx.getToken,
      user.id,
      {
        gameCode: mockGame.code,
        action: GameActions.REORDER_HAND,
        hand: newHand,
      },
      error,
    );
  });
});
