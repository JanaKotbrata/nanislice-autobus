const request = require('supertest');
const express = require('express');
require("../services/setup-db");
const connectionDb = require("../../src/models/connection-db");
const ProcessAction = require('../../src/routes/game/action-process');
const Routes = require("../../../shared/constants/routes.json");
const TestUserMiddleware = require("../services/test-user-middleware");
const ErrorHandler = require("../../src/middlewares/error-handler");
const GameActions = require("../../../shared/constants/game-actions.json");
const {
    userMock,
    generateRandomCode,
    initialGame,
    activeGame,
    basicUser,
    generateRandomId
} = require("../helpers/default-mocks");
const {generateGameCode} = require("../../src/utils/helpers");
const {RANK_CARD_ORDER} = require("../../src/utils/game-constants");
const IO = require("../helpers/io-mock");

let gamesCollection;
let usersCollection;

let testUserId;

describe('POST /game/action/process', () => {
    let app;

    beforeAll(async () => {
        const db = await connectionDb();
        gamesCollection = db.collection('games');
        usersCollection = db.collection('users');

        app = express();
        app.use(express.json());
        app.use(TestUserMiddleware(() => testUserId));
        new ProcessAction(app, IO);
        app.use(ErrorHandler);
    });

    afterAll(async () => {
        jest.clearAllMocks();
    });

    it('should return an error if game does not exist', async () => {
        const user = await usersCollection.insertOne(userMock());
        testUserId = user.insertedId.toString();
        const response = await request(app)
            .post(Routes.Game.ACTION_PROCESS)
            .send({gameCode: generateRandomCode(), action: GameActions.DRAW_CARD});

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("Requested game does not exist");
    });
    it('User does not exist ', async () => {
        testUserId = generateRandomId();
        const response = await request(app)
            .post(Routes.Game.ACTION_PROCESS)
            .send({gameCode: generateGameCode(), action: GameActions.DRAW_CARD});

        expect(response.status).toBe(404);
        expect(response.body.name).toBe("UserDoesNotExist");

    });
    it('Current user is not in game', async () => {
        const user = await usersCollection.insertOne(userMock());
        testUserId = user.insertedId.toString();
        const mockGame = activeGame();
        await gamesCollection.insertOne(mockGame);


        const response = await request(app)
            .post(Routes.Game.ACTION_PROCESS)
            .send({gameCode: mockGame.code, action: GameActions.DRAW_CARD});

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("User is not in game");

    });
    it('game is not active', async () => {
        const user = await usersCollection.insertOne(userMock());
        testUserId = user.insertedId.toString();
        const mockGame = initialGame({user: basicUser({...user, userId: testUserId})});
        await gamesCollection.insertOne(mockGame);


        const response = await request(app)
            .post(Routes.Game.ACTION_PROCESS)
            .send({gameCode: mockGame.code, action: GameActions.DRAW_CARD});

        expect(response.status).toBe(400);
        expect(response.body.name).toBe("GameIsNotActive");

    });

    it('Update deck - from completedList', async () => {
        const user = await usersCollection.insertOne(userMock());
        const id = user.insertedId.toString();
        testUserId = id;
        const mockGame = activeGame({user: basicUser({...user, userId: id})});
        mockGame.completedCardList = mockGame.deck.splice(0, mockGame.deck.length - 5);
        await gamesCollection.insertOne(mockGame);
        const oldHand = mockGame.playerList[1].hand;
        const response = await request(app)
            .post(Routes.Game.ACTION_PROCESS)
            .send({gameCode: mockGame.code, action: GameActions.REORDER_HAND, hand: oldHand});

        expect(response.status).toBe(200);
        expect(mockGame.deck.length).toBeLessThan(response.body.newGame.deck.length);
    });

    it('Update deck - without card in completedList', async () => {
        const user = await usersCollection.insertOne(userMock());
        const id = user.insertedId.toString();
        testUserId = id;
        const mockGame = activeGame({user: basicUser({...user, userId: id})});
        mockGame.gameBoard =splitCardsIntoGroups(mockGame.deck.splice(0, mockGame.deck.length - 5));
        mockGame.completedCardList = [];
        await gamesCollection.insertOne(mockGame);
        const oldHand = mockGame.playerList[1].hand;
        const response = await request(app)
            .post(Routes.Game.ACTION_PROCESS)
            .send({gameCode: mockGame.code, action: GameActions.REORDER_HAND, hand: oldHand});

        expect(response.status).toBe(200);
        expect(mockGame.deck.length).toBeLessThan(response.body.newGame.deck.length);
    });
    it('Dont need to have drawed cards ', async () => {
        const user = await usersCollection.insertOne(userMock());
        const id = user.insertedId.toString();
        testUserId = id;
        const mockGame = activeGame({user: basicUser({...user, userId: id, },{isCardDrawed: false})});
        await gamesCollection.insertOne(mockGame);
        const oldHand = mockGame.playerList[1].hand;
        const response = await request(app)
            .post(Routes.Game.ACTION_PROCESS)
            .send({gameCode: mockGame.code, action: GameActions.REORDER_HAND, hand: oldHand});

        expect(response.status).toBe(200);

    });
    it('invalid action', async () => {
        const user = await usersCollection.insertOne(userMock());
        const id = user.insertedId.toString();
        testUserId = id;
        const mockGame = activeGame({user: basicUser({...user, userId: id})});
        await gamesCollection.insertOne(mockGame);
        const oldHand = mockGame.playerList[1].hand;
        const response = await request(app)
            .post(Routes.Game.ACTION_PROCESS)
            .send({gameCode: mockGame.code, action: "invalid", hand: oldHand});

        expect(response.status).toBe(400);
        expect(response.body.name).toBe("ActionIsNotDefined");

    });
    it('PlayerMustDrawCardFirst ', async () => {
        const user = await usersCollection.insertOne(userMock());
        const id = user.insertedId.toString();
        testUserId = id;
        const mockGame = activeGame({user: basicUser({...user, userId: id, },{isCardDrawed: false})});
        await gamesCollection.insertOne(mockGame);
        const oldHand = mockGame.playerList[1].hand;
        const response = await request(app)
            .post(Routes.Game.ACTION_PROCESS)
            .send({gameCode: mockGame.code, action: GameActions.MOVE_CARD_TO_BOARD, targetIndex:0, card: oldHand[0]});

        expect(response.status).toBe(400);
        expect(response.body.name).toBe("PlayerMustDrawCardFirst");

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