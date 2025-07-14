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

describe('POST /game/action/process - move card to board from busstop', () => {
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


    it('Move card to board from  busStop', async () => {
        const user = await usersCollection.insertOne(userMock());
        const id = user.insertedId.toString();
        const targetIndex = 0;
        const preferredRank = "2";
        testUserId = id;
        const mockGame = activeGame({user: basicUser({...user, userId: id})});
        const preferredCard = mockGame.deck.find((card => card.rank === preferredRank));
        const preferredCardIndex = mockGame.deck.indexOf((c => c.i === preferredCard.i));
        mockGame.deck.splice(preferredCardIndex, 1);
        mockGame.playerList[1].busStop[targetIndex].push(preferredCard);
        await gamesCollection.insertOne(mockGame);
        const response = await request(app)
            .post(Routes.Game.ACTION_PROCESS)
            .set("Authorization", `Bearer ${getToken(id)}`)
            .send({
                gameCode: mockGame.code,
                targetIndex,
                action: GameActions.MOVE_CARD_TO_BOARD_FROM_BUS_STOP,
                card:  mockGame.playerList[1].busStop[targetIndex][0]
            });

        expect(response.status).toBe(200);
        expect(response.body.newGame.playerList[1].busStop[targetIndex]).toHaveLength(mockGame.playerList[1].busStop[targetIndex].length - 1);
        expect(response.body.newGame.gameBoard[targetIndex]).toHaveLength(mockGame.gameBoard[targetIndex].length + 1);

    })

});