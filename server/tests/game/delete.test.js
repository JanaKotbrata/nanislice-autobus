const request = require('supertest');
const express = require('express');
require("../services/setup-db");
const connectionDb = require("../../src/models/connection-db");
const DeleteGame = require('../../src/routes/game/delete');
const Routes = require("../../../shared/constants/routes.json");
const ErrorHandler = require("../../src/middlewares/error-handler");
let gamesCollection;

describe('POST /game/delete', () => {
    let app;

    beforeAll(async () => {
        const db = await connectionDb();
        gamesCollection = db.collection('games');

        app = express();
        app.use(express.json());
        new DeleteGame(app);
        app.use(ErrorHandler);
    });

    afterAll(async () => {
        jest.clearAllMocks();
    });

    it('should delete a game', async () => {
        const mockGame = {code:"123456", state:"initial", playerList:[] };

        const game = await gamesCollection.insertOne(mockGame);
        const id = game.insertedId.toString();

        const response = await request(app)
            .post(Routes.Game.DELETE)
            .send({ id });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
    });

    it('should return an error if game does not exist', async () => {
        const response = await request(app)
            .post(Routes.Game.DELETE)
            .send({ id: "123456789112345678911234" });

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("Requested game does not exist");
    });
})