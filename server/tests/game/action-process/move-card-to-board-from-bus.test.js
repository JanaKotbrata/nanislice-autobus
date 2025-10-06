require("../../services/setup-db");
const ProcessAction = require("../../../src/routes/game/action-process");
const Routes = require("../../../../shared/constants/routes.json");
const GameActions = require("../../../../shared/constants/game-actions.json");
const { States } = require("../../../../shared/constants/game-constants");
const { activeGame, basicUser } = require("../../helpers/default-mocks");
const {
  cleanupTestContext,
  createUser,
  apiRequestSuccess,
} = require("../../test-helpers");
const applyBeforeAll = require("../../helpers/before-all-helper");

describe("POST /game/action/process - move card to board from bus", () => {
  let ctx = applyBeforeAll(ProcessAction);

  afterEach(async () => {
    const { usersCollection, gamesCollection } = ctx;
    await cleanupTestContext({ usersCollection, gamesCollection });
  });

  it("Move card to board from bus", async () => {
    const user = await createUser(ctx.usersCollection);
    ctx.setTestUserId(user.id);
    const targetIndex = 0;
    const preferredRank = "2";
    const mockGame = activeGame({
      preferredRankInBus: preferredRank,
      user: basicUser({ ...user, userId: user.id }),
    });
    await ctx.gamesCollection.insertOne(mockGame);
    const response = await apiRequestSuccess(
      ctx.app,
      "post",
      Routes.Game.ACTION_PROCESS,
      ctx.getToken,
      user.id,
      {
        gameCode: mockGame.code,
        targetIndex,
        action: GameActions.MOVE_CARD_TO_BOARD_FROM_BUS,
        card: mockGame.playerList[1].bus[0],
      },
    );

    expect(response.body.newGame.playerList[1].bus).toHaveLength(
      mockGame.playerList[1].bus.length - 1,
    );
    expect(response.body.newGame.gameBoard[targetIndex]).toHaveLength(
      mockGame.gameBoard[targetIndex].length + 1,
    );
  });

  it("Move card to board from bus - last card", async () => {
    const user = await createUser(ctx.usersCollection,{}, {level:4, xp:900});
    ctx.setTestUserId(user.id);
    const targetIndex = 0;
    const preferredRank = "2";
    const mockGame = activeGame({
      preferredRankInBus: preferredRank,
      user: basicUser({ ...user, userId: user.id }),
    });
    mockGame.playerList[1].bus = [
      { ...mockGame.playerList[1].bus[0], rank: "2" },
    ];
    await ctx.gamesCollection.insertOne(mockGame);
    const response = await apiRequestSuccess(
      ctx.app,
      "post",
      Routes.Game.ACTION_PROCESS,
      ctx.getToken,
      user.id,
      {
        gameCode: mockGame.code,
        targetIndex,
        action: GameActions.MOVE_CARD_TO_BOARD_FROM_BUS,
        card: mockGame.playerList[1].bus[0],
      },
    );

    expect(response.body.newGame.state).toBe(States.FINISHED);
    expect(response.body.xp[user.id].xp).toBe(1000);
    expect(response.body.xp[user.id].level).toBe(5);
  });
});
