const request = require('supertest');
require("../services/setup-db");
const DeleteGame = require('../../src/routes/game/delete');
const Routes = require("../../../shared/constants/routes.json");
const {initialGame, generateRandomId, userMock} = require("../helpers/default-mocks");
const {setupTestServer, cleanup} = require("../services/test-setup");
const IO = require("../helpers/io-mock");
let gamesCollection;
let usersCollection;
let testUserId;
let getToken;
describe('POST /game/delete', () => {
    let app;
    beforeAll(async () => {
        const setup = await setupTestServer(() => testUserId, (app) => {
            new DeleteGame(app, IO);
        });
        app = setup.app;
        gamesCollection = setup.gamesCollection;
        usersCollection = setup.usersCollection;
        getToken = setup.getToken;
    });
  
    afterEach(async () => {
        await cleanup();
    });

    it('should delete a game', async () => {
        const user = await usersCollection.insertOne(userMock({}, ));
        testUserId = user.insertedId.toString();
        const mockGame = initialGame();
        const game = await gamesCollection.insertOne(mockGame);
        const id = game.insertedId.toString();

        const response = await request(app)
            .post(Routes.Game.DELETE)
            .set("Authorization", `Bearer ${getToken()}`)
            .send({ id });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
    });

    it('should return an error if game does not exist', async () => {
        const user = await usersCollection.insertOne(userMock({}, ));
        testUserId = user.insertedId.toString();
        const response = await request(app)
            .post(Routes.Game.DELETE)
            .set("Authorization", `Bearer ${getToken()}`)
            .send({ id: generateRandomId() });

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("Requested game does not exist");
    });
})