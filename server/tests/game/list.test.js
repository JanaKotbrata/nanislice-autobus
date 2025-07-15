const request = require('supertest');
require("../services/setup-db");
const ListGame = require('../../src/routes/game/list');
const Routes = require("../../../shared/constants/routes.json");
const {activeGame, userMock} = require("../helpers/default-mocks");
const IO = require("../helpers/io-mock");
const {setupTestServer, cleanup} = require("../services/test-setup");
let gamesCollection;
let usersCollection;
let testUserId;
let getToken;

describe('GET /game/list', () => {
    let app;
    beforeAll(async () => {
        const setup = await setupTestServer(() => testUserId, (app) => {
            new ListGame(app, IO);
        });
        app = setup.app;
        usersCollection = setup.usersCollection;
        gamesCollection = setup.gamesCollection;
        getToken = setup.getToken;
    });
    afterEach(async () => {
        await cleanup();
    });
    afterEach(async () => {
        await gamesCollection.deleteMany({});
        jest.clearAllMocks();
    })

    it('should list all game', async () => {
        const user = await usersCollection.insertOne(userMock({}, ));
        testUserId = user.insertedId.toString();
        const count = 10;
        for (let i = 0; i < count; i++) {
            const mockGame = activeGame();
            await gamesCollection.insertOne(mockGame);
        }

        const response = await request(app)
            .get(Routes.Game.LIST)
            .set("Authorization", `Bearer ${await getToken()}`)

        expect(response.status).toBe(200);
        expect(response.body.list).toHaveLength(count);
        expect(response.body.pageInfo).toBeDefined();
        expect(response.body.pageInfo.totalCount).toBe(count);
        expect(response.body.success).toBe(true);
    });
    test('should return empty list', async () => {
        const user = await usersCollection.insertOne(userMock({}, ));
        testUserId = user.insertedId.toString();
        const response = await request(app)
            .get(Routes.Game.LIST)
            .set("Authorization", `Bearer ${await getToken()}`)

        expect(response.status).toBe(200);
        expect(response.body.list.length).toBe(0);
        expect(response.body.pageInfo).toBeDefined();
        expect(response.body.pageInfo.totalCount).toBe(0);
        expect(response.body.success).toBe(true);
    });
});