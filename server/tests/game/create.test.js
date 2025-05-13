const request = require('supertest');
const express = require('express');
require("../services/setup-db");
const connectionDb = require("../../src/models/connection-db");
const CreateGame = require('../../src/routes/game/create');
const Routes = require("../../../shared/constants/routes.json");
const TestUserMiddleware = require("../services/test-user-middleware");
const ErrorHandler = require("../../src/middlewares/error-handler");
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
        const mockUser = {name:"name", googleId:"1243423", email:"test@test.com" };

        const user = await usersCollection.insertOne(mockUser);
        const id = user.insertedId.toString();

        testUserId = id;

        const response = await request(app)
            .post(Routes.Game.CREATE)
            .send({ userId: id });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.code).toHaveLength(6);
        expect(response.body.state).toBe("initial");
    });

    it('should return an error if user does not exist', async () => {
        testUserId = "123456789112345678911234";
        const response = await request(app)
            .post(Routes.Game.CREATE)
            .send({ userId: "12345678910123456789101234" });

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("Requested user does not exist");
    });
});