const request = require('supertest');
require("../../services/setup-db");
const ProcessAction = require('../../../src/routes/game/action-process');
const Routes = require("../../../../shared/constants/routes.json");
const GameActions = require("../../../../shared/constants/game-actions.json");
const {
    userMock,
    activeGame,
    basicUser,
} = require("../../helpers/default-mocks");
const {generateGameCode} = require("../../../src/utils/helpers");
const IO = require("../../helpers/io-mock");
const {setupTestServer, cleanup} = require("../../services/test-setup");

let gamesCollection;
let usersCollection;
let testUserId;
let getToken;

describe('POST /game/action/process move card to board', () => {
    let app;

    beforeAll(async () => {
        const setup = await setupTestServer(() => testUserId, (app) => {
            new ProcessAction(app, IO);
        });
        app = setup.app;
        gamesCollection = setup.gamesCollection;
        usersCollection = setup.usersCollection;
        getToken = setup.getToken;
    });
  

    afterEach(async () => {
        await cleanup();
    });

    it('Move card to board', async () => {
        const user = await usersCollection.insertOne(userMock());
        const id = user.insertedId.toString();
        const targetIndex = 0;
        const preferredRank = "2";
        testUserId = id;
        const mockGame = activeGame({handNumber: 4, preferredRank, user: basicUser({...user, userId: id})});
        await gamesCollection.insertOne(mockGame);
        const card = mockGame.playerList[1].hand.find((card) => card.rank === preferredRank);
        const response = await request(app)
            .post(Routes.Game.ACTION_PROCESS)
            .set("Authorization", `Bearer ${await getToken(testUserId)}`)
            .send({
                gameCode: mockGame.code,
                targetIndex,
                action: GameActions.MOVE_CARD_TO_BOARD,
                card
            });

        expect(response.status).toBe(200);
        expect(response.body.newGame.gameBoard[targetIndex].length).toBe(mockGame.gameBoard[targetIndex].length + 1);
        expect(response.body.newGame.playerList[1].hand.length).toBe(mockGame.playerList[1].hand.length);
        expect(
            response.body.newGame.playerList[1].hand.find(
                (c) => c.i === card.i
            )
        ).toBeUndefined();

    })
    it('Move card to board - invalid input', async () => {
        const response = await request(app)
            .post(Routes.Game.ACTION_PROCESS)
            .set("Authorization", `Bearer ${await getToken(testUserId)}`)
            .send({gameCode: generateGameCode(), targetIndex: 0, action: GameActions.MOVE_CARD_TO_BOARD});

        expect(response.status).toBe(400);
        expect(response.body.name).toBe("InvalidDataError");
        expect(response.body.message).toBe('"card" is required');
    })
    it('Move card to board - invalid card', async () => {
        const user = await usersCollection.insertOne(userMock());
        const id = user.insertedId.toString();
        const targetIndex = 0;
        const preferredRank = "3";
        testUserId = id;
        const mockGame = activeGame({handNumber: 4, preferredRank, user: basicUser({...user, userId: id})});
        await gamesCollection.insertOne(mockGame);
        const response = await request(app)
            .post(Routes.Game.ACTION_PROCESS)
            .set("Authorization", `Bearer ${await getToken(testUserId)}`)
            .send({
                gameCode: mockGame.code,
                targetIndex,
                action: GameActions.MOVE_CARD_TO_BOARD,
                card: mockGame.playerList[1].hand.find((card) => card.rank === preferredRank)
            });

        expect(response.status).toBe(400);
        expect(response.body.name).toBe("InvalidCardInGameBoard");
        expect(response.body.message).toBe("Invalid card in game board");
    })
    it('Move card to board - invalid target', async () => {
        const user = await usersCollection.insertOne(userMock());
        const id = user.insertedId.toString();
        const targetIndex = 4;
        testUserId = id;
        const mockGame = activeGame({user: basicUser({...user, userId: id})});
        await gamesCollection.insertOne(mockGame);
        const response = await request(app)
            .post(Routes.Game.ACTION_PROCESS)
            .set("Authorization", `Bearer ${await getToken(testUserId)}`)
            .send({
                gameCode: mockGame.code,
                targetIndex,
                action: GameActions.MOVE_CARD_TO_BOARD,
                card: mockGame.playerList[1].hand[0]
            });

        expect(response.status).toBe(400);
        expect(response.body.name).toBe("DestinationDoesNotExist");
        expect(response.body.message).toBe("Destination does not exist");
    })
    it('Move card to board - full destination', async () => {
        const preferredRank = "K";
        const user = await usersCollection.insertOne(userMock());
        const id = user.insertedId.toString();
        const targetIndex = 0;
        testUserId = id;
        const gameBoard = [[{i: 0, rank: "A", suit: "H"}, {i: 1, rank: "2", suit: "H"}, {i: 2, rank: "3", suit: "H"}, {
            i: 3,
            rank: "4",
            suit: "H",
            bg: "red"
        }, {i: 4, rank: "5", suit: "H"}, {i: 5, rank: "6", suit: "H"}, {i: 6, rank: "7", suit: "H"}, {
            i: 7,
            rank: "8",
            suit: "H",
            bg: "red"
        }, {i: 8, rank: "9", suit: "H"}, {i: 9, rank: "10", suit: "H"}, {i: 10, rank: "J", suit: "H"}, {
            i: 11,
            rank: "Q",
            suit: "H",
            bg: "red"
        }]];
        const mockGame = activeGame({handNumber: 4, preferredRank, gameBoard, user: basicUser({...user, userId: id})});
        await gamesCollection.insertOne(mockGame);
        const card = mockGame.playerList[1].hand.find((card) => card.rank === preferredRank)
        const response = await request(app)
            .post(Routes.Game.ACTION_PROCESS)
            .set("Authorization", `Bearer ${await getToken(testUserId)}`)
            .send({
                gameCode: mockGame.code,
                targetIndex,
                action: GameActions.MOVE_CARD_TO_BOARD,
                card
            });

        expect(response.status).toBe(200);
        expect(response.body.newGame.gameBoard).toHaveLength(gameBoard.length - 1);
        expect(response.body.newGame.completedCardList).toHaveLength(13);
        expect(response.body.newGame.completedCardList[12].i).toBe(card.i);
        expect(response.body.newGame.completedCardList[12].suit).toBe(card.suit);
        expect(response.body.newGame.completedCardList[12].rank).toBe(card.rank);
    })
    it('Move card to board - full destination with empty previous cards', async () => {
        const preferredRank = "K";
        const user = await usersCollection.insertOne(userMock());
        const id = user.insertedId.toString();
        const targetIndex = 0;
        testUserId = id;
        let gameBoard = [new Array(10).fill(null)];
        gameBoard[0][11] = {
            i: 11,
            rank: "Q",
            suit: "H",
            bg: "red"
        }

        const mockGame = activeGame({handNumber: 4, preferredRank, gameBoard, user: basicUser({...user, userId: id})});
        await gamesCollection.insertOne(mockGame);
        const card = mockGame.playerList[1].hand.find((card) => card.rank === preferredRank)
        const response = await request(app)
            .post(Routes.Game.ACTION_PROCESS)
            .set("Authorization", `Bearer ${await getToken(testUserId)}`)
            .send({
                gameCode: mockGame.code,
                targetIndex,
                action: GameActions.MOVE_CARD_TO_BOARD,
                card
            });

        expect(response.status).toBe(200);
        expect(response.body.newGame.gameBoard).toHaveLength(gameBoard.length - 1);
        const completedCardList = response.body.newGame.completedCardList.filter(Boolean);
        expect(completedCardList).toHaveLength(2);
        expect(response.body.newGame.completedCardList[0]).toBe(null);
        expect(response.body.newGame.completedCardList[12].i).toBe(card.i);
        expect(response.body.newGame.completedCardList[12].suit).toBe(card.suit);
        expect(response.body.newGame.completedCardList[12].rank).toBe(card.rank);
    })
});