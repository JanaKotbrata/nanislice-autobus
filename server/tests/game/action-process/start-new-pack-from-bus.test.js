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
const {States} = require("../../../src/utils/game-constants");
const {setupTestServer, cleanup} = require("../../services/test-setup");

let gamesCollection;
let usersCollection;
let getToken;
let testUserId;

describe('POST /game/action/process', () => {
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

    it('Start new deck from bus - OK - Jr', async () => {
        const preferredRankInBus = "Jr";
        const user = await usersCollection.insertOne(userMock());
        const id = user.insertedId.toString();
        testUserId = id;
        const mockGame = activeGame({handNumber: 4, preferredRankInBus, user: basicUser({...user, userId: id})});
        await gamesCollection.insertOne(mockGame);
        const card = mockGame.playerList[1].bus.find((card) => card.rank === preferredRankInBus);
        const response = await request(app)
            .post(Routes.Game.ACTION_PROCESS)
            .set("Authorization", `Bearer ${getToken(testUserId)}`)
            .send({
                gameCode: mockGame.code,
                action: GameActions.START_NEW_PACK_FROM_BUS,
                card
            });

        expect(response.status).toBe(200);
        expect(response.body.newGame.playerList[1].bus).toHaveLength(mockGame.playerList[1].bus.length - 1);
        expect(response.body.newGame.gameBoard).toHaveLength(mockGame.gameBoard.length + 1);
        expect(response.body.newGame.gameBoard[response.body.newGame.gameBoard.length - 1]).toHaveLength(1);
        expect(response.body.newGame.gameBoard[response.body.newGame.gameBoard.length - 1][0].i).toBe(card.i);
        expect(response.body.newGame.gameBoard[response.body.newGame.gameBoard.length - 1][0].rank).toBe(card.rank);
        expect(response.body.newGame.gameBoard[response.body.newGame.gameBoard.length - 1][0].suit).toBe(card.suit);
    })
    it('Move card to board from bus - last card', async () => {
        const user = await usersCollection.insertOne(userMock());
        const id = user.insertedId.toString();
        const targetIndex = 0;
        const preferredRank = "A";
        testUserId = id;
        const mockGame = activeGame({preferredRankInBus: preferredRank, user: basicUser({...user, userId: id})});
        mockGame.playerList[1].bus = [{...mockGame.playerList[1].bus[0], rank: "A"}];
        await gamesCollection.insertOne(mockGame);
        const response = await request(app)
            .post(Routes.Game.ACTION_PROCESS)
            .set("Authorization", `Bearer ${getToken(id)}`)
            .send({
                gameCode: mockGame.code,
                targetIndex,
                action: GameActions.START_NEW_PACK_FROM_BUS,
                card: mockGame.playerList[1].bus[0]
            });

        expect(response.status).toBe(200);
        expect(response.body.newGame.state).toBe(States.FINISHED);

    })
    it('Move card to board from bus - last card Joker', async () => {
        const user = await usersCollection.insertOne(userMock());
        const id = user.insertedId.toString();
        const targetIndex = 0;
        const preferredRank = "Jr";
        testUserId = id;
        const mockGame = activeGame({preferredRankInBus: preferredRank, user: basicUser({...user, userId: id})});
        mockGame.playerList[1].bus = [{...mockGame.playerList[1].bus[0], rank: "Jr"}];
        await gamesCollection.insertOne(mockGame);
        const response = await request(app)
            .post(Routes.Game.ACTION_PROCESS)
            .set("Authorization", `Bearer ${getToken(id)}`)
            .send({
                gameCode: mockGame.code,
                targetIndex,
                action: GameActions.START_NEW_PACK_FROM_BUS,
                card: mockGame.playerList[1].bus[0]
            });

        expect(response.status).toBe(200);
        expect(response.body.newGame.state).toBe(States.FINISHED);


    })

});
