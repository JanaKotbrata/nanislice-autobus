const request = require('supertest');
const express = require('express');
require("../services/setup-db");
const connectionDb = require("../../src/models/connection-db");
const CreateGame = require('../../src/routes/game/create');
const Routes = require("../../../shared/constants/routes");
let gamesCollection;
let usersCollection;

describe('POST /game/create', () => {
    let app;

    beforeAll(async () => {
        const db = await connectionDb();
        gamesCollection = db.collection('games');
        usersCollection = db.collection('users');

        app = express();
        app.use(express.json());
        new CreateGame(app);
    });

    afterAll(async () => {
        jest.clearAllMocks();
    });

    it('should create a game', async () => {
        const mockUser = {name:"name", googleId:"1243423", email:"test@test.com" };

        const user = await usersCollection.insertOne(mockUser);
        const id = user.insertedId.toString();

        const response = await request(app)
            .post(Routes.Games.CREATE)
            .send({ userId: id });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.code).toHaveLength(6);
        expect(response.body.status).toBe("initial");
    });

    it('should return an error if user does not exist', async () => {
        const response = await request(app)
            .post(Routes.Games.CREATE)
            .send({ userId: "nonexistent" });

        expect(response.status).toBe(400);
        //expect(response.error).toBe("User does not exist");//TODO
    });
});