const request = require('supertest');
const express = require('express');
require("../../services/setup-db");
const connectionDb = require("../../../src/models/connection-db");
const ProcessAction = require('../../../src/routes/game/action-process');
const Routes = require("../../../../shared/constants/routes.json");
const TestUserMiddleware = require("../../services/test-user-middleware");
const ErrorHandler = require("../../../src/middlewares/error-handler");
const GameActions = require("../../../../shared/constants/game-actions.json");
const {
    userMock,
    activeGame,
    basicUser,
} = require("../../helpers/default-mocks");

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
        new ProcessAction(app);
        app.use(ErrorHandler);
    });

    afterAll(async () => {
        jest.clearAllMocks();
    });
    it('Move card to bus - OK', async () => {
        const user = await usersCollection.insertOne(userMock());
        const id = user.insertedId.toString();
        const preferredRank = "2";
        testUserId = id;
        const mockGame = activeGame({handNumber: 4, preferredRank, user: basicUser({...user, userId: id})});
        await gamesCollection.insertOne(mockGame);
        const card = mockGame.playerList[1].hand.find((card) => card.rank === preferredRank);
        const response = await request(app)
            .post(Routes.Game.ACTION_PROCESS)
            .send({
                gameCode: mockGame.code,
                action: GameActions.MOVE_CARD_TO_BUS,
                card
            });
        expect(response.status).toBe(200);
        const bus =response.body.newGame.playerList[1].bus;
        expect(response.body.newGame.playerList[1].hand.length).toBe(mockGame.playerList[1].hand.length);
        expect(
            response.body.newGame.playerList[1].hand.find(
                (c) => c.i === card.i
            )
        ).toBeUndefined();
        expect(bus).toHaveLength(mockGame.playerList[1].bus.length + 1);
        expect(bus[bus.length - 1].i).toBe(mockGame.playerList[1].hand.find((card) => card.rank === preferredRank).i);
        expect(bus[bus.length - 1].rank).toBe(mockGame.playerList[1].hand.find((card) => card.rank === preferredRank).rank);
        expect(bus[bus.length - 1].suit).toBe(mockGame.playerList[1].hand.find((card) => card.rank === preferredRank).suit);

    });


});