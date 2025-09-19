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

describe("POST /game/action/process move card to board", () => {
  let ctx = applyBeforeAll(ProcessAction);

  afterEach(async () => {
    const { usersCollection, gamesCollection } = ctx;
    await cleanupTestContext({ usersCollection, gamesCollection });
  });

  it("Move card to board", async () => {
    const user = await createUser(ctx.usersCollection);
    ctx.setTestUserId(user.id);
    const targetIndex = 0;
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
        targetIndex,
        action: GameActions.MOVE_CARD_TO_BOARD,
        card,
      },
    );

    expect(response.body.newGame.gameBoard[targetIndex].length).toBe(
      mockGame.gameBoard[targetIndex].length + 1,
    );
    expect(response.body.newGame.playerList[1].hand.length).toBe(
      mockGame.playerList[1].hand.length,
    );
    expect(
      response.body.newGame.playerList[1].hand.find((c) => c.i === card.i),
    ).toBeUndefined();
  });

  it("Move card to board - invalid input", async () => {
    const error = {
      status: 400,
      name: "InvalidDataError",
      message: '"card" is required',
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
        targetIndex: 0,
        action: GameActions.MOVE_CARD_TO_BOARD,
      },
      error,
    );
  });

  it("Move card to board - invalid card", async () => {
    const error = {
      status: 400,
      name: "InvalidCardInGameBoard",
      message: "Invalid card in game board",
    };
    const user = await createUser(ctx.usersCollection);
    ctx.setTestUserId(user.id);
    const targetIndex = 0;
    const preferredRank = "3";
    const mockGame = activeGame({
      handNumber: 4,
      preferredRank,
      user: basicUser({ ...user, userId: user.id }),
    });
    await ctx.gamesCollection.insertOne(mockGame);
    await apiRequestError(
      ctx.app,
      "post",
      Routes.Game.ACTION_PROCESS,
      ctx.getToken,
      user.id,
      {
        gameCode: mockGame.code,
        targetIndex,
        action: GameActions.MOVE_CARD_TO_BOARD,
        card: mockGame.playerList[1].hand.find(
          (card) => card.rank === preferredRank,
        ),
      },
      error,
    );
  });

  it("Move card to board - invalid target", async () => {
    const error = {
      status: 400,
      name: "DestinationDoesNotExist",
      message: "Destination does not exist",
    };
    const user = await createUser(ctx.usersCollection);
    ctx.setTestUserId(user.id);
    const targetIndex = 4;
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
      {
        gameCode: mockGame.code,
        targetIndex,
        action: GameActions.MOVE_CARD_TO_BOARD,
        card: mockGame.playerList[1].hand[0],
      },
      error,
    );
  });

  it("Move card to board - invalid card", async () => {
    const error = {
      status: 400,
      name: "CardDoesNotExist",
      message: "Card does not exist",
    };
    const user = await createUser(ctx.usersCollection);
    ctx.setTestUserId(user.id);
    const targetIndex = 0;
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
      {
        gameCode: mockGame.code,
        targetIndex,
        action: GameActions.MOVE_CARD_TO_BOARD,
        card: { i: 999, rank: "2", suit: "H" },
      },
      error,
    );
  });

  it("Move card to board - full destination", async () => {
    const user = await createUser(ctx.usersCollection);
    ctx.setTestUserId(user.id);
    const preferredRank = "K";
    const targetIndex = 0;
    const gameBoard = [
      [
        { i: 0, rank: "A", suit: "H" },
        { i: 1, rank: "2", suit: "H" },
        { i: 2, rank: "3", suit: "H" },
        { i: 3, rank: "4", suit: "H", bg: "red" },
        { i: 4, rank: "5", suit: "H" },
        { i: 5, rank: "6", suit: "H" },
        { i: 6, rank: "7", suit: "H" },
        { i: 7, rank: "8", suit: "H", bg: "red" },
        { i: 8, rank: "9", suit: "H" },
        { i: 9, rank: "10", suit: "H" },
        { i: 10, rank: "J", suit: "H" },
        { i: 11, rank: "Q", suit: "H", bg: "red" },
      ],
    ];
    const mockGame = activeGame({
      handNumber: 4,
      preferredRank,
      gameBoard,
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
        targetIndex,
        action: GameActions.MOVE_CARD_TO_BOARD,
        card,
      },
    );

    expect(response.body.newGame.gameBoard).toHaveLength(gameBoard.length - 1);
    expect(response.body.newGame.completedCardList).toHaveLength(13);
    expect(response.body.newGame.completedCardList[12].i).toBe(card.i);
    expect(response.body.newGame.completedCardList[12].suit).toBe(card.suit);
    expect(response.body.newGame.completedCardList[12].rank).toBe(card.rank);
  });

  it("Move card to board - full destination with empty previous cards", async () => {
    const user = await createUser(ctx.usersCollection);
    ctx.setTestUserId(user.id);
    const preferredRank = "K";
    const targetIndex = 0;
    let gameBoard = [new Array(10).fill(null)];
    gameBoard[0][11] = { i: 11, rank: "Q", suit: "H", bg: "red" };
    const mockGame = activeGame({
      handNumber: 4,
      preferredRank,
      gameBoard,
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
        targetIndex,
        action: GameActions.MOVE_CARD_TO_BOARD,
        card,
      },
    );

    expect(response.body.newGame.gameBoard).toHaveLength(gameBoard.length - 1);
    const completedCardList =
      response.body.newGame.completedCardList.filter(Boolean);
    expect(completedCardList).toHaveLength(2);
    expect(response.body.newGame.completedCardList[0]).toBe(null);
    expect(response.body.newGame.completedCardList[12].i).toBe(card.i);
    expect(response.body.newGame.completedCardList[12].suit).toBe(card.suit);
    expect(response.body.newGame.completedCardList[12].rank).toBe(card.rank);
  });
});
