const request = require('supertest');
const express = require('express');
require("../services/setup-db");
const connectionDb = require("../../src/models/connection-db");
const UpdateUser = require('../../src/routes/user/update');
const Routes = require("../../../shared/constants/routes.json");
const { userMock, initialGame} = require("../helpers/default-mocks");
const TestUserMiddleware = require("../services/test-user-middleware");
const ErrorHandler = require("../../src/middlewares/error-handler");
let usersCollection;
let gamesCollection;
let testUserId;
describe('POST /user/update', () => {
    let app;

    beforeAll(async () => {
        const db = await connectionDb();
        usersCollection = db.collection('users');
        gamesCollection = db.collection('games');
        app = express();
        app.use(express.json());
        app.use(TestUserMiddleware(() => testUserId));
        new UpdateUser(app);
        app.use(ErrorHandler);
    });
    afterEach(async () => {
        await usersCollection.deleteMany({});
    })
    afterAll(async () => {
        jest.clearAllMocks();
    });

    it('should update user', async () => {
        const user = await usersCollection.insertOne(userMock());
        testUserId = user.insertedId.toString();

        const name = "testing"

        const response = await request(app)
            .post(Routes.User.UPDATE)
            .send({name});

        expect(response.status).toBe(200);
        expect(response.body.name).toBe(name);
    });
    it('should update user - existing game', async () => {
        const user = await usersCollection.insertOne(userMock());
        testUserId = user.insertedId.toString();
        const initialGameData = initialGame({user: {...user, userId: testUserId}});
        const game = await gamesCollection.insertOne(initialGameData);
        const name = "testing"

        const response = await request(app)
            .post(Routes.User.UPDATE)
            .send({name});

        expect(response.status).toBe(200);
        expect(response.body.name).toBe(name);
    });
});