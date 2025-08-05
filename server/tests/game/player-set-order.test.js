const request = require('supertest');
require("../services/setup-db");
const {setupTestServer, cleanup} = require("../services/test-setup");
const GamePlayerSetOrder = require('../../src/routes/game/player-set-order');
const Routes = require("../../../shared/constants/routes.json");
const {initialGame, generateRandomId, userMock, basicUser, activeGame} = require("../helpers/default-mocks");
const IO = require("../helpers/io-mock");
let gamesCollection;
let usersCollection;
let getToken;
let testUserId;

describe('POST /game/player-set-order', () => {
    let app;
    beforeAll(async () => {
        const setup = await setupTestServer(() => testUserId, (app) => {
            new GamePlayerSetOrder(app, IO);
        });
        app = setup.app;
        gamesCollection = setup.gamesCollection;
        usersCollection = setup.usersCollection;
        getToken = setup.getToken;
    });
  
    afterEach(async () => {
        await cleanup();
    });
    it("should set a players order", async () => {
        let mockUser = userMock();
        delete mockUser.userId;
        const result = await usersCollection.insertOne(mockUser);
        const user = await usersCollection.findOne({_id: result.insertedId});
        const mockGame = initialGame({user: basicUser({...user, userId: user._id.toString()})});
        mockGame.playerList[0].creator = false;
        mockGame.playerList[1].creator = true;
        const playerList=[mockGame.playerList[1], mockGame.playerList[0]];
        await gamesCollection.insertOne(mockGame);
        testUserId = user._id.toString()
        const response = await request(app)
            .post(Routes.Game.PLAYER_SET_ORDER)
            .set("Authorization", `Bearer ${await getToken()}`)
            .send({playerList, gameCode: mockGame.code});

        expect(response.status).toBe(200);
        expect(response.body.playerList).toBeDefined();
        for(let i = 0; i < playerList.length; i++) {
            expect(response.body.playerList[i].userId).toBe(playerList[i].userId);
            expect(response.body.playerList[i].name).toBe(playerList[i].name);
        }
    });
    it("should not set players order to active game", async () => {
        let mockUser = userMock();
        delete mockUser.userId;
        const result = await usersCollection.insertOne(mockUser);
        const user = await usersCollection.findOne({_id: result.insertedId});
        const mockGame = activeGame({user: basicUser({...user, userId: user._id.toString()})});
        const game = await gamesCollection.insertOne(mockGame);
        testUserId = user._id.toString()
        const response = await request(app)
            .post(Routes.Game.PLAYER_SET_ORDER)
            .set("Authorization", `Bearer ${await getToken()}`)
            .send({playerList:[], gameId: game.insertedId.toString()});

        expect(response.body.name).toBe("GameAlreadyActive");
    });
    it("should not set an order players - players are longer", async () => {
        let mockUser = userMock();
        delete mockUser.userId;
        const result = await usersCollection.insertOne(mockUser);
        const user = await usersCollection.findOne({_id: result.insertedId});
        const mockGame = initialGame();
        const game = await gamesCollection.insertOne(mockGame);
        const playerList=[mockGame.playerList[1], mockGame.playerList[0], {userId: generateRandomId(), name: "name"}];
        testUserId = user._id.toString()
        const response = await request(app)
            .post(Routes.Game.PLAYER_SET_ORDER)
            .set("Authorization", `Bearer ${await getToken()}`)
            .send({playerList, gameId: game.insertedId.toString()});

        expect(response.status).toBe(400);
        expect(response.body.name).toBe("InvalidPlayerList");
    });
    it("should not set an order players - playerList contains different values", async () => {
        let mockUser = userMock();
        delete mockUser.userId;
        const result = await usersCollection.insertOne(mockUser);
        const user = await usersCollection.findOne({_id: result.insertedId});
        const mockGame = initialGame();
        const game = await gamesCollection.insertOne(mockGame);
        const playerList=[mockGame.playerList[1], {userId: generateRandomId(), name: "name"}];
        testUserId = user._id.toString()
        const response = await request(app)
            .post(Routes.Game.PLAYER_SET_ORDER)
            .set("Authorization", `Bearer ${await getToken()}`)
            .send({playerList, gameId: game.insertedId.toString()});

        expect(response.status).toBe(400);
        expect(response.body.name).toBe("InvalidPlayerList");
    });
    test("should return an error if game does not exist", async () => {
        const response = await request(app).post(Routes.Game.PLAYER_SET_ORDER).set("Authorization", `Bearer ${await getToken()}`).send({
            playerList:[],
            gameCode: "nonexi"
        });

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("Requested game does not exist");
    })
});