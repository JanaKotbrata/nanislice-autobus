const request = require('supertest');
require("../services/setup-db");
const TokenDelete = require('../../src/routes/user/token-delete');
const Routes = require("../../../shared/constants/routes.json");
const { userMock} = require("../helpers/default-mocks");
const {setupTestServer, cleanup} = require("../services/test-setup");
const IO = require("../helpers/io-mock");
let usersCollection;
let gamesCollection;
let testUserId;
let getToken;
describe('POST /user/token/delete', () => {
    let app;
    beforeAll(async () => {
        const setup = await setupTestServer(() => testUserId, (app) => {
            new TokenDelete(app, IO);
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
        const user = await usersCollection.insertOne(userMock());
        testUserId = user.insertedId.toString();

        const response = await request(app)
            .post(Routes.User.DELETE_TOKEN)
            .set("Authorization", `Bearer ${await getToken(testUserId)}`)
            .send({});

        expect(response.status).toBe(200);
    });

});