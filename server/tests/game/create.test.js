const request = require('supertest');
require("../services/setup-db");

const CreateGame = require('../../src/routes/game/create');
const Routes = require("../../../shared/constants/routes.json");
const { userMock, generateRandomId, closedGame, initialGame, activeGame} = require("../helpers/default-mocks");
const { setupTestServer, cleanup } = require("../services/test-setup");
const IO = require("../helpers/io-mock");

let gamesCollection;
let usersCollection;
let testUserId;
let getToken;

describe('POST /game/create – valid user', () => {
    let app;

    beforeAll(async () => {
        const setup = await setupTestServer(() => testUserId, (app) => {
            new CreateGame(app, IO);
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

    it('should create a game', async () => {
        const user = await usersCollection.insertOne(userMock());
        testUserId = user.insertedId.toString();

        const response = await request(app)
            .post(Routes.Game.CREATE)
            .set("Authorization", `Bearer ${await getToken(testUserId)}`)
            .send();

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.code).toHaveLength(6);
        expect(response.body.state).toBe("initial");
    });
    it('should return existing game', async () => {
        const result = await usersCollection.insertOne(userMock());
        const user = await usersCollection.findOne({_id: result.insertedId});
        testUserId = user._id.toString();

        const mockGame = activeGame({user: {...user, userId: testUserId}});
         await gamesCollection.insertOne(mockGame);
        const response = await request(app)
            .post(Routes.Game.CREATE)
            .set("Authorization", `Bearer ${await getToken(testUserId)}`)
            .send();

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.code).toHaveLength(6);
        expect(response.body.state).toBe("active");
    });
    it('should create a game – some closed game exist', async () => {
        const user = await usersCollection.insertOne(userMock());
        testUserId = user.insertedId.toString();

        const closed = closedGame({ user });
        const game = await gamesCollection.insertOne(closed);

        const response = await request(app)
            .post(Routes.Game.CREATE)
            .set("Authorization", `Bearer ${await getToken(testUserId)}`)
            .send();

        expect(response.status).toBe(200);
        expect(response.body.id).not.toBe(game.insertedId.toString());
        expect(response.body.success).toBe(true);
        expect(response.body.code).toHaveLength(6);
        expect(response.body.state).toBe("initial");
    });

    it('should create a game – some game exist', async () => {
        const mockUser = userMock();
        const user = await usersCollection.insertOne(mockUser);
        testUserId = user.insertedId.toString();
        initialGame({ user: { ...mockUser, userId: testUserId } });

        const response = await request(app)
            .post(Routes.Game.CREATE)
            .set("Authorization", `Bearer ${await getToken(testUserId)}`)
            .send();

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.code).toHaveLength(6);
        expect(response.body.state).toBe("initial");
    });
});

describe('POST /game/create – user does not exist', () => {
    let app;

    beforeAll(async () => {
        testUserId = generateRandomId();
        const setup = await setupTestServer(() => testUserId, (app) => {
            new CreateGame(app, IO);
        }, true);
        app = setup.app;
        gamesCollection = setup.gamesCollection;
        usersCollection = setup.usersCollection;
        getToken = setup.getToken;
    });
  

    it('should return an error if user does not exist', async () => {
        const response = await request(app)
            .post(Routes.Game.CREATE)
            .set("Authorization", `Bearer ${await getToken(testUserId)}`)
            .send();

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("Requested user does not exist");
    });
});
