require("../services/setup-db");
const ProcessAction = require("../../src/routes/game/action-process");
const Routes = require("../../../shared/constants/routes.json");
const GameActions = require("../../../shared/constants/game-actions.json");
const {
  generateRandomCode,
  initialGame,
  activeGame,
  basicUser,
  generateRandomId,
} = require("../helpers/default-mocks");
const { generateGameCode } = require("../../src/utils/code-helper");
const {
  RANK_CARD_ORDER,
} = require("../../../shared/constants/game-constants.json");
const {
  cleanupTestContext,
  createUser,
  apiRequestSuccess,
  apiRequestError,
} = require("../test-helpers");
const applyBeforeAll = require("../helpers/before-all-helper");

describe("POST /game/action/process (all)", () => {
  describe("POST /game/action/process - standard", () => {
    let ctx = applyBeforeAll(ProcessAction);
    afterEach(async () => {
      const { usersCollection, gamesCollection } = ctx;
      await cleanupTestContext({ usersCollection, gamesCollection });
    });

    it("should return an error if game does not exist", async () => {
      const error = {
        status: 404,
        name: "GameDoesNotExist",
        message: "Requested game does not exist",
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
          gameCode: generateRandomCode(),
          action: GameActions.DRAW_CARD,
        },
        error,
      );
    });

    it("Current user is not in game", async () => {
      const error = {
        status: 400,
        name: "UserNotInGame",
        message: "User is not in game",
      };
      const user = await createUser(ctx.usersCollection);
      ctx.setTestUserId(user.id);
      const mockGame = activeGame();
      await ctx.gamesCollection.insertOne(mockGame);
      await apiRequestError(
        ctx.app,
        "post",
        Routes.Game.ACTION_PROCESS,
        ctx.getToken,
        user.id,
        {
          gameCode: mockGame.code,
          action: GameActions.DRAW_CARD,
        },
        error,
      );
    });

    it("game is not active", async () => {
      const error = {
        status: 400,
        name: "GameIsNotActive",
        message: "Game has to be in active state.",
      };
      const user = await createUser(ctx.usersCollection);
      ctx.setTestUserId(user.id);
      const mockGame = initialGame({
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
          action: GameActions.DRAW_CARD,
        },
        error,
      );
    });

    it("Update deck - from completedList", async () => {
      const user = await createUser(ctx.usersCollection);
      ctx.setTestUserId(user.id);
      const mockGame = activeGame({
        user: basicUser({ ...user, userId: user.id }),
      });
      mockGame.completedCardList = mockGame.deck.splice(
        0,
        mockGame.deck.length - 5,
      );
      await ctx.gamesCollection.insertOne(mockGame);
      const oldHand = mockGame.playerList[1].hand;
      const response = await apiRequestSuccess(
        ctx.app,
        "post",
        Routes.Game.ACTION_PROCESS,
        ctx.getToken,
        user.id,
        {
          gameCode: mockGame.code,
          action: GameActions.REORDER_HAND,
          hand: oldHand,
        },
      );

      expect(mockGame.deck.length).toBeLessThan(
        response.body.newGame.deck.length,
      );
    });

    it("Update deck - without card in completedList", async () => {
      const user = await createUser(ctx.usersCollection);
      ctx.setTestUserId(user.id);
      const mockGame = activeGame({
        user: basicUser({ ...user, userId: user.id }),
      });
      mockGame.gameBoard = splitCardsIntoGroups(
        mockGame.deck.splice(0, mockGame.deck.length - 5),
      );
      mockGame.completedCardList = [];
      await ctx.gamesCollection.insertOne(mockGame);
      const oldHand = mockGame.playerList[1].hand;
      const response = await apiRequestSuccess(
        ctx.app,
        "post",
        Routes.Game.ACTION_PROCESS,
        ctx.getToken,
        user.id,
        {
          gameCode: mockGame.code,
          action: GameActions.REORDER_HAND,
          hand: oldHand,
        },
      );

      expect(mockGame.deck.length).toBeLessThan(
        response.body.newGame.deck.length,
      );
      expect(
        response.body.newGame.gameBoard[0][
          response.body.newGame.gameBoard[0].length - 1
        ].i,
      ).toBe(mockGame.gameBoard[0][mockGame.gameBoard[0].length - 1].i);
      expect(response.body.newGame.gameBoard[0][0]).toBe(null);
    });

    it("Dont need to have drawed cards ", async () => {
      const user = await createUser(ctx.usersCollection);
      ctx.setTestUserId(user.id);
      const mockGame = activeGame({
        user: basicUser({ ...user, userId: user.id }, { isCardDrawed: false }),
      });
      await ctx.gamesCollection.insertOne(mockGame);
      const oldHand = mockGame.playerList[1].hand;
      await apiRequestSuccess(
        ctx.app,
        "post",
        Routes.Game.ACTION_PROCESS,
        ctx.getToken,
        user.id,
        {
          gameCode: mockGame.code,
          action: GameActions.REORDER_HAND,
          hand: oldHand,
        },
      );
    });

    it("invalid action", async () => {
      const error = {
        status: 400,
        name: "ActionIsNotDefined",
        message: "Action is not defined",
      };
      const user = await createUser(ctx.usersCollection);
      ctx.setTestUserId(user.id);
      const mockGame = activeGame({
        user: basicUser({ ...user, userId: user.id }),
      });
      await ctx.gamesCollection.insertOne(mockGame);
      const oldHand = mockGame.playerList[1].hand;
      await apiRequestError(
        ctx.app,
        "post",
        Routes.Game.ACTION_PROCESS,
        ctx.getToken,
        user.id,
        {
          gameCode: mockGame.code,
          action: "invalid",
          hand: oldHand,
        },
        error,
      );
    });

    it("PlayerMustDrawCardFirst ", async () => {
      const error = {
        status: 400,
        name: "PlayerMustDrawCardFirst",
        message: "Player must draw a card first",
      };
      const user = await createUser(ctx.usersCollection);
      ctx.setTestUserId(user.id);
      const mockGame = activeGame({
        user: basicUser({ ...user, userId: user.id }, { isCardDrawed: false }),
      });
      await ctx.gamesCollection.insertOne(mockGame);
      const oldHand = mockGame.playerList[1].hand;
      await apiRequestError(
        ctx.app,
        "post",
        Routes.Game.ACTION_PROCESS,
        ctx.getToken,
        user.id,
        {
          gameCode: mockGame.code,
          action: GameActions.MOVE_CARD_TO_BOARD,
          targetIndex: 0,
          card: oldHand[0],
        },
        error,
      );
    });
  });
  describe("user does not exist", () => {
    let ctx = applyBeforeAll(ProcessAction, true);

    afterEach(async () => {
      const { usersCollection, gamesCollection } = ctx;
      await cleanupTestContext({ usersCollection, gamesCollection });
    });

    it("should return 404 and UserDoesNotExist for non-existent user", async () => {
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
        Routes.Game.ACTION_PROCESS,
        ctx.getToken,
        randomUserId,
        {
          gameCode: generateGameCode(),
          action: GameActions.DRAW_CARD,
        },
        error,
      );
    });
  });
});

function splitCardsIntoGroups(cards) {
  const rankOrder = RANK_CARD_ORDER;

  const sorted = [...cards].sort((a, b) => {
    return rankOrder.indexOf(a.rank) - rankOrder.indexOf(b.rank);
  });

  const result = [];
  for (let i = 0; i < sorted.length; i += 11) {
    result.push(sorted.slice(i, i + 11));
  }

  return result;
}
