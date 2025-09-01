const request = require('supertest');
require("../services/setup-db");

const RematchGame = require('../../src/routes/game/rematch');
const Routes = require("../../../shared/constants/routes.json");
const { userMock, generateRandomId, activeGame, finishedGame, basicUser, generateRandomCode} = require("../helpers/default-mocks");
const { setupTestServer, cleanup } = require("../services/test-setup");
const IO = require("../helpers/io-mock");

let gamesCollection;
let usersCollection;
let testUserId;
let getToken;

describe('POST /game/rematch – valid user', () => {
    let app;

    beforeAll(async () => {
        const setup = await setupTestServer(() => testUserId, (app) => {
            new RematchGame(app, IO);
        });
        app = setup.app;
        gamesCollection = setup.gamesCollection;
        usersCollection = setup.usersCollection;
        getToken = setup.getToken;
    });

    afterEach(async () => {
        await cleanup();
    });

    afterEach(async () => {
        await gamesCollection.deleteMany({});
        await usersCollection.deleteMany({});
    });

    it('should rematch a game', async () => {
        const user = await usersCollection.insertOne(userMock());
        testUserId = user.insertedId.toString();
        let mockGame = finishedGame({user: basicUser({...user, userId: testUserId})});
        mockGame.playerList[0].nextGame = true;
        delete mockGame.playerList[0].creator;
        mockGame.playerList[1].nextGame = true;
        const game = await gamesCollection.insertOne(mockGame);

        const response = await request(app)
            .post(Routes.Game.REMATCH)
            .set("Authorization", `Bearer ${await getToken(testUserId)}`)
            .send({gameCode:mockGame.code});
        const finGame = await gamesCollection.findOne({_id: game.insertedId});
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.code).toHaveLength(6);
        expect(response.body.state).toBe("initial");
        expect(response.body.playerList[0]?.creator).toBe(true);
        expect(finGame.state).toBe("closed");
    });
    it('failed rematch a game - is not proper state', async () => {
        const user = await usersCollection.insertOne(userMock());
        testUserId = user.insertedId.toString();
        const mockGame = activeGame({user: basicUser({...user, userId: testUserId})});
        const game = await gamesCollection.insertOne(mockGame);
        const response = await request(app)
            .post(Routes.Game.REMATCH)
            .set("Authorization", `Bearer ${await getToken(testUserId)}`)
            .send({gameId: game.insertedId.toString()});
        const finGame = await gamesCollection.findOne({_id: game.insertedId});
        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("Game has to be in finished state.");
        expect(finGame.state).not.toBe("closed");
    });

});

describe('POST /game/rematch – user does not exist', () => {
    let app;

    beforeAll(async () => {
        testUserId = generateRandomId();
        const setup = await setupTestServer(() => testUserId, (app) => {
            new RematchGame(app, IO);
        }, true);
        app = setup.app;
        gamesCollection = setup.gamesCollection;
        usersCollection = setup.usersCollection;
        getToken = setup.getToken;
    });
  

    it('should return an error if user does not exist', async () => {
        const response = await request(app)
            .post(Routes.Game.REMATCH)
            .set("Authorization", `Bearer ${await getToken(testUserId)}`)
            .send({gameCode:generateRandomCode()});

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("Requested user does not exist");
    });
});
