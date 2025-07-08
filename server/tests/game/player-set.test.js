const request = require('supertest');
const express = require('express');
require("../services/setup-db");
const connectionDb = require("../../src/models/connection-db");
const GamePlayerAdd = require('../../src/routes/game/player-set');
const Routes = require("../../../shared/constants/routes.json");
const ErrorHandler = require("../../src/middlewares/error-handler");
const {initialGame, generateRandomId, userMock, basicUser} = require("../helpers/default-mocks");
const IO = require("../helpers/io-mock");
let gamesCollection;
let usersCollection;

describe('POST /game/player-set', () => {
    let app;
    beforeAll(async () => {
        const db = await connectionDb();
        gamesCollection = db.collection('games');
        usersCollection = db.collection('users');

        app = express();
        app.use(express.json());

        new GamePlayerAdd(app, IO);
        app.use(ErrorHandler);
    });
    afterAll(async () => {
        jest.clearAllMocks();
    });
    it("should set a player to a game", async () => {
        let mockUser = userMock();
        delete mockUser.userId;
        const result = await usersCollection.insertOne(mockUser);
        const user = await usersCollection.findOne({_id: result.insertedId});
        const mockGame = initialGame({user: basicUser({...user, userId: user._id.toString()})});
        await gamesCollection.insertOne(mockGame);
        const id = user._id.toString()
        const response = await request(app)
            .post(Routes.Game.PLAYER_SET)
            .send({userId: id, gameCode: mockGame.code, ready: true});

        expect(response.status).toBe(200);
        expect(response.body.playerList).toBeDefined();
        expect(response.body.playerList[1].userId).toBe(id);
        expect(response.body.playerList[1].ready).toBe(true);
    });
    test("should return an error if user does not exist", async () => {
        const mockGame = initialGame();
        await gamesCollection.insertOne(mockGame);
        const response = await request(app)
            .post(Routes.Game.PLAYER_ADD)
            .send({userId: generateRandomId(), gameCode: mockGame.code});

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("Requested user does not exist");
    });
    test("should return an error if game does not exist", async () => {
        const user = await usersCollection.insertOne(userMock());
        const id = user.insertedId.toString();
        const response = await request(app).post(Routes.Game.PLAYER_ADD).send({userId: id, gameCode: "nonexi"});

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("Requested game does not exist");
    })
});