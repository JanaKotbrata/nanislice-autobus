const request = require('supertest');
const express = require('express');
require("../services/setup-db");
const connectionDb = require("../../src/models/connection-db");
const StartGame = require('../../src/routes/game/start');
const Routes = require("../../../shared/constants/routes");
let gamesCollection;

describe('POST /game/start', () => {
    let app;

    beforeAll(async () => {
        const db = await connectionDb();
        gamesCollection = db.collection('game');

        app = express();
        app.use(express.json());
        new StartGame(app);
    });

    afterAll(async () => {
        jest.clearAllMocks();
    });

    it('should start a game', async () => {
        const mockGame = {code:"123456", status:"initial", players:[{userId:"123"},{userId:"4321"}] };
        await gamesCollection.insertOne(mockGame);

        const response = await request(app)
            .post(Routes.Games.START)
            .send({ gameCode: mockGame.code});

        expect(response.status).toBe(200); //TODO
        expect(response.body.success).toBe(true);
        expect(response.body.status).toBe("active");
        expect(response.body.deck).toBeDefined();
        expect(response.body.playerList[0].hand).toBeDefined();
        expect(response.body.playerList[0].bus).toBeDefined();
        expect(response.body.playerList[0].busStop).toBeDefined();
    });

    it('should return an error if game does not exist', async () => {
        const response = await request(app)
            .post(Routes.Games.START)
            .send({ gameCode: "1234F6" });

        expect(response.status).toBe(404);
    });
})