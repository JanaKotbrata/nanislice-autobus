const request = require('supertest');
const express = require('express');
require("../services/setup-db");
const connectionDb = require("../../src/models/connection-db");
const GamePlayerRemove = require('../../src/routes/game/player-remove');
const Routes = require("../../../shared/constants/routes");
const ErrorHandler = require("../../src/middlewares/error-handler");
const {userMock, initialGame, generateRandomId, basicUser, activeGame} = require("../helpers/default-mocks");
const IO = require("../helpers/io-mock");
let gamesCollection;
let usersCollection;

describe('POST /game/player/remove', () => {
    let app;
    beforeAll(async () => {
        const db = await connectionDb();
        gamesCollection = db.collection('games');
        usersCollection = db.collection('users');

        app = express();
        app.use(express.json());
        new GamePlayerRemove(app, IO);
        app.use(ErrorHandler);
    });
    afterAll(async () => {
        jest.clearAllMocks();
    });

    it('should be able to remove a game', async () => {
        let mockUser = userMock();
        delete mockUser.userId;
        const result = await usersCollection.insertOne(mockUser);
        const user = await usersCollection.findOne({_id: result.insertedId});
        const mockGame = initialGame({user: basicUser({...user, userId: user._id.toString()})});
        await gamesCollection.insertOne(mockGame);
        const response = await request(app)
            .post(Routes.Game.PLAYER_REMOVE)
            .send({userId: user._id.toString(), gameCode: mockGame.code});

        expect(response.status).toBe(200);
        expect(response.body.playerList).toBeDefined();
        expect(response.body.playerList.length).toBe(1);

    });
    it('should be able to remove a game - activegame', async () => {
        let mockUser = userMock();
        delete mockUser.userId;
        const result = await usersCollection.insertOne(mockUser);
        const user = await usersCollection.findOne({_id: result.insertedId});
        const mockGame = activeGame({user: basicUser({...user, userId: user._id.toString()})});
        await gamesCollection.insertOne(mockGame);
        const response = await request(app)
            .post(Routes.Game.PLAYER_REMOVE)
            .send({userId: user._id.toString(), gameCode: mockGame.code});
        const deletedPlayer = mockGame.playerList.find((player) => player.userId === user._id.toString());
        expect(response.status).toBe(200);
        expect(response.body.deck.length).not.toBe(mockGame.deck.length);
        expect(response.body.deck.length).toBe(mockGame.deck.length + deletedPlayer.hand.length + deletedPlayer.bus.length);

    });
    it('should be able to remove a game- last player - it will deletes the game', async () => {
        let mockUser = userMock();
        delete mockUser.userId;
        const result = await usersCollection.insertOne(mockUser);
        const user = await usersCollection.findOne({_id: result.insertedId});
        const mockGame = initialGame({playerList: [basicUser({...user, userId: user._id.toString()})]});
        await gamesCollection.insertOne(mockGame);
        const response = await request(app)
            .post(Routes.Game.PLAYER_REMOVE)
            .send({userId: user._id.toString(), gameCode: mockGame.code});

        expect(response.status).toBe(200);
        expect(response.body.playerList).toBeUndefined();

    });
    test('should return an error if user does not exist', async () => {
        const mockGame = initialGame();
        await gamesCollection.insertOne(mockGame);
        const response = await request(app)
            .post(Routes.Game.PLAYER_REMOVE)
            .send({userId: generateRandomId(), gameCode: mockGame.code});

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Player is not in game");
    });
    test('should return an error if game does not exist', async () => {
        const user = await usersCollection.insertOne(userMock());
        const id = user.insertedId.toString();
        const response = await request(app)
            .post(Routes.Game.PLAYER_REMOVE)
            .send({userId: id, gameCode: "nonexi"});

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("Requested game does not exist");

    })
})