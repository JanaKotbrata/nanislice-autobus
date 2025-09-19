require("../../services/setup-db");

const ProcessAction = require("../../../src/routes/game/action-process");
const Routes = require("../../../../shared/constants/routes.json");
const GameActions = require("../../../../shared/constants/game-actions.json");
const { activeGame, basicUser } = require("../../helpers/default-mocks");
const {
  cleanupTestContext,
  createUser,
  apiRequestSuccess,
} = require("../../test-helpers");
const applyBeforeAll = require("../../helpers/before-all-helper");

describe("POST /game/action/process - move card to bus", () => {
  let ctx = applyBeforeAll(ProcessAction);

  afterEach(async () => {
    const { usersCollection, gamesCollection } = ctx;
    await cleanupTestContext({ usersCollection, gamesCollection });
  });

  it("Move card to bus - OK", async () => {
    const user = await createUser(ctx.usersCollection);
    ctx.setTestUserId(user.id);
    const preferredRank = "2";
    const mockGame = activeGame({
      handNumber: 4,
      preferredRank,
      user: basicUser({ ...user, userId: user.id }),
    });
    await ctx.gamesCollection.insertOne(mockGame);
    const card = mockGame.playerList[1].hand.find(
      (card) => card.rank === preferredRank,
    );
    const response = await apiRequestSuccess(
      ctx.app,
      "post",
      Routes.Game.ACTION_PROCESS,
      ctx.getToken,
      user.id,
      {
        gameCode: mockGame.code,
        action: GameActions.MOVE_CARD_TO_BUS,
        card,
      },
    );

    const bus = response.body.newGame.playerList[1].bus;
    expect(response.body.newGame.playerList[1].hand.length).toBe(
      mockGame.playerList[1].hand.length,
    );
    expect(
      response.body.newGame.playerList[1].hand.find((c) => c.i === card.i),
    ).toBeUndefined();
    expect(bus).toHaveLength(mockGame.playerList[1].bus.length + 1);
    expect(bus[bus.length - 1].i).toBe(
      mockGame.playerList[1].hand.find((card) => card.rank === preferredRank).i,
    );
    expect(bus[bus.length - 1].rank).toBe(
      mockGame.playerList[1].hand.find((card) => card.rank === preferredRank)
        .rank,
    );
    expect(bus[bus.length - 1].suit).toBe(
      mockGame.playerList[1].hand.find((card) => card.rank === preferredRank)
        .suit,
    );
  });
});
