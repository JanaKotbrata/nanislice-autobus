const request = require('supertest');
require("../services/setup-db");
const GamePlayerAdd = require('../../src/routes/game/player-add');
const Routes = require("../../../shared/constants/routes.json");
const {activeGame, initialGame, generateRandomId, userMock} = require("../helpers/default-mocks");
const IO = require("../helpers/io-mock");
const {setupTestServer, cleanup} = require("../services/test-setup");
let gamesCollection;
let usersCollection;
let testUserId;
let getToken;

describe('POST /game/player-add', () => {
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
    it("should add a player to a game", async () => {
        const user = await usersCollection.insertOne(userMock());
        const id = user.insertedId.toString();
        const mockGame = initialGame();
        await gamesCollection.insertOne(mockGame);

        const response = await request(app)
            .post(Routes.Game.PLAYER_ADD)
            .set("Authorization", `Bearer ${await getToken()}`)
            .send({userId: id, gameCode: mockGame.code});

        expect(response.status).toBe(200);
        expect(response.body.playerList).toBeDefined();
        expect(response.body.playerList[1].userId).toBe(id);
    });
    it("should not add a player into active game", async () => {
        const user = await usersCollection.insertOne(userMock());
        const id = user.insertedId.toString();
        const mockGame = activeGame();
        await gamesCollection.insertOne(mockGame);

        const response = await request(app)
            .post(Routes.Game.PLAYER_ADD)
            .set("Authorization", `Bearer ${await getToken()}`)
            .send({userId: id, gameCode: mockGame.code});

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Game is already active is not possible to add player.");
    });
    it("should not add a same player into game", async () => {
        const user = await usersCollection.insertOne(userMock());
        const id = user.insertedId.toString();
        const mockGame = initialGame({user: {...user, userId: id}});
        await gamesCollection.insertOne(mockGame);

        const response = await request(app)
            .post(Routes.Game.PLAYER_ADD)
            .set("Authorization", `Bearer ${await getToken()}`)
            .send({userId: id, gameCode: mockGame.code});

        expect(response.status).toBe(400);
        expect(response.body.name).toBe("PlayerAlreadyInGame");
    });
    test("should return an error if user does not exist", async () => {
        const mockGame = initialGame();
        await gamesCollection.insertOne(mockGame);
        const response = await request(app)
            .post(Routes.Game.PLAYER_ADD)
            .set("Authorization", `Bearer ${await getToken()}`)
            .send({userId: generateRandomId(), gameCode: mockGame.code});

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("Requested user does not exist");
    });
    test("should return an error if game does not exist", async () => {
        const user = await usersCollection.insertOne(userMock());
        const id = user.insertedId.toString();
        const response = await request(app).post(Routes.Game.PLAYER_ADD).set("Authorization", `Bearer ${await getToken()}`).send({userId: id, gameId: generateRandomId()});

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("Requested game does not exist");
    })
});