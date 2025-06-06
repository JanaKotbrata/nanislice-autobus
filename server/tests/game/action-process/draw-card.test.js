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

    it('Draw card', async () => {
        const user = await usersCollection.insertOne(userMock());
        const id = user.insertedId.toString();
        testUserId = id;
        const mockGame = activeGame({handNumber: 4, user: basicUser({...user, userId: id},{isCardDrawed: false})});
        const game = await gamesCollection.insertOne(mockGame);
        const response = await request(app)
            .post(Routes.Game.ACTION_PROCESS)
            .send({gameId: game.insertedId.toString(), action: GameActions.DRAW_CARD});

        expect(response.status).toBe(200);
        expect(response.body.newGame.deck).toHaveLength(mockGame.deck.length - 1);
    });
    it('Draw card - NotPossibleToDraw', async () => {
        const user = await usersCollection.insertOne(userMock());
        const id = user.insertedId.toString();
        testUserId = id;
        const mockGame = activeGame({handNumber: 4, user: basicUser({...user, userId: id},{isCardDrawed: true})});
        const game = await gamesCollection.insertOne(mockGame);
        const response = await request(app)
            .post(Routes.Game.ACTION_PROCESS)
            .send({gameId: game.insertedId.toString(), action: GameActions.DRAW_CARD});

        expect(response.status).toBe(400);
        expect(response.body.name).toBe("NotPossibleToDraw");
    });
    it('Draw card - full hand', async () => {
        const user = await usersCollection.insertOne(userMock());
        const id = user.insertedId.toString();
        testUserId = id;
        const mockGame = activeGame({user: basicUser({...user, userId: id})});
        await gamesCollection.insertOne(mockGame);
        const response = await request(app)
            .post(Routes.Game.ACTION_PROCESS)
            .send({gameCode: mockGame.code, action: GameActions.DRAW_CARD});

        expect(response.status).toBe(400);
        expect(response.body.name).toBe("InvalidHandLength");
    });
    it('Draw card - user is not currentPlayer', async () => {
        const user = await usersCollection.insertOne(userMock());
        const id = user.insertedId.toString();
        testUserId = id;
        const mockGame = activeGame({currentPlayer: 0, handNumber: 4, user: basicUser({...user, userId: id})});
        await gamesCollection.insertOne(mockGame);
        const response = await request(app)
            .post(Routes.Game.ACTION_PROCESS)
            .send({gameCode: mockGame.code, action: GameActions.DRAW_CARD});

        expect(response.status).toBe(400);
        expect(response.body.name).toBe("UserIsNotCurrentPlayer");
    });

});