const request = require('supertest');
const express = require('express');
require("../services/setup-db");
const connectionDb = require("../../src/models/connection-db");
const StartGame = require('../../src/routes/game/start');
const Routes = require("../../../shared/constants/routes.json");
const ErrorHandler = require("../../src/middlewares/error-handler");
const {initialGame, generateRandomCode} = require("../helpers/default-mocks");
let gamesCollection;

describe('POST /game/start', () => {
    let app;

    beforeAll(async () => {
        const db = await connectionDb();
        gamesCollection = db.collection('games');

        app = express();
        app.use(express.json());
        new StartGame(app);
        app.use(ErrorHandler);
    });

    afterAll(async () => {
        jest.clearAllMocks();
    });

    it('should start a game', async () => {
        const mockGame = initialGame();
        await gamesCollection.insertOne(mockGame);

        const response = await request(app)
            .post(Routes.Game.START)
            .send({gameCode: mockGame.code});

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.state).toBe("active");
        expect(response.body.deck).toBeDefined();
        expect(response.body.playerList[0].hand).toBeDefined();
        expect(response.body.playerList[0].bus).toBeDefined();
        expect(response.body.playerList[0].busStop).toBeDefined();
    });

    it('should return an error if game does not exist', async () => {
        const response = await request(app)
            .post(Routes.Game.START)
            .send({gameCode: generateRandomCode()});

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("Requested game does not exist");
    });
});