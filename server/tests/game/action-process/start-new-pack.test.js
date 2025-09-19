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
const {
  RANK_CARD_ORDER,
  JOKER,
} = require("../../../../shared/constants/game-constants.json");
const applyBeforeAll = require("../../helpers/before-all-helper");

describe("POST /game/action/process - start new pack", () => {
  let ctx = applyBeforeAll(ProcessAction);

  afterEach(async () => {
    const { usersCollection, gamesCollection } = ctx;
    await cleanupTestContext({ usersCollection, gamesCollection });
  });

  it("Start new deck - failed", async () => {
    const error = {
      status: 500,
      name: "FailedToUpdateGame",
      message: "Failed to update game",
    };
    const user = await createUser(ctx.usersCollection);
    ctx.setTestUserId(user.id);
    const preferredRank = RANK_CARD_ORDER[0];
    const mockGame = activeGame({
      handNumber: 4,
      preferredRank,
      user: basicUser({ ...user, userId: user.id }),
    });
    delete mockGame.sys;
    await ctx.gamesCollection.insertOne(mockGame);
    await apiRequestError(
      ctx.app,
      "post",
      Routes.Game.ACTION_PROCESS,
      ctx.getToken,
      user.id,
      {
        gameCode: mockGame.code,
        action: GameActions.START_NEW_PACK,
        card: mockGame.playerList[1].hand.find(
          (card) => card.rank === preferredRank,
        ),
      },
      error,
    );
  });

  it("Start new deck - OK - A", async () => {
    const user = await createUser(ctx.usersCollection);
    ctx.setTestUserId(user.id);
    const preferredRank = RANK_CARD_ORDER[0];
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
        action: GameActions.START_NEW_PACK,
        card,
      },
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

  it("Empty hand - should draw card", async () => {
    const user = await createUser(ctx.usersCollection);
    ctx.setTestUserId(user.id);
    const preferredRank = RANK_CARD_ORDER[0];
    const mockGame = activeGame({
      handNumber: 0,
      preferredRank,
      user: basicUser({ ...user, userId: user.id }),
    });
    await ctx.gamesCollection.insertOne(mockGame);
    const card = mockGame.playerList[1].hand[0];
    const response = await apiRequestSuccess(
      ctx.app,
      "post",
      Routes.Game.ACTION_PROCESS,
      ctx.getToken,
      user.id,
      {
        gameCode: mockGame.code,
        action: GameActions.START_NEW_PACK,
        card,
      },
    );

    expect(response.body.newGame.playerList[1].isCardDrawed).toBe(false);
    expect(mockGame.playerList[1].isCardDrawed).toBe(true);
  });

  it("Start new deck - OK - Jr", async () => {
    const user = await createUser(ctx.usersCollection);
    ctx.setTestUserId(user.id);
    const preferredRank = JOKER;
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
        action: GameActions.START_NEW_PACK,
        card,
      },
    );

    expect(response.body.newGame.playerList[1].hand.length).toBe(
      mockGame.playerList[1].hand.length,
    );
    expect(
      response.body.newGame.playerList[1].hand.find((c) => c.i === card.i),
    ).toBeUndefined();
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

  it("Start new deck - InvalidCardInGameBoard", async () => {
    const error = {
      status: 400,
      name: "InvalidCardInGameBoard",
      message: "Invalid card in game board",
    };
    const user = await createUser(ctx.usersCollection);
    ctx.setTestUserId(user.id);
    const preferredRank = "3";
    const mockGame = activeGame({
      handNumber: 4,
      preferredRank,
      user: basicUser({ ...user, userId: user.id }),
    });
    await ctx.gamesCollection.insertOne(mockGame);
    const card = mockGame.playerList[1].hand.find(
      (card) => card.rank === preferredRank,
    );
    await apiRequestError(
      ctx.app,
      "post",
      Routes.Game.ACTION_PROCESS,
      ctx.getToken,
      user.id,
      {
        gameCode: mockGame.code,
        action: GameActions.START_NEW_PACK,
        card,
      },
      error,
    );
  });
});
