const request = require('supertest');
const express = require('express');
require("../services/setup-db");
const connectionDb = require("../../src/models/connection-db");
const UpdateUser = require('../../src/routes/user/update');
const Routes = require("../../../shared/constants/routes.json");
const { userMock, initialGame} = require("../helpers/default-mocks");
const TestUserMiddleware = require("../services/test-user-middleware");
const ErrorHandler = require("../../src/middlewares/error-handler");
const {setupTestServer, cleanup} = require("../services/test-setup");
const CreateGame = require("../../src/routes/game/create");
const IO = require("../helpers/io-mock");
let usersCollection;
let gamesCollection;
let testUserId;
let getToken;
describe('POST /user/update', () => {
    let app;
    beforeAll(async () => {
        const setup = await setupTestServer(() => testUserId, (app) => {
            new UpdateUser(app, IO);
        });
        app = setup.app;
        gamesCollection = setup.gamesCollection;
        usersCollection = setup.usersCollection;
        getToken = setup.getToken;
    });

    afterEach(async () => {
        await cleanup();
        await usersCollection.deleteMany({});

    });

    it('should update user', async () => {
        const user = await usersCollection.insertOne(userMock());
        testUserId = user.insertedId.toString();

        const name = "testing"

        const response = await request(app)
            .post(Routes.User.UPDATE)
            .set("Authorization", `Bearer ${getToken(testUserId)}`)
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
            .set("Authorization", `Bearer ${getToken(testUserId)}`)
            .send({name});

        expect(response.status).toBe(200);
        expect(response.body.name).toBe(name);
    });
});