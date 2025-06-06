const request = require('supertest');
const express = require('express');
require("../services/setup-db");
const connectionDb = require("../../src/models/connection-db");
const CreateGame = require('../../src/routes/game/create');
const Routes = require("../../../shared/constants/routes.json");
const TestUserMiddleware = require("../services/test-user-middleware");
const ErrorHandler = require("../../src/middlewares/error-handler");
const {userMock, generateRandomId, closedGame, initialGame} = require("../helpers/default-mocks");

let gamesCollection;
let usersCollection;

let testUserId;

describe('POST /game/create', () => {
    let app;

    beforeAll(async () => {
        const db = await connectionDb();
        gamesCollection = db.collection('games');
        usersCollection = db.collection('users');

        app = express();
        app.use(express.json());
        app.use(TestUserMiddleware(() => testUserId));
        new CreateGame(app);
        app.use(ErrorHandler);
    });

    afterAll(async () => {
        jest.clearAllMocks();
    });

    it('should create a game', async () => {
        const user = await usersCollection.insertOne(userMock());
        testUserId = user.insertedId.toString();

        const response = await request(app)
            .post(Routes.Game.CREATE)
            .send({userId: testUserId});

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.code).toHaveLength(6);
        expect(response.body.state).toBe("initial");
    });

    it('should create a game - some closed game exist', async () => {
        const user = await usersCollection.insertOne(userMock());
        testUserId = user.insertedId.toString();
        const game = await gamesCollection.insertOne(closedGame({user}));
        const response = await request(app)
            .post(Routes.Game.CREATE)
            .send({userId: testUserId});

        expect(response.status).toBe(200);
        expect(response.body.id).not.toBe(game.insertedId.toString());
        expect(response.body.success).toBe(true);
        expect(response.body.code).toHaveLength(6);
        expect(response.body.state).toBe("initial");
    });
    it('should create a game - some game exist', async () => {
        const mockUser = userMock();
        const user = await usersCollection.insertOne(mockUser);
        testUserId = user.insertedId.toString();
        const initialGameData = initialGame({user: {...mockUser, userId: testUserId}});
        const game = await gamesCollection.insertOne(initialGameData);
        const response = await request(app)
            .post(Routes.Game.CREATE)
            .send({userId: testUserId});

        expect(response.status).toBe(200);
        expect(response.body.id).toBe(game.insertedId.toString());
        expect(response.body.success).toBe(true);
        expect(response.body.code).toHaveLength(6);
        expect(response.body.state).toBe("initial");
    });
    it('should return an error if user does not exist', async () => {
        testUserId = generateRandomId();
        const response = await request(app)
            .post(Routes.Game.CREATE)
            .send({userId: testUserId});

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("Requested user does not exist");
    });
});