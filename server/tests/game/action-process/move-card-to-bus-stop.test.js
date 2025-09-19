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
const {
  RANK_CARD_ORDER,
} = require("../../../../shared/constants/game-constants.json");
const applyBeforeAll = require("../../helpers/before-all-helper");

describe("POST /game/action/process move card to bus stop", () => {
  let ctx = applyBeforeAll(ProcessAction);

  afterEach(async () => {
    const { usersCollection, gamesCollection } = ctx;
    await cleanupTestContext({ usersCollection, gamesCollection });
  });

  it("Move card to bus stop - invalid input", async () => {
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
        targetIndex: 1,
        action: GameActions.MOVE_CARD_TO_BUS_STOP,
      },
      error,
    );
  });

  it("Move card to busstop", async () => {
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
        action: GameActions.MOVE_CARD_TO_BUS_STOP,
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
      response.body.newGame.playerList[1].busStop[targetIndex],
    ).toHaveLength(mockGame.playerList[1].busStop[targetIndex].length + 1);
  });

  it("Move card to busstop - invalid card", async () => {
    const error = {
      status: 400,
      name: "InvalidCardInBusStop",
      message: "Invalid card in bus stop",
    };
    const user = await createUser(ctx.usersCollection);
    ctx.setTestUserId(user.id);
    const targetIndex = 0;
    const preferredRank = RANK_CARD_ORDER[0];
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
        action: GameActions.MOVE_CARD_TO_BUS_STOP,
        card: mockGame.playerList[1].hand.find(
          (card) => card.rank === preferredRank,
        ),
      },
      error,
    );
  });

  it("Move card to busstop - in not empty position", async () => {
    const user = await createUser(ctx.usersCollection);
    ctx.setTestUserId(user.id);
    const targetIndex = 0;
    const preferredRank = "K";
    const mockGame = activeGame({
      handNumber: 4,
      preferredRank,
      user: basicUser({ ...user, userId: user.id }),
    });
    const card = mockGame.deck.find((card) => card.rank === preferredRank);
    const cardIndex = mockGame.deck.findIndex((c) => c.i === card.i);
    mockGame.deck.splice(cardIndex, 1);
    mockGame.playerList[1].busStop[0].push(card);
    await ctx.gamesCollection.insertOne(mockGame);
    const handCard = mockGame.playerList[1].hand.find(
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
        action: GameActions.MOVE_CARD_TO_BUS_STOP,
        card: handCard,
      },
    );

    expect(
      response.body.newGame.playerList[1].busStop[targetIndex],
    ).toHaveLength(2);
    expect(response.body.newGame.playerList[1].busStop[targetIndex][1].i).toBe(
      handCard.i,
    );
    expect(
      response.body.newGame.playerList[1].busStop[targetIndex][1].suit,
    ).toBe(handCard.suit);
    expect(
      response.body.newGame.playerList[1].busStop[targetIndex][1].rank,
    ).toBe(handCard.rank);
  });

  it("Move card to busstop - invalid target", async () => {
    const error = {
      status: 400,
      name: "InvalidBusStopIndex",
      message: "Invalid bus stop index",
    };
    const user = await createUser(ctx.usersCollection);
    ctx.setTestUserId(user.id);
    const targetIndex = 4;
    const preferredRank = "2";
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
        action: GameActions.MOVE_CARD_TO_BUS_STOP,
        card: mockGame.playerList[1].hand.find(
          (card) => card.rank === preferredRank,
        ),
      },
      error,
    );
  });

  it("Move card to busstop - InvalidCardInBusStop", async () => {
    const error = {
      status: 400,
      name: "InvalidCardInBusStop",
      message: "Invalid card in bus stop",
    };
    const user = await createUser(ctx.usersCollection);
    ctx.setTestUserId(user.id);
    const targetIndex = 0;
    const preferredRank = "3";
    const mockGame = activeGame({
      handNumber: 4,
      preferredRank,
      user: basicUser({ ...user, userId: user.id }),
      firstPositionInBusStop: true,
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
        action: GameActions.MOVE_CARD_TO_BUS_STOP,
        card: mockGame.playerList[1].hand.find(
          (card) => card.rank === preferredRank,
        ),
      },
      error,
    );
  });

  it("Move card to busstop - InvalidCardInBusStopDifferentIndex", async () => {
    const error = {
      status: 400,
      name: "InvalidCardInBusStopDifferentIndex",
      message: "Card in bus stop does not match the index",
    };
    const user = await createUser(ctx.usersCollection);
    ctx.setTestUserId(user.id);
    const targetIndex = 0;
    const preferredRank = "4";
    const mockGame = activeGame({
      handNumber: 4,
      preferredRank,
      user: basicUser({ ...user, userId: user.id }),
      fullBusStop: true,
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
        action: GameActions.MOVE_CARD_TO_BUS_STOP,
        card: mockGame.playerList[1].hand.find(
          (card) => card.rank === preferredRank,
        ),
      },
      error,
    );
  });
});
