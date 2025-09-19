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

describe("POST /game/action/process - move card to board from busstop", () => {
  let ctx = applyBeforeAll(ProcessAction);
  afterEach(async () => {
    const { usersCollection, gamesCollection } = ctx;
    await cleanupTestContext({ usersCollection, gamesCollection });
  });

  it("Move card to board from busStop", async () => {
    const user = await createUser(ctx.usersCollection);
    ctx.setTestUserId(user.id);
    const targetIndex = 0;
    const preferredRank = "2";
    const mockGame = activeGame({
      user: basicUser({ ...user, userId: user.id }),
    });
    const preferredCard = mockGame.deck.find(
      (card) => card.rank === preferredRank,
    );
    const preferredCardIndex = mockGame.deck.findIndex(
      (c) => c.i === preferredCard.i,
    );
    mockGame.deck.splice(preferredCardIndex, 1);
    mockGame.playerList[1].busStop[targetIndex].push(preferredCard);
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
        action: GameActions.MOVE_CARD_TO_BOARD_FROM_BUS_STOP,
        card: mockGame.playerList[1].busStop[targetIndex][0],
      },
    );

    expect(
      response.body.newGame.playerList[1].busStop[targetIndex],
    ).toHaveLength(mockGame.playerList[1].busStop[targetIndex].length - 1);
    expect(response.body.newGame.gameBoard[targetIndex]).toHaveLength(
      mockGame.gameBoard[targetIndex].length + 1,
    );
  });

  it("Move card to board from busStop - CardIsMissing", async () => {
    const error = {
      status: 400,
      name: "CardIsMissing",
      message: "Card is missing",
    };
    const user = await createUser(ctx.usersCollection);
    ctx.setTestUserId(user.id);
    const targetIndex = 0;
    const preferredRank = "2";
    const mockGame = activeGame({
      user: basicUser({ ...user, userId: user.id }),
    });
    const preferredCard = mockGame.deck.find(
      (card) => card.rank === preferredRank,
    );
    const preferredCardIndex = mockGame.deck.findIndex(
      (c) => c.i === preferredCard.i,
    );
    mockGame.deck.splice(preferredCardIndex, 1);
    mockGame.playerList[1].busStop[targetIndex].push(preferredCard);
    const game = await ctx.gamesCollection.insertOne(mockGame);
    let card = mockGame.playerList[1].busStop[targetIndex][0];
    card.i = 123456789;
    await apiRequestError(
      ctx.app,
      "post",
      Routes.Game.ACTION_PROCESS,
      ctx.getToken,
      user.id,
      {
        gameId: game.insertedId.toString(),
        targetIndex,
        action: GameActions.MOVE_CARD_TO_BOARD_FROM_BUS_STOP,
        card,
      },
      error,
    );
  });
});
