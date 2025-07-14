const request = require('supertest');
require("../../services/setup-db");
const ProcessAction = require('../../../src/routes/game/action-process');
const Routes = require("../../../../shared/constants/routes.json");
const GameActions = require("../../../../shared/constants/game-actions.json");
const {
    userMock,
    activeGame,
    basicUser,
} = require("../../helpers/default-mocks");
const {generateGameCode} = require("../../../src/utils/helpers");
const IO = require("../../helpers/io-mock");
const {setupTestServer, cleanup} = require("../../services/test-setup");

let gamesCollection;
let usersCollection;
let getToken;
let testUserId;

describe('POST /game/action/process - reorder hand', () => {
    let app;

    beforeAll(async () => {
        const setup = await setupTestServer(() => testUserId, (app) => {
            new ProcessAction(app, IO);
        });
        app = setup.app;
        gamesCollection = setup.gamesCollection;
        usersCollection = setup.usersCollection;
        getToken = setup.getToken;
    }, 15000);
    afterEach(async () => {
        await cleanup();
    });
    it('Reorder hand', async () => {
        const user = await usersCollection.insertOne(userMock());
        const id = user.insertedId.toString();
        testUserId = id;
        const mockGame = activeGame({user: basicUser({...user, userId: id})});
        await gamesCollection.insertOne(mockGame);
        const oldHand = mockGame.playerList[1].hand;
        const newHand = [oldHand[2], oldHand[0], oldHand[1], oldHand[3], oldHand[4]];
        const response = await request(app)
            .post(Routes.Game.ACTION_PROCESS)
            .set("Authorization", `Bearer ${getToken(testUserId)}`)
            .send({gameCode: mockGame.code, action: GameActions.REORDER_HAND, hand: newHand});

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        for (let i = 0; i < newHand.length; i++) {
            expect(response.body.newGame.playerList[1].hand[i].i).toBe(newHand[i].i);
            expect(response.body.newGame.playerList[1].hand[i].rank).toBe(newHand[i].rank);
            expect(response.body.newGame.playerList[1].hand[i].suit).toBe(newHand[i].suit);
        }
    });
    it('Reorder hand - hand is required', async () => {
        const response = await request(app)
            .post(Routes.Game.ACTION_PROCESS)
            .set("Authorization", `Bearer ${getToken(testUserId)}`)
            .send({gameCode: generateGameCode(), action: GameActions.REORDER_HAND});

        expect(response.status).toBe(400);
        expect(response.body.name).toBe("InvalidDataError");

    });
    it('Reorder hand - invalid hand', async () => {
        const response = await request(app)
            .post(Routes.Game.ACTION_PROCESS)
            .set("Authorization", `Bearer ${getToken(testUserId)}`)
            .send({gameCode: generateGameCode(), action: GameActions.REORDER_HAND, hand: "invalid"});

        expect(response.status).toBe(400);
        expect(response.body.name).toBe("InvalidDataError");

    });
    it('Reorder hand - invalid hand', async () => {
        const user = await usersCollection.insertOne(userMock());
        const id = user.insertedId.toString();
        testUserId = id;
        const mockGame = activeGame({user: basicUser({...user, userId: id})});
        await gamesCollection.insertOne(mockGame);
        const oldHand = mockGame.playerList[1].hand;
        const newHand = [oldHand[2], oldHand[0], oldHand[1], oldHand[3], ""];
        const response = await request(app)
            .post(Routes.Game.ACTION_PROCESS)
            .set("Authorization", `Bearer ${getToken(testUserId)}`)
            .send({gameCode: mockGame.code, action: GameActions.REORDER_HAND, hand: newHand});

        expect(response.status).toBe(400);
        expect(response.body.name).toBe("InvalidHandReorder");
    });
    it('Reorder hand - new hand is different length than old hand', async () => {
        const user = await usersCollection.insertOne(userMock());
        const id = user.insertedId.toString();
        testUserId = id;
        const mockGame = activeGame({user: basicUser({...user, userId: id})});
        await gamesCollection.insertOne(mockGame);
        const oldHand = mockGame.playerList[1].hand;
        const newHand = [oldHand[2], oldHand[0], oldHand[1], oldHand[3]];
        const response = await request(app)
            .post(Routes.Game.ACTION_PROCESS)
            .set("Authorization", `Bearer ${getToken(testUserId)}`)
            .send({gameCode: mockGame.code, action: GameActions.REORDER_HAND, hand: newHand});

        expect(response.status).toBe(400);
        expect(response.body.name).toBe("InvalidHandReorder");
    });

});