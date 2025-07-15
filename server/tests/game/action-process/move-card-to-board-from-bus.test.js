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
const {States} = require("../../../src/utils/game-constants");
const IO = require("../../helpers/io-mock");
const {setupTestServer, cleanup} = require("../../services/test-setup");

let gamesCollection;
let usersCollection;
let getToken;
let testUserId;

describe('POST /game/action/process - move card to board from bus', () => {
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


    it('Move card to board from bus', async () => {
        const user = await usersCollection.insertOne(userMock());
        const id = user.insertedId.toString();
        const targetIndex = 0;
        const preferredRank = "2";
        testUserId = id;
        const mockGame = activeGame({preferredRankInBus: preferredRank, user: basicUser({...user, userId: id})});
        await gamesCollection.insertOne(mockGame);
        const response = await request(app)
            .post(Routes.Game.ACTION_PROCESS)
            .set("Authorization", `Bearer ${await getToken(id)}`)
            .send({
                gameCode: mockGame.code,
                targetIndex,
                action: GameActions.MOVE_CARD_TO_BOARD_FROM_BUS,
                card:  mockGame.playerList[1].bus[ mockGame.playerList[1].bus.length - 1]
            });

        expect(response.status).toBe(200);
        expect(response.body.newGame.playerList[1].bus).toHaveLength(mockGame.playerList[1].bus.length - 1);
        expect(response.body.newGame.gameBoard[targetIndex]).toHaveLength(mockGame.gameBoard[targetIndex].length + 1);

    })
    it('Move card to board from bus - last card', async () => {
        const user = await usersCollection.insertOne(userMock());
        const id = user.insertedId.toString();
        const targetIndex = 0;
        const preferredRank = "2";
        testUserId = id;
        const mockGame = activeGame({preferredRankInBus: preferredRank, user: basicUser({...user, userId: id})});
        mockGame.playerList[1].bus = [{...mockGame.playerList[1].bus[0], rank: "2"}];
        await gamesCollection.insertOne(mockGame);
        const response = await request(app)
            .post(Routes.Game.ACTION_PROCESS)
            .set("Authorization", `Bearer ${await getToken(id)}`)
            .send({
                gameCode: mockGame.code,
                targetIndex,
                action: GameActions.MOVE_CARD_TO_BOARD_FROM_BUS,
                card:  mockGame.playerList[1].bus[0]
            });

        expect(response.status).toBe(200);
        expect(response.body.newGame.state).toBe(States.FINISHED);


    })

});