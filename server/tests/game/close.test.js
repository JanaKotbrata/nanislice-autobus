const request = require('supertest');
const express = require('express');
require("../services/setup-db");
const connectionDb = require("../../src/models/connection-db");
const CloseGame = require('../../src/routes/game/close');
const Routes = require("../../../shared/constants/routes.json");
const {generateGameCode} = require("../../src/utils/helpers");
const ErrorHandler = require("../../src/middlewares/error-handler");
let gamesCollection;

describe('POST /game/close', () => {
    let app;

    beforeAll(async () => {
        const db = await connectionDb();
        gamesCollection = db.collection('games');

        app = express();
        app.use(express.json());
        new CloseGame(app);
        app.use(ErrorHandler);
    });

    afterAll(async () => {
        jest.clearAllMocks();
    });

    it('should close a game by CODE', async () => {
        const mockGame = { code: generateGameCode(), state:"active" };
        await gamesCollection.insertOne(mockGame);

        const response = await request(app)
            .post(Routes.Game.CLOSE)
            .send({ gameCode: mockGame.code })

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.state).toBe("closed");
        expect(response.body.code).toBe(mockGame.code+"-#closed#");

    });
    test('CODE must be string with length 6', async () => {
        const mockGame = { code: 1,  state:"active" };

        const response = await request(app)
            .post(Routes.Game.CLOSE)
            .send({ gameCode: mockGame.code })

        expect(response.status).toBe(400);
        expect(response.body.name).toBe("InvalidDataError");
        expect(response.body.message).toBe(`\"gameCode\" must be a string`);

    });

});
