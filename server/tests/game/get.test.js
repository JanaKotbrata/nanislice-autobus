const request = require('supertest');
require("../services/setup-db");
const GetGame = require('../../src/routes/game/get');
const Routes = require("../../../shared/constants/routes.json");
const {generateGameCode} = require("../../src/utils/helpers");
const {initialGame, userMock, basicUser} = require("../helpers/default-mocks");
const {setupTestServer, cleanup} = require("../services/test-setup");
const IO = require("../helpers/io-mock");
let gamesCollection;
let usersCollection;
let testUserId;
let getToken;

describe('GET /game/get', () => {
    let app;
    beforeAll(async () => {
        const setup = await setupTestServer(() => testUserId, (app) => {
            new GetGame(app, IO);
        });
        app = setup.app;
        gamesCollection = setup.gamesCollection;
        usersCollection = setup.usersCollection;
        getToken = setup.getToken;
    });
  
    afterEach(async () => {
        await cleanup();
    });

    it('should return a game by ID', async () => {
        const user = await usersCollection.insertOne(userMock({role:"admin"}));
        testUserId = user.insertedId.toString();
        const mockGame = initialGame({user: basicUser({...user, userId: testUserId})});
        const game = await gamesCollection.insertOne(mockGame);
        const id = game.insertedId.toString();

        const response = await request(app)
            .get(Routes.Game.GET)
            .set("Authorization", `Bearer ${await getToken()}`)
            .query({id})

        expect(response.body.success).toBe(true);
        expect(response.body.id).toBe(id);
        expect(response.body.code).toBe(mockGame.code);

    });
    it('should return a game by CODE', async () => {
        const mockGame = {code: generateGameCode(), playerList: []};
        await gamesCollection.insertOne(mockGame);

        const response = await request(app)
            .get(Routes.Game.GET)
            .set("Authorization", `Bearer ${await getToken()}`)
            .query({code: mockGame.code})

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.code).toBe(mockGame.code);

    });
    it('should not return a game by CODE - UserNotAuthorized', async () => {
        const user = await usersCollection.insertOne(userMock({role:"undefined"}));
        testUserId = user.insertedId.toString();
        const mockGame = initialGame({user: basicUser({...user, userId: testUserId})});
        await gamesCollection.insertOne(mockGame);

        const response = await request(app)
            .get(Routes.Game.GET)
            .set("Authorization", `Bearer ${await getToken()}`)
            .query({code: mockGame.code})

        expect(response.status).toBe(403);
        expect(response.body.name).toBe("UserNotAuthorized");

    });
    test('CODE must be string with length 6', async () => {
        const response = await request(app)
            .get(Routes.Game.GET)
            .set("Authorization", `Bearer ${await getToken()}`)
            .query({code: 1})

        expect(response.status).toBe(400);
        expect(response.body.name).toBe("InvalidDataError");
        expect(response.body.message).toBe(`"code" length must be 6 characters long`);

    });

    test('ID must be id', async () => {
        const response = await request(app)
            .get(Routes.Game.GET)
            .set("Authorization", `Bearer ${await getToken()}`)
            .query({id: 1})


        expect(response.status).toBe(400);
        expect(response.body.name).toBe("InvalidDataError");
        expect(response.body.message).toBe(`"id" length must be 24 characters long`);

    });
});
