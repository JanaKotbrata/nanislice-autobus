const request = require('supertest');
require("../services/setup-db");
const ListUser = require('../../src/routes/user/list');
const Routes = require("../../../shared/constants/routes.json");
const { userMock} = require("../helpers/default-mocks");
const {setupTestServer, cleanup} = require("../services/test-setup");
const IO = require("../helpers/io-mock");

let usersCollection;
let testUserId;
let getToken;
describe('GET /user/list', () => {
    let app;
    beforeAll(async () => {
        const setup = await setupTestServer(() => testUserId, (app) => {
            new ListUser(app, IO);
        });
        app = setup.app;
        usersCollection = setup.usersCollection;
        getToken = setup.getToken;
    });

    afterEach(async () => {
        await cleanup();
        await usersCollection.deleteMany({});
    });

    it('should list all user', async () => {
        const count = 10;
        let user;
        for (let i = 0; i < count; i++) {
            const mockUser = userMock();
            user = await usersCollection.insertOne(mockUser);
        }
        testUserId = user.insertedId.toString();

        const response = await request(app)
            .get(Routes.User.LIST)
            .set("Authorization", `Bearer ${getToken()}`)
            .send({});

        expect(response.status).toBe(200);
        expect(response.body.list).toHaveLength(count);
        expect(response.body.pageInfo).toBeDefined();
        expect(response.body.pageInfo.totalCount).toBe(count);
        expect(response.body.success).toBe(true);
    });

});