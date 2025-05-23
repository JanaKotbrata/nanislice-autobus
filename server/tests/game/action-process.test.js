const request = require('supertest');
const express = require('express');
require("../services/setup-db");
const connectionDb = require("../../src/models/connection-db");
const ProcessAction = require('../../src/routes/game/action-process');
const Routes = require("../../../shared/constants/routes.json");
const TestUserMiddleware = require("../services/test-user-middleware");
const ErrorHandler = require("../../src/middlewares/error-handler");
const GameActions = require("../../../shared/constants/game-actions.json");
const {userMock, generateRandomCode, initialGame, activeGame, basicUser} = require("../helpers/default-mocks");
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

    it('should return an error if game does not exist', async () => {
        await usersCollection.insertOne(userMock());
        const response = await request(app)
            .post(Routes.Game.ACTION_PROCESS)
            .send({gameCode: generateRandomCode(), action:GameActions.REORDER_HAND});

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("Requested game does not exist");
    });

    it('Current user is not in game', async () => {
        const user = await usersCollection.insertOne(userMock());
        const id = user.insertedId.toString();
        testUserId = id;
        const mockGame = initialGame();
        await gamesCollection.insertOne(mockGame);


        const response = await request(app)
            .post(Routes.Game.ACTION_PROCESS)
            .send({ gameCode: mockGame.code, action:GameActions.REORDER_HAND });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("User is not in game");

    });
    it('should update a game', async () => {
        const user = await usersCollection.insertOne(userMock());
        const id = user.insertedId.toString();
        testUserId = id;
        const mockGame = activeGame({ user:basicUser({...user, userId: id})});
        await gamesCollection.insertOne(mockGame);


        const response = await request(app)
            .post(Routes.Game.ACTION_PROCESS)
            .send({ gameCode: mockGame.code, action:GameActions.REORDER_HAND, hand: mockGame.playerList[1].hand });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
    });

    //TODO TEST for every action and alternative scenario
});