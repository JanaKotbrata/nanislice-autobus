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
const IO = require("../../helpers/io-mock");
const {setupTestServer, cleanup} = require("../../services/test-setup");

let gamesCollection;
let usersCollection;
let getToken;
let testUserId;

describe('POST /game/action/process - start new pack', () => {
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

    it('Start new deck - failed', async () => {
        const preferredRank = "A";
        const user = await usersCollection.insertOne(userMock());
        const id = user.insertedId.toString();
        testUserId = id;
        const mockGame = activeGame({handNumber: 4, preferredRank, user: basicUser({...user, userId: id})});
        delete mockGame.sys;
        await gamesCollection.insertOne(mockGame);
        const response = await request(app)
            .post(Routes.Game.ACTION_PROCESS)
            .set("Authorization", `Bearer ${getToken(testUserId)}`)
            .send({
                gameCode: mockGame.code,
                action: GameActions.START_NEW_PACK,
                card: mockGame.playerList[1].hand.find((card) => card.rank === preferredRank)
            });

        expect(response.status).toBe(500);
        expect(response.body.name).toBe("FailedToUpdateGame");
    })
    it('Start new deck - OK - A', async () => {
        const preferredRank = "A";
        const user = await usersCollection.insertOne(userMock());
        const id = user.insertedId.toString();
        testUserId = id;
        const mockGame = activeGame({handNumber: 4, preferredRank, user: basicUser({...user, userId: id})});
        await gamesCollection.insertOne(mockGame);
        const card = mockGame.playerList[1].hand.find((card) => card.rank === preferredRank);
        const response = await request(app)
            .post(Routes.Game.ACTION_PROCESS)
            .set("Authorization", `Bearer ${getToken(testUserId)}`)
            .send({
                gameCode: mockGame.code,
                action: GameActions.START_NEW_PACK,
                card
            });

        expect(response.status).toBe(200);
        expect(response.body.newGame.gameBoard).toHaveLength(mockGame.gameBoard.length + 1);
        expect(response.body.newGame.gameBoard[response.body.newGame.gameBoard.length - 1]).toHaveLength(1);
        expect(response.body.newGame.gameBoard[response.body.newGame.gameBoard.length - 1][0].i).toBe(card.i);
        expect(response.body.newGame.gameBoard[response.body.newGame.gameBoard.length - 1][0].rank).toBe(card.rank);
        expect(response.body.newGame.gameBoard[response.body.newGame.gameBoard.length - 1][0].suit).toBe(card.suit);
    })
    it('Empty hand - should draw card', async () => {
        const preferredRank = "A";
        const user = await usersCollection.insertOne(userMock());
        const id = user.insertedId.toString();
        testUserId = id;
        const mockGame = activeGame({handNumber: 0, preferredRank, user: basicUser({...user, userId: id})});
        await gamesCollection.insertOne(mockGame);
        const card = mockGame.playerList[1].hand[0];
        const response = await request(app)
            .post(Routes.Game.ACTION_PROCESS)
            .set("Authorization", `Bearer ${getToken(testUserId)}`)
            .send({
                gameCode: mockGame.code,
                action: GameActions.START_NEW_PACK,
                card
            });

        expect(response.status).toBe(200);
        expect(response.body.newGame.playerList[1].isCardDrawed).toBe(false);
        expect(mockGame.playerList[1].isCardDrawed).toBe(true);

    })
    it('Start new deck - OK - Jr', async () => {
        const preferredRank = "Jr";
        const user = await usersCollection.insertOne(userMock());
        const id = user.insertedId.toString();
        testUserId = id;
        const mockGame = activeGame({handNumber: 4, preferredRank, user: basicUser({...user, userId: id})});
        await gamesCollection.insertOne(mockGame);
        const card = mockGame.playerList[1].hand.find((card) => card.rank === preferredRank);
        const response = await request(app)
            .post(Routes.Game.ACTION_PROCESS)
            .set("Authorization", `Bearer ${getToken(testUserId)}`)
            .send({
                gameCode: mockGame.code,
                action: GameActions.START_NEW_PACK,
                card
            });

        expect(response.status).toBe(200);
        expect(response.body.newGame.playerList[1].hand.length).toBe(mockGame.playerList[1].hand.length);
        expect(
            response.body.newGame.playerList[1].hand.find(
                (c) => c.i === card.i
            )
        ).toBeUndefined();
        expect(response.body.newGame.gameBoard[response.body.newGame.gameBoard.length - 1][0].i).toBe(card.i);
        expect(response.body.newGame.gameBoard[response.body.newGame.gameBoard.length - 1][0].rank).toBe(card.rank);
        expect(response.body.newGame.gameBoard[response.body.newGame.gameBoard.length - 1][0].suit).toBe(card.suit);
    })
    it('Start new deck - InvalidCardInGameBoard', async () => {
        const preferredRank = "3";
        const user = await usersCollection.insertOne(userMock());
        const id = user.insertedId.toString();
        testUserId = id;
        const mockGame = activeGame({handNumber: 4, preferredRank, user: basicUser({...user, userId: id})});
        await gamesCollection.insertOne(mockGame);
        const card = mockGame.playerList[1].hand.find((card) => card.rank === preferredRank);
        const response = await request(app)
            .post(Routes.Game.ACTION_PROCESS)
            .set("Authorization", `Bearer ${getToken(testUserId)}`)
            .send({
                gameCode: mockGame.code,
                action: GameActions.START_NEW_PACK,
                card
            });

        expect(response.status).toBe(400);
        expect(response.body.name).toBe("InvalidCardInGameBoard");
    })

});