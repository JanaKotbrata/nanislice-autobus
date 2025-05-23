const request = require('supertest');
const express = require('express');
require("../services/setup-db");
const connectionDb = require("../../src/models/connection-db");
const GamePlayerAdd = require('../../src/routes/game/player-add');
const Routes = require("../../../shared/constants/routes.json");
const ErrorHandler = require("../../src/middlewares/error-handler");
const {initialGame, generateRandomCode, generateRandomId, userMock} = require("../helpers/default-mocks");
let gamesCollection;
let usersCollection;

describe('POST /game/player-add', () => {
    let app;
    beforeAll(async () => {
        const db = await connectionDb();
        gamesCollection = db.collection('games');
        usersCollection = db.collection('users');

        app = express();
        app.use(express.json());
        new GamePlayerAdd(app);
        app.use(ErrorHandler);
    });
    afterAll(async () => {
        jest.clearAllMocks();
    });
    it("should add a player to a game", async () => {
        const user = await usersCollection.insertOne(userMock());
        const id = user.insertedId.toString();
        const mockGame = initialGame();
        await gamesCollection.insertOne(mockGame);

        const response = await request(app)
            .post(Routes.Game.PLAYER_ADD)
            .send({ userId: id, gameCode: mockGame.code });

        expect(response.status).toBe(200);
        expect(response.body.playerList).toBeDefined();
        expect(response.body.playerList[1].userId).toBe(id);
    });
    test("should return an error if user does not exist", async () => {
        const mockGame = initialGame();
        await gamesCollection.insertOne(mockGame);
        const response = await request(app)
            .post(Routes.Game.PLAYER_ADD)
            .send({ userId: generateRandomId(), gameCode: mockGame.code });

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("Requested user does not exist");
    });
    test("should return an error if game does not exist", async () => {
        const user = await usersCollection.insertOne(userMock());
        const id = user.insertedId.toString();
        const response = await request(app).post(Routes.Game.PLAYER_ADD).send({ userId: id, gameCode: "nonexi" });

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("Requested game does not exist");
    })
});