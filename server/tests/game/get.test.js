const request = require('supertest');
const express = require('express');
require("../services/setup-db");
const connectionDb = require("../../src/models/connection-db");
const GetGame = require('../../src/routes/game/get');
const Routes = require("../../../shared/constants/routes.json");
const {generateGameCode} = require("../../src/utils/helpers");
const ErrorHandler = require("../../src/middlewares/error-handler");
let gamesCollection;

describe('GET /game/get', () => {
    let app;

    beforeAll(async () => {
        const db = await connectionDb();
        gamesCollection = db.collection('games');

        app = express();
        app.use(express.json());
        new GetGame(app);
        app.use(ErrorHandler);
    });

    afterAll(async () => {
        jest.clearAllMocks();
    });

    it('should return a game by ID', async () => {
        const mockGame = {code: generateGameCode(), playerList:[]};

        const game = await gamesCollection.insertOne(mockGame);
        const id = game.insertedId.toString();

        const response = await request(app)
            .get(Routes.Game.GET)
            .query({id})
            .expect(200);

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
        const mockGame = {code: 1};

        const response = await request(app)
            .get(Routes.Game.GET)
            .query({code: mockGame.code})

        expect(response.status).toBe(400);
        expect(response.body.name).toBe("InvalidDataError");
        expect(response.body.message).toBe(`"code" length must be 6 characters long`); //TODO

    });

    test('ID must be id', async () => {
        const mockGame = {id: 1};

        const response = await request(app)
            .get(Routes.Game.GET)
            .query({id: mockGame.id})


        expect(response.status).toBe(400);
        expect(response.body.name).toBe("InvalidDataError");
        expect(response.body.message).toBe(`"id" length must be 24 characters long`);//TODO

    });
});
