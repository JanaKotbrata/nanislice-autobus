const request = require('supertest');
require("../services/setup-db");
const TokenDeleteAll = require('../../src/routes/service/token-delete-all');
const Routes = require("../../../shared/constants/routes.json");
const { userMock} = require("../helpers/default-mocks");
const {setupTestServer, cleanup} = require("../services/test-setup");
const IO = require("../helpers/io-mock");
let usersCollection;
let gamesCollection;
let testUserId;
let getToken;
describe('POST /user/token/deleteAll', () => {
    let app;
    beforeAll(async () => {
        const setup = await setupTestServer(() => testUserId, (app) => {
            new TokenDeleteAll(app, IO);
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

    it('should delete token', async () => {
        const user = await usersCollection.insertOne(userMock({role: 'admin'}));
        testUserId = user.insertedId.toString();

        const response = await request(app)
            .post(Routes.User.DELETE_ALL_TOKEN)
            .set("Authorization", `Bearer ${await getToken(testUserId)}`)
            .send({});

        expect(response.status).toBe(200);
    });

});