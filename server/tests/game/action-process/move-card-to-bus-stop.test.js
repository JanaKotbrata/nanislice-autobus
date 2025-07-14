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

describe('POST /game/action/process move card to bus stop', () => {
    let app;
    beforeAll(async () => {
        const setup = await setupTestServer(() => testUserId, (app) => {
            new ProcessAction(app, IO);
        });
        app = setup.app;
        gamesCollection = setup.gamesCollection;
        usersCollection = setup.usersCollection;
        getToken = setup.getToken;
    });
    afterEach(async () => {
        await cleanup();
    });

    it('Move card to bus stop - invalid input', async () => {
        const user = await usersCollection.insertOne(userMock());
         testUserId = user.insertedId.toString();
        const response = await request(app)
            .post(Routes.Game.ACTION_PROCESS)
            .set("Authorization", `Bearer ${getToken(testUserId)}`)
            .send({gameCode: generateGameCode(), targetIndex: 1, action: GameActions.MOVE_CARD_TO_BUS_STOP});

        expect(response.status).toBe(400);
        expect(response.body.name).toBe("InvalidDataError");
        expect(response.body.message).toBe('"card" is required');
    })
    it('Move card to busstop', async () => {
        const user = await usersCollection.insertOne(userMock());
        const id = user.insertedId.toString();
        const targetIndex = 0;
        const preferredRank = "2";
        testUserId = id;
        const mockGame = activeGame({handNumber: 4, preferredRank, user: basicUser({...user, userId: id})});
        await gamesCollection.insertOne(mockGame);
        const card = mockGame.playerList[1].hand.find((card) => card.rank === preferredRank)
        const response = await request(app)
            .post(Routes.Game.ACTION_PROCESS)
            .set("Authorization", `Bearer ${getToken(testUserId)}`)
            .send({
                gameCode: mockGame.code,
                targetIndex,
                action: GameActions.MOVE_CARD_TO_BUS_STOP,
                card
            });

        expect(response.status).toBe(200);
        expect(response.body.newGame.playerList[1].hand.length).toBe(mockGame.playerList[1].hand.length);
        expect(
            response.body.newGame.playerList[1].hand.find(
                (c) => c.i === card.i
            )
        ).toBeUndefined();
        expect(response.body.newGame.playerList[1].busStop[targetIndex]).toHaveLength(mockGame.playerList[1].busStop[targetIndex].length + 1);
    })
    it('Move card to busstop - invalid card', async () => {
        const user = await usersCollection.insertOne(userMock());
        const id = user.insertedId.toString();
        const targetIndex = 0;
        const preferredRank = "A";
        testUserId = id;
        const mockGame = activeGame({handNumber: 4, preferredRank, user: basicUser({...user, userId: id})});
        await gamesCollection.insertOne(mockGame);
        const response = await request(app)
            .post(Routes.Game.ACTION_PROCESS)
            .set("Authorization", `Bearer ${getToken(testUserId)}`)
            .send({
                gameCode: mockGame.code,
                targetIndex,
                action: GameActions.MOVE_CARD_TO_BUS_STOP,
                card: mockGame.playerList[1].hand.find((card) => card.rank === preferredRank)
            });

        expect(response.status).toBe(400);
        expect(response.body.name).toBe("InvalidCardInBusStop");

    })

    it('Move card to busstop - invalid card - in not empty position', async () => { //FIXME sometimes does not work in coverage
        const user = await usersCollection.insertOne(userMock());
        const id = user.insertedId.toString();
        const targetIndex = 0;
        const preferredRank = "K";
        testUserId = id;
        const mockGame = activeGame({handNumber: 4, preferredRank, user: basicUser({...user, userId: id})});
        const card = mockGame.playerList[1].hand.find((card) => card.rank === preferredRank);
        const cardIndex = mockGame.playerList[1].hand.find((c) => c.i === card.i);
        mockGame.playerList[1].hand.splice(cardIndex, 1);
        mockGame.playerList[1].busStop[0].push(card);
        await gamesCollection.insertOne(mockGame);
        const response = await request(app)
            .post(Routes.Game.ACTION_PROCESS)
            .set("Authorization", `Bearer ${getToken(testUserId)}`)
            .send({
                gameCode: mockGame.code,
                targetIndex,
                action: GameActions.MOVE_CARD_TO_BUS_STOP,
                card: mockGame.playerList[1].hand.find((card) => card.rank !== preferredRank)
            });

        expect(response.status).toBe(400);
        expect(response.body.name).toBe("InvalidCardInBusStop");

    })
    it('Move card to busstop - in not empty position', async () => {
        const user = await usersCollection.insertOne(userMock());
        const id = user.insertedId.toString();
        const targetIndex = 0;
        const preferredRank = "K";
        testUserId = id;
        const mockGame = activeGame({handNumber: 4, preferredRank, user: basicUser({...user, userId: id})});
        const card = mockGame.deck.find((card) => card.rank === preferredRank);
        const cardIndex = mockGame.deck.find((c) => c.i === card.i);
        mockGame.deck.splice(cardIndex, 1);
        mockGame.playerList[1].busStop[0].push(card);
        await gamesCollection.insertOne(mockGame);
        const handCard = mockGame.playerList[1].hand.find((card) => card.rank === preferredRank);
        const response = await request(app)
            .post(Routes.Game.ACTION_PROCESS)
            .set("Authorization", `Bearer ${getToken(testUserId)}`)
            .send({
                gameCode: mockGame.code,
                targetIndex,
                action: GameActions.MOVE_CARD_TO_BUS_STOP,
                card: handCard
            });

        expect(response.status).toBe(200);
        expect(response.body.newGame.playerList[1].busStop[targetIndex]).toHaveLength(2)
        expect(response.body.newGame.playerList[1].busStop[targetIndex][1].i).toBe(handCard.i)
        expect(response.body.newGame.playerList[1].busStop[targetIndex][1].suit).toBe(handCard.suit)
        expect(response.body.newGame.playerList[1].busStop[targetIndex][1].rank).toBe(handCard.rank)

    })
    it('Move card to busstop - invalid target', async () => {
        const user = await usersCollection.insertOne(userMock());
        const id = user.insertedId.toString();
        const targetIndex = 4;
        const preferredRank = "2";
        testUserId = id;
        const mockGame = activeGame({handNumber: 4, preferredRank, user: basicUser({...user, userId: id})});
        await gamesCollection.insertOne(mockGame);
        const response = await request(app)
            .post(Routes.Game.ACTION_PROCESS)
            .set("Authorization", `Bearer ${getToken(testUserId)}`)
            .send({
                gameCode: mockGame.code,
                targetIndex,
                action: GameActions.MOVE_CARD_TO_BUS_STOP,
                card: mockGame.playerList[1].hand.find((card) => card.rank === preferredRank)
            });

        expect(response.status).toBe(400);
        expect(response.body.name).toBe("InvalidBusStopIndex");

    })


});