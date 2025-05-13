const request = require('supertest');
const express = require('express');
require("../services/setup-db");
const connectionDb = require("../../src/models/connection-db");
const GamePlayerRemove = require('../../src/routes/game/player-remove');
const Routes = require("../../../shared/constants/routes");
const ErrorHandler = require("../../src/middlewares/error-handler");
let gamesCollection;
let usersCollection;

describe('POST /game/player/remove', () => {
    let app;
    beforeAll(async () => {
        const db = await connectionDb();
        gamesCollection = db.collection('games');
        usersCollection = db.collection('user');

        app = express();
        app.use(express.json());
        new GamePlayerRemove(app);
        app.use(ErrorHandler);
    });
    afterAll(async () => {
        jest.clearAllMocks();
    });

    it('should be able to remove a game', async () => {
       const mockUser = {name:"name",googleId:"test",email:"test@gmail.com"};
         const user = await usersCollection.insertOne(mockUser);
            const id = user.insertedId.toString();
           const mockGame = {code:"123456", state:"initial", playerList:[{userId:"67e866929df5a69d7d902978", creator:true},{userId:id, creator:false}] };
            const game = await gamesCollection.insertOne(mockGame);
            const response = await request(app)
                .post(Routes.Game.PLAYER_REMOVE)
                .send({ userId: id, gameCode: mockGame.code });

            expect(response.status).toBe(200);
            expect(response.body.playerList).toBeDefined();
            expect(response.body.playerList.length).toBe(1);

    });
    test('should return an error if user does not exist', async () => {
        const mockGame = {code:"123456", state:"initial", playerList:[] };
        const game = await gamesCollection.insertOne(mockGame);
        const gameId = game.insertedId.toString();
        const response = await request(app)
            .post(Routes.Game.PLAYER_REMOVE)
            .send({ userId: "123456789112345678911234", gameCode: mockGame.code });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Player is not in game");
    });
    test('should return an error if game does not exist', async () => {
        const mockUser = {name:"name",googleId:"test",email:"test@gmail.com"};
        const user = await usersCollection.insertOne(mockUser);
        const id = user.insertedId.toString();
        const response = await request(app)
            .post(Routes.Game.PLAYER_REMOVE)
            .send({ userId: id, gameCode: "nonexi" });

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("Requested game does not exist");

    })
})