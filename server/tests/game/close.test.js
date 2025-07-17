const request = require('supertest');
require("../services/setup-db");
const CloseGame = require('../../src/routes/game/close');
const Routes = require("../../../shared/constants/routes.json");
const {activeGame, userMock, generateRandomCode} = require("../helpers/default-mocks");
const {setupTestServer, cleanup} = require("../services/test-setup");
const IO = require("../helpers/io-mock");
const GameActions = require("../../../shared/constants/game-actions.json");
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
        const result = await usersCollection.insertOne(userMock({}, ));
        const user = await usersCollection.findOne({_id: result.insertedId});
        testUserId = user._id.toString();

        const mockGame = activeGame({user:{...user,userId:testUserId, creator:true}});
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
    it('should not close a game by CODE- UserIsNotAllowedToCloseGame', async () => {
        const result = await usersCollection.insertOne(userMock({}, ));
        const user = await usersCollection.findOne({_id: result.insertedId});
        testUserId = user._id.toString();

        const mockGame = activeGame({user:{...user,userId:testUserId}});
        await gamesCollection.insertOne(mockGame);

        const response = await request(app)
            .post(Routes.Game.CLOSE)
            .set("Authorization", `Bearer ${await getToken()}`)
            .send({gameCode: mockGame.code})

        expect(response.status).toBe(403);
        expect(response.body.name).toBe("UserIsNotAllowedToCloseGame");

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
    it('should return an error if game does not exist', async () => {
        const user = await usersCollection.insertOne(userMock());
        testUserId = user.insertedId.toString();
        const response = await request(app)
            .post(Routes.Game.CLOSE)
            .set("Authorization", `Bearer ${await getToken(testUserId)}`)
            .send({gameCode: generateRandomCode()});

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("Requested game does not exist");
    });

});
