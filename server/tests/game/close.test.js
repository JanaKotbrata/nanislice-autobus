const request = require('supertest');
const express = require('express');
require("../services/setup-db");
const connectionDb = require("../../src/models/connection-db");
const CloseGame = require('../../src/routes/game/close');
const Routes = require("../../../shared/constants/routes");
const {generateGameCode} = require("../../src/utils/helpers");
let gamesCollection;

describe('POST /game/close', () => {
    let app;

    beforeAll(async () => {
        const db = await connectionDb();
        gamesCollection = db.collection('game');

        app = express();
        app.use(express.json());
        new CloseGame(app);
    });

    afterAll(async () => {
        jest.clearAllMocks();
    });

    it('should close a game by CODE', async () => {
        const mockGame = { code: generateGameCode(), state:"active" };
        await gamesCollection.insertOne(mockGame);

        const response = await request(app)
            .post(Routes.Games.CLOSE)
            .send({ gameCode: mockGame.code })

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.status).toBe("closed");
        expect(response.body.code).toBe(mockGame.code+"-#closed#");

    });
    test('CODE must be string with length 6', async () => {
        const mockGame = { code: 1,  state:"active" };

        const response = await request(app)
            .post(Routes.Games.CLOSE)
            .send({ gameCode: mockGame.code })

        expect(response.status).toBe(400);
       // expect(response.error.name).toBe("InvalidDataError");
        expect(response.error.message).toBe("cannot POST /api/game/close (400)"); //TODO

    });

});
