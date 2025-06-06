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

    it('Start new deck from bus - OK - Jr', async () => {
        const preferredRankInBus = "Jr";
        const user = await usersCollection.insertOne(userMock());
        const id = user.insertedId.toString();
        testUserId = id;
        const mockGame = activeGame({handNumber: 4, preferredRankInBus, user: basicUser({...user, userId: id})});
        await gamesCollection.insertOne(mockGame);
        const card = mockGame.playerList[1].bus.find((card) => card.rank === preferredRankInBus);
        const response = await request(app)
            .post(Routes.Game.ACTION_PROCESS)
            .send({
                gameCode: mockGame.code,
                action: GameActions.START_NEW_PACK_FROM_BUS,
                card
            });

        expect(response.status).toBe(200);
        expect(response.body.newGame.playerList[1].bus).toHaveLength(mockGame.playerList[1].bus.length - 1);
        expect(response.body.newGame.gameBoard).toHaveLength(mockGame.gameBoard.length + 1);
        expect(response.body.newGame.gameBoard[response.body.newGame.gameBoard.length - 1]).toHaveLength(1);
        expect(response.body.newGame.gameBoard[response.body.newGame.gameBoard.length - 1][0].i).toBe(card.i);
        expect(response.body.newGame.gameBoard[response.body.newGame.gameBoard.length - 1][0].rank).toBe(card.rank);
        expect(response.body.newGame.gameBoard[response.body.newGame.gameBoard.length - 1][0].suit).toBe(card.suit);
    })

});