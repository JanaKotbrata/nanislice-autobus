const request = require('supertest');
const express = require('express');
require("../services/setup-db");
const connectionDb = require("../../src/models/connection-db");
const ListGame = require('../../src/routes/game/list');
const Routes = require("../../../shared/constants/routes.json");
const {activeGame} = require("../helpers/default-mocks");
let gamesCollection;

describe('GET /game/list', () => {
    let app;

    beforeAll(async () => {
        const db = await connectionDb();
        gamesCollection = db.collection('games');

        app = express();
        app.use(express.json());
        new ListGame(app);
    });
    afterEach(async () => {
        await gamesCollection.deleteMany({});
    })
    afterAll(async () => {
        jest.clearAllMocks();
    });

    it('should list all game', async () => {
        const count = 10;
        for (let i = 0; i < count; i++) {
            const mockGame = activeGame();
            await gamesCollection.insertOne(mockGame);
        }

        const response = await request(app)
            .get(Routes.Game.LIST)
            .send({});

        expect(response.status).toBe(200);
        expect(response.body.list).toHaveLength(count);
        expect(response.body.pageInfo).toBeDefined();
        expect(response.body.pageInfo.totalCount).toBe(count);
        expect(response.body.success).toBe(true);
    });
    test('should return empty list', async () => {
        const response = await request(app)
            .get(Routes.Game.LIST)
            .send({});

        expect(response.status).toBe(200);
        expect(response.body.list.length).toBe(0);
        expect(response.body.pageInfo).toBeDefined();
        expect(response.body.pageInfo.totalCount).toBe(0);
        expect(response.body.success).toBe(true);
    });
});