const request = require('supertest');
const express = require('express');
require("../services/setup-db");
const connectionDb = require("../../src/models/connection-db");
const GetGame = require('../../src/routes/game/get');
const Routes = require("../../../shared/constants/routes");
const {generateGameCode} = require("../../src/utils/helpers");
let gamesCollection;

describe('GET /game/get', () => {
    let app;

    beforeAll(async () => {
        const db = await connectionDb();
        gamesCollection = db.collection('games');

        app = express();
        app.use(express.json());
        new GetGame(app);
    });

    afterAll(async () => {
        jest.clearAllMocks();
    });

    it('should return a game by ID', async () => {
        const mockGame = {code: generateGameCode()};

        const game = await gamesCollection.insertOne(mockGame);
        const id = game.insertedId.toString();

        const response = await request(app)
            .get(Routes.Games.GET)
            .send({id})
            .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.id).toBe(id);
        expect(response.body.code).toBe(mockGame.code);

    });
    it('should return a game by CODE', async () => {
        const mockGame = {code: generateGameCode()};
        await gamesCollection.insertOne(mockGame);

        const response = await request(app)
            .get(Routes.Games.GET)
            .send({code: mockGame.code})

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.code).toBe(mockGame.code);

    });
    test('CODE must be string with length 6', async () => {
        const mockGame = {code: 1};

        const response = await request(app)
            .get(Routes.Games.GET)
            .send({code: mockGame.code})

        expect(response.status).toBe(400);
        // expect(response.error.name).toBe("InvalidDataError");
        expect(response.error.message).toBe("cannot GET /api/game/get (400)"); //TODO

    });

    test('ID must be id', async () => {
        const mockGame = {id: 1};

        const response = await request(app)
            .get(Routes.Games.GET)
            .send({code: mockGame.id})


        expect(response.status).toBe(400);
        // expect(response.error.name).toBe("InvalidDataError");
        expect(response.error.message).toBe("cannot GET /api/game/get (400)");//TODO

    });
});
