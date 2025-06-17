const request = require('supertest');
const express = require('express');
require("../services/setup-db");
const connectionDb = require("../../src/models/connection-db");
const GetGame = require('../../src/routes/game/get');
const Routes = require("../../../shared/constants/routes.json");
const {generateGameCode} = require("../../src/utils/helpers");
const ErrorHandler = require("../../src/middlewares/error-handler");
const {initialGame, userMock, basicUser} = require("../helpers/default-mocks");
const TestUserMiddleware = require("../services/test-user-middleware");
let gamesCollection;
let usersCollection;
let testUserId;
describe('GET /game/get', () => {
    let app;

    beforeAll(async () => {
        const db = await connectionDb();
        gamesCollection = db.collection('games');
        usersCollection = db.collection('users');

        app = express();
        app.use(express.json());
        app.use(TestUserMiddleware(() => testUserId));
        new GetGame(app);
        app.use(ErrorHandler);
    });

    afterAll(async () => {
        jest.clearAllMocks();
    });

    it('should return a game by ID', async () => {
        const user = await usersCollection.insertOne(userMock());
        testUserId = user.insertedId.toString();
        const mockGame = initialGame({user: basicUser({...user, userId: testUserId})});
        const game = await gamesCollection.insertOne(mockGame);
        const id = game.insertedId.toString();

        const response = await request(app)
            .get(Routes.Game.GET)
            .query({id})

        expect(response.body.success).toBe(true);
        expect(response.body.id).toBe(id);
        expect(response.body.code).toBe(mockGame.code);

    });
    it('should return a game by CODE', async () => {
        const mockGame = {code: generateGameCode(), playerList:[]};
        await gamesCollection.insertOne(mockGame);

        const response = await request(app)
            .get(Routes.Game.GET)
            .query({code: mockGame.code})

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.code).toBe(mockGame.code);

    });
    test('CODE must be string with length 6', async () => {
        const response = await request(app)
            .get(Routes.Game.GET)
            .query({code: 1})

        expect(response.status).toBe(400);
        expect(response.body.name).toBe("InvalidDataError");
        expect(response.body.message).toBe(`"code" length must be 6 characters long`);

    });

    test('ID must be id', async () => {
          const response = await request(app)
            .get(Routes.Game.GET)
            .query({id: 1})


        expect(response.status).toBe(400);
        expect(response.body.name).toBe("InvalidDataError");
        expect(response.body.message).toBe(`"id" length must be 24 characters long`);

    });
});
