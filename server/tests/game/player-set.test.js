const request = require('supertest');
require("../services/setup-db");
const {setupTestServer, cleanup} = require("../services/test-setup");
const GamePlayerAdd = require('../../src/routes/game/player-set');
const Routes = require("../../../shared/constants/routes.json");
const {initialGame, generateRandomId, userMock, basicUser} = require("../helpers/default-mocks");
const IO = require("../helpers/io-mock");
let gamesCollection;
let usersCollection;
let getToken;
let testUserId;

describe('POST /game/player-set', () => {
    let app;
    beforeAll(async () => {
        const setup = await setupTestServer(() => testUserId, (app) => {
            new GamePlayerAdd(app, IO);
        });
        app = setup.app;
        gamesCollection = setup.gamesCollection;
        usersCollection = setup.usersCollection;
        getToken = setup.getToken;
    });
  
    afterEach(async () => {
        await cleanup();
    });
    it("should set a player to a game", async () => {
        let mockUser = userMock();
        delete mockUser.userId;
        const result = await usersCollection.insertOne(mockUser);
        const user = await usersCollection.findOne({_id: result.insertedId});
        const mockGame = initialGame({user: basicUser({...user, userId: user._id.toString()})});
        await gamesCollection.insertOne(mockGame);
        const id = user._id.toString()
        const response = await request(app)
            .post(Routes.Game.PLAYER_SET)
            .set("Authorization", `Bearer ${await getToken()}`)
            .send({userId: id, gameCode: mockGame.code, ready: true});

        expect(response.status).toBe(200);
        expect(response.body.playerList).toBeDefined();
        expect(response.body.playerList[1].userId).toBe(id);
        expect(response.body.playerList[1].ready).toBe(true);
    });
    test("should return an error if user does not exist", async () => {
        const mockGame = initialGame();
        await gamesCollection.insertOne(mockGame);
        const response = await request(app)
            .post(Routes.Game.PLAYER_SET)
            .set("Authorization", `Bearer ${await getToken()}`)
            .send({userId: generateRandomId(), gameCode: mockGame.code});

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("Requested user does not exist");
    });
    test("should return an error if game does not exist", async () => {
        const user = await usersCollection.insertOne(userMock());
        const id = user.insertedId.toString();
        const response = await request(app).post(Routes.Game.PLAYER_SET).set("Authorization", `Bearer ${await getToken()}`).send({
            userId: id,
            gameCode: "nonexi"
        });

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("Requested game does not exist");
    })
});