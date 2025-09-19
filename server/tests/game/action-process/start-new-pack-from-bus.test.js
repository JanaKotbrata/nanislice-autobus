require("../../services/setup-db");

const ProcessAction = require("../../../src/routes/game/action-process");
const Routes = require("../../../../shared/constants/routes.json");
const GameActions = require("../../../../shared/constants/game-actions.json");
const { activeGame, basicUser } = require("../../helpers/default-mocks");
const { States } = require("../../../../shared/constants/game-constants");
const {
  cleanupTestContext,
  createUser,
  apiRequestSuccess,
} = require("../../test-helpers");
const {
  RANK_CARD_ORDER,
  JOKER,
} = require("../../../../shared/constants/game-constants.json");
const applyBeforeAll = require("../../helpers/before-all-helper");

describe("POST /game/action/process - start new pack from bus", () => {
  let ctx = applyBeforeAll(ProcessAction);

  afterEach(async () => {
    const { usersCollection, gamesCollection } = ctx;
    await cleanupTestContext({ usersCollection, gamesCollection });
  });

  it("Start new deck from bus - OK - Jr", async () => {
    const user = await createUser(ctx.usersCollection);
    ctx.setTestUserId(user.id);
    const preferredRankInBus = JOKER;
    const mockGame = activeGame({
      handNumber: 4,
      preferredRankInBus,
      user: basicUser({ ...user, userId: user.id }),
    });
    await ctx.gamesCollection.insertOne(mockGame);
    const card = mockGame.playerList[1].bus.find(
      (card) => card.rank === preferredRankInBus,
    );
    const response = await apiRequestSuccess(
      ctx.app,
      "post",
      Routes.Game.ACTION_PROCESS,
      ctx.getToken,
      user.id,
      {
        gameCode: mockGame.code,
        action: GameActions.START_NEW_PACK_FROM_BUS,
        card,
      },
    );

    expect(response.body.newGame.playerList[1].bus).toHaveLength(
      mockGame.playerList[1].bus.length - 1,
    );
    expect(response.body.newGame.gameBoard).toHaveLength(
      mockGame.gameBoard.length + 1,
    );
    expect(
      response.body.newGame.gameBoard[
        response.body.newGame.gameBoard.length - 1
      ],
    ).toHaveLength(1);
    expect(
      response.body.newGame.gameBoard[
        response.body.newGame.gameBoard.length - 1
      ][0].i,
    ).toBe(card.i);
    expect(
      response.body.newGame.gameBoard[
        response.body.newGame.gameBoard.length - 1
      ][0].rank,
    ).toBe(card.rank);
    expect(
      response.body.newGame.gameBoard[
        response.body.newGame.gameBoard.length - 1
      ][0].suit,
    ).toBe(card.suit);
  });

  it("Move card to board from bus - last card", async () => {
    const user = await createUser(ctx.usersCollection);
    ctx.setTestUserId(user.id);
    const targetIndex = 0;
    const preferredRank = RANK_CARD_ORDER[0];
    const mockGame = activeGame({
      preferredRankInBus: preferredRank,
      user: basicUser({ ...user, userId: user.id }),
    });
    mockGame.playerList[1].bus = [
      { ...mockGame.playerList[1].bus[0], rank: RANK_CARD_ORDER[0] },
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
        action: GameActions.START_NEW_PACK_FROM_BUS,
        card: mockGame.playerList[1].bus[0],
      },
    );

    expect(response.body.newGame.state).toBe(States.FINISHED);
  });

  it("Move card to board from bus - last card Joker", async () => {
    const user = await createUser(ctx.usersCollection);
    ctx.setTestUserId(user.id);
    const targetIndex = 0;
    const preferredRank = JOKER;
    const mockGame = activeGame({
      preferredRankInBus: preferredRank,
      user: basicUser({ ...user, userId: user.id }),
    });
    mockGame.playerList[1].bus = [
      { ...mockGame.playerList[1].bus[0], rank: JOKER },
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
        action: GameActions.START_NEW_PACK_FROM_BUS,
        card: mockGame.playerList[1].bus[0],
      },
    );

    expect(response.body.newGame.state).toBe(States.FINISHED);
  });
});
