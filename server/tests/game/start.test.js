const request = require('supertest');
require("../services/setup-db");
const StartGame = require('../../src/routes/game/start');
const Routes = require("../../../shared/constants/routes.json");
const {initialGame, generateRandomCode, userMock, getPlayerList} = require("../helpers/default-mocks");
const IO = require("../helpers/io-mock");
const {setupTestServer, cleanup} = require("../services/test-setup");
let gamesCollection;
let usersCollection;
let testUserId;
let getToken;

describe('POST /game/start', () => {
    let app;
    beforeAll(async () => {
        const setup = await setupTestServer(() => testUserId, (app) => {
            new StartGame(app, IO);
        });
        app = setup.app;
        gamesCollection = setup.gamesCollection;
        usersCollection = setup.usersCollection;
        getToken = setup.getToken;
    });

    afterEach(async () => {
        await cleanup();
    });

    it('should start a game', async () => {
        const user = await usersCollection.insertOne(userMock({}, ));
        testUserId = user.insertedId.toString();
        const playerList = getPlayerList();
        playerList[0].userId = testUserId;
        const mockGame = initialGame({playerList});
        await gamesCollection.insertOne(mockGame);

        const response = await request(app)
            .post(Routes.Game.START)
            .set("Authorization", `Bearer ${await getToken()}`)
            .send({gameCode: mockGame.code});

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.state).toBe("active");
        expect(response.body.deck).toBeDefined();
        expect(response.body.playerList[0].hand).toBeDefined();
        expect(response.body.playerList[0].bus).toBeDefined();
        expect(response.body.playerList[0].busStop).toBeDefined();
    });

    it('should return an error if game does not exist', async () => {
        const response = await request(app)
            .post(Routes.Game.START)
            .set("Authorization", `Bearer ${await getToken()}`)
            .send({gameCode: generateRandomCode()});

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("Requested game does not exist");
    });
});