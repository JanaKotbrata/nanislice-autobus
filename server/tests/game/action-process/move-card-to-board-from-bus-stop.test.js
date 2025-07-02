const request = require('supertest');
const express = require('express');
require("../../services/setup-db");
const connectionDb = require("../../../src/models/connection-db");
const ProcessAction = require('../../../src/routes/game/action-process');
const Routes = require("../../../../shared/constants/routes.json");
const TestUserMiddleware = require("../../services/test-user-middleware");
const ErrorHandler = require("../../../src/middlewares/error-handler");
const GameActions = require("../../../../shared/constants/game-actions.json");
const {
    userMock,
    activeGame,
    basicUser,
} = require("../../helpers/default-mocks");
const IO = require("../../helpers/io-mock");

let gamesCollection;
let usersCollection;

let testUserId;

describe('POST /game/action/process', () => {
    let app;

    beforeAll(async () => {
        const db = await connectionDb();
        gamesCollection = db.collection('games');
        usersCollection = db.collection('users');

        app = express();
        app.use(express.json());
        app.use(TestUserMiddleware(() => testUserId));
        new ProcessAction(app, IO);
        app.use(ErrorHandler);
    });

    afterAll(async () => {
        jest.clearAllMocks();
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