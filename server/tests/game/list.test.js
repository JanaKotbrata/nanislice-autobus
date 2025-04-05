const request = require('supertest');
const express = require('express');
require("../services/setup-db");
const connectionDb = require("../../src/models/connection-db");
const ListGame = require('../../src/routes/game/list');
const Routes = require("../../../shared/constants/routes");
let gamesCollection;

describe('GET /game/list', () => {
    let app;

    beforeAll(async () => {
        const db = await connectionDb();
        gamesCollection = db.collection('game');

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
        const mockGame = {code:"123456", status:"initial", players:[] };

        await gamesCollection.insertOne(mockGame);

        const response = await request(app)
            .get(Routes.Games.LIST)
            .send({});

        expect(response.status).toBe(200);
        expect(response.body.list).toHaveLength(1);
        expect(response.body.pageInfo).toBeDefined();
        expect(response.body.success).toBe(true);
    });
    test('should return empty list', async () => {
        const response = await request(app)
            .get(Routes.Games.LIST)
            .send({});

        expect(response.status).toBe(200);
        expect(response.body.list.length).toBe(0);
        expect(response.body.pageInfo).toBeDefined();
        expect(response.body.pageInfo.totalCount).toBe(0);
        expect(response.body.success).toBe(true);
    });
});