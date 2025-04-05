const request = require('supertest');
const express = require('express');
require("../services/setup-db");
const connectionDb = require("../../src/models/connection-db");
const GamePlayerAdd = require('../../src/routes/game/player-add');
const Routes = require("../../../shared/constants/routes");
let gamesCollection;
let usersCollection;

describe('POST /game/player-add', () => {
    let app;
    beforeAll(async () => {
        const db = await connectionDb();
        gamesCollection = db.collection('game');
        usersCollection = db.collection('users');

        app = express();
        app.use(express.json());
        new GamePlayerAdd(app);
    });
    afterAll(async () => {
        jest.clearAllMocks();
    });
    it("should add a player to a game", async () => {
        const mockUser = {name:"name", googleId:"1243423", email:"test@test.com" };

        const user = await usersCollection.insertOne(mockUser);
        const id = user.insertedId.toString();
        const mockGame = {code:"123456", status:"initial", players:[] };
        const game = await gamesCollection.insertOne(mockGame);
        const gameId = game.insertedId.toString();
        const response = await request(app)
            .post(Routes.Games.PLAYER_ADD)
            .send({ userId: id, gameCode: mockGame.code });

        expect(response.status).toBe(200);
        expect(response.body.players).toBeDefined();
        expect(response.body.players[0].userId).toBe(id);
    });
    test("should return an error if user does not exist", async () => {
        const mockGame = {code:"123456", status:"initial", players:[] };
        const game = await gamesCollection.insertOne(mockGame);
        const gameId = game.insertedId.toString();
        const response = await request(app)
            .post(Routes.Games.PLAYER_ADD)
            .send({ userId: "nonexistent", gameCode: mockGame.code });

        expect(response.status).toBe(400);
      //  expect(response.body.error).toBe("User does not exist");
    });
    test("should return an error if game does not exist", async () => {
        const mockUser = {name:"name", googleId:"1243423", email:"test@test.com" };
        const user = await usersCollection.insertOne(mockUser);
        const id = user.insertedId.toString();
        const response = await request(app).post(Routes.Games.PLAYER_ADD).send({ userId: id, gameCode: "nonexistent" });

        expect(response.status).toBe(400);
    })
});