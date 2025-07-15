const request = require('supertest');
require("../../services/setup-db");
const ProcessAction = require('../../../src/routes/game/action-process');
const Routes = require("../../../../shared/constants/routes.json");
const GameActions = require("../../../../shared/constants/game-actions.json");
const IO = require("../../helpers/io-mock");

const {
    userMock,
    activeGame,
    basicUser,
} = require("../../helpers/default-mocks");
const {setupTestServer, cleanup} = require("../../services/test-setup");

let gamesCollection;
let usersCollection;
let testUserId;
let getToken;
describe('POST /game/action/process - drawcard', () => {
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

    it('Draw card', async () => {
        const user = await usersCollection.insertOne(userMock());
        const id = user.insertedId.toString();
        testUserId = id;
        const mockGame = activeGame({handNumber: 4, user: basicUser({...user, userId: id},{isCardDrawed: false})});
        const game = await gamesCollection.insertOne(mockGame);
        const response = await request(app)
            .post(Routes.Game.ACTION_PROCESS)
            .set("Authorization", `Bearer ${await getToken(id)}`)
            .send({gameId: game.insertedId.toString(), action: GameActions.DRAW_CARD});

        expect(response.status).toBe(200);
        expect(response.body.newGame.deck).toHaveLength(mockGame.deck.length - 1);
    });
    it('Draw card - NotPossibleToDraw', async () => {
        const user = await usersCollection.insertOne(userMock());
        const id = user.insertedId.toString();
        testUserId = id;
        const mockGame = activeGame({handNumber: 4, user: basicUser({...user, userId: id},{isCardDrawed: true})});
        const game = await gamesCollection.insertOne(mockGame);
        const response = await request(app)
            .post(Routes.Game.ACTION_PROCESS)
            .set("Authorization", `Bearer ${await getToken(id)}`)
            .send({gameId: game.insertedId.toString(), action: GameActions.DRAW_CARD});

        expect(response.status).toBe(400);
        expect(response.body.name).toBe("NotPossibleToDraw");
    });
    it('Draw card - full hand', async () => {
        const user = await usersCollection.insertOne(userMock());
        const id = user.insertedId.toString();
        testUserId = id;
        const mockGame = activeGame({user: basicUser({...user, userId: id})});
        await gamesCollection.insertOne(mockGame);
        const response = await request(app)
            .post(Routes.Game.ACTION_PROCESS)
            .set("Authorization", `Bearer ${await getToken(id)}`)
            .send({gameCode: mockGame.code, action: GameActions.DRAW_CARD});

        expect(response.status).toBe(400);
        expect(response.body.name).toBe("InvalidHandLength");
    });
    it('Draw card - user is not currentPlayer', async () => {
        const user = await usersCollection.insertOne(userMock());
        const id = user.insertedId.toString();
        testUserId = id;
        const mockGame = activeGame({currentPlayer: 0, handNumber: 4, user: basicUser({...user, userId: id})});
        await gamesCollection.insertOne(mockGame);
        const response = await request(app)
            .post(Routes.Game.ACTION_PROCESS)
            .set("Authorization", `Bearer ${await getToken(id)}`)
            .send({gameCode: mockGame.code, action: GameActions.DRAW_CARD});

        expect(response.status).toBe(400);
        expect(response.body.name).toBe("UserIsNotCurrentPlayer");
    });

});