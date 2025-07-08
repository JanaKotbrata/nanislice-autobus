const request = require('supertest');
const express = require('express');
require("../services/setup-db");
const connectionDb = require("../../src/models/connection-db");
const ListUser = require('../../src/routes/user/list');
const Routes = require("../../../shared/constants/routes.json");
const {activeUser, userMock} = require("../helpers/default-mocks");
let usersCollection;

describe('GET /user/list', () => {
    let app;

    beforeAll(async () => {
        const db = await connectionDb();
        usersCollection = db.collection('users');

        app = express();
        app.use(express.json());
        new ListUser(app);
    });
    afterEach(async () => {
        await usersCollection.deleteMany({});
    })
    afterAll(async () => {
        jest.clearAllMocks();
    });

    it('should list all user', async () => {
        const count = 10;
        for (let i = 0; i < count; i++) {
            const mockUser = userMock();
            await usersCollection.insertOne(mockUser);
        }

        const response = await request(app)
            .get(Routes.User.LIST)
            .send({});

        expect(response.status).toBe(200);
        expect(response.body.list).toHaveLength(count);
        expect(response.body.pageInfo).toBeDefined();
        expect(response.body.pageInfo.totalCount).toBe(count);
        expect(response.body.success).toBe(true);
    });
    test('should return empty list', async () => {
        const response = await request(app)
            .get(Routes.User.LIST)
            .send({});

        expect(response.status).toBe(200);
        expect(response.body.list.length).toBe(0);
        expect(response.body.pageInfo).toBeDefined();
        expect(response.body.pageInfo.totalCount).toBe(0);
        expect(response.body.success).toBe(true);
    });
});