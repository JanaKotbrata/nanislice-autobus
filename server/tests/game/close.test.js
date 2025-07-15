const request = require('supertest');
require("../services/setup-db");
const CloseGame = require('../../src/routes/game/close');
const Routes = require("../../../shared/constants/routes.json");
const {activeGame, userMock} = require("../helpers/default-mocks");
const {setupTestServer, cleanup} = require("../services/test-setup");
const IO = require("../helpers/io-mock");
let gamesCollection;
let usersCollection;
let testUserId;
let getToken;
describe('POST /game/close', () => {
    let app;
    beforeAll(async () => {
        const setup = await setupTestServer(() => testUserId, (app) => {
            new CloseGame(app, IO);
        });
        app = setup.app;
        gamesCollection = setup.gamesCollection;
        usersCollection = setup.usersCollection;
        getToken = setup.getToken;
    });
  
    afterEach(async () => {
        await cleanup();
    });

    it('should close a game by CODE', async () => {
        const user = await usersCollection.insertOne(userMock({}, ));
        testUserId = user.insertedId.toString();
        const mockGame = activeGame();
            await gamesCollection.insertOne(mockGame);

        const response = await request(app)
            .post(Routes.Game.CLOSE)
            .set("Authorization", `Bearer ${await getToken()}`)
            .send({gameCode: mockGame.code})

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.state).toBe("closed");
        expect(response.body.code).toBe(mockGame.code + "-#closed#");

    });
    test('CODE must be string with length 6', async () => {
        const user = await usersCollection.insertOne(userMock({}, ));
        testUserId = user.insertedId.toString();
        const response = await request(app)
            .post(Routes.Game.CLOSE)
            .set("Authorization", `Bearer ${await getToken()}`)
            .send({gameCode: 1})

        expect(response.status).toBe(400);
        expect(response.body.name).toBe("InvalidDataError");
        expect(response.body.message).toBe(`\"gameCode\" must be a string`);

    });

});
