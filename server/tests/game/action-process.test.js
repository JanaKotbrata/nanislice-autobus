const request = require('supertest');
require("../services/setup-db");
const ProcessAction = require('../../src/routes/game/action-process');
const Routes = require("../../../shared/constants/routes.json");
const GameActions = require("../../../shared/constants/game-actions.json");
const {
    userMock,
    generateRandomCode,
    initialGame,
    activeGame,
    basicUser,
    generateRandomId
} = require("../helpers/default-mocks");
const {generateGameCode} = require("../../src/utils/helpers");
const {RANK_CARD_ORDER} = require("../../src/utils/game-constants");
const IO = require("../helpers/io-mock");
const {setupTestServer, cleanup} = require("../services/test-setup");
const CreateGame = require("../../src/routes/game/create");

let gamesCollection;
let usersCollection;
let testUserId;
let getToken;

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
    });

    afterEach(async () => {
        await cleanup();
    });

    it('should return an error if game does not exist', async () => {
        const user = await usersCollection.insertOne(userMock());
        testUserId = user.insertedId.toString();
        const response = await request(app)
            .post(Routes.Game.ACTION_PROCESS)
            .set("Authorization", `Bearer ${await getToken(testUserId)}`)
            .send({gameCode: generateRandomCode(), action: GameActions.DRAW_CARD});

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("Requested game does not exist");
    });

    it('Current user is not in game', async () => {
        const user = await usersCollection.insertOne(userMock());
        testUserId = user.insertedId.toString();
        const mockGame = activeGame();
        await gamesCollection.insertOne(mockGame);


        const response = await request(app)
            .post(Routes.Game.ACTION_PROCESS)
            .set("Authorization", `Bearer ${await getToken(testUserId)}`)
            .send({gameCode: mockGame.code, action: GameActions.DRAW_CARD});

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("User is not in game");

    });
    it('game is not active', async () => {
        const user = await usersCollection.insertOne(userMock());
        testUserId = user.insertedId.toString();
        const mockGame = initialGame({user: basicUser({...user, userId: testUserId})});
        await gamesCollection.insertOne(mockGame);


        const response = await request(app)
            .post(Routes.Game.ACTION_PROCESS)
            .set("Authorization", `Bearer ${await getToken(testUserId)}`)
            .send({gameCode: mockGame.code, action: GameActions.DRAW_CARD});

        expect(response.status).toBe(400);
        expect(response.body.name).toBe("GameIsNotActive");

    });

    it('Update deck - from completedList', async () => {
        const user = await usersCollection.insertOne(userMock());
        const id = user.insertedId.toString();
        testUserId = id;
        const mockGame = activeGame({user: basicUser({...user, userId: id})});
        mockGame.completedCardList = mockGame.deck.splice(0, mockGame.deck.length - 5);
        await gamesCollection.insertOne(mockGame);
        const oldHand = mockGame.playerList[1].hand;
        const response = await request(app)
            .post(Routes.Game.ACTION_PROCESS)
            .set("Authorization", `Bearer ${await getToken(testUserId)}`)
            .send({gameCode: mockGame.code, action: GameActions.REORDER_HAND, hand: oldHand});

        expect(response.status).toBe(200);
        expect(mockGame.deck.length).toBeLessThan(response.body.newGame.deck.length);
    });

    it('Update deck - without card in completedList', async () => {
        const user = await usersCollection.insertOne(userMock());
        const id = user.insertedId.toString();
        testUserId = id;
        const mockGame = activeGame({user: basicUser({...user, userId: id})});
        mockGame.gameBoard = splitCardsIntoGroups(mockGame.deck.splice(0, mockGame.deck.length - 5));
        mockGame.completedCardList = [];
        await gamesCollection.insertOne(mockGame);
        const oldHand = mockGame.playerList[1].hand;
        const response = await request(app)
            .post(Routes.Game.ACTION_PROCESS)
            .set("Authorization", `Bearer ${await getToken(testUserId)}`)
            .send({gameCode: mockGame.code, action: GameActions.REORDER_HAND, hand: oldHand});

        expect(response.status).toBe(200);
        expect(mockGame.deck.length).toBeLessThan(response.body.newGame.deck.length);
        expect(response.body.newGame.gameBoard[0][response.body.newGame.gameBoard[0].length -1].i).toBe(mockGame.gameBoard[0][mockGame.gameBoard[0].length-1].i);
        expect(response.body.newGame.gameBoard[0][0]).toBe(null);
    });
    it('Dont need to have drawed cards ', async () => {
        const user = await usersCollection.insertOne(userMock());
        const id = user.insertedId.toString();
        testUserId = id;
        const mockGame = activeGame({user: basicUser({...user, userId: id,}, {isCardDrawed: false})});
        await gamesCollection.insertOne(mockGame);
        const oldHand = mockGame.playerList[1].hand;
        const response = await request(app)
            .post(Routes.Game.ACTION_PROCESS)
            .set("Authorization", `Bearer ${await getToken(testUserId)}`)
            .send({gameCode: mockGame.code, action: GameActions.REORDER_HAND, hand: oldHand});

        expect(response.status).toBe(200);

    });
    it('invalid action', async () => {
        const user = await usersCollection.insertOne(userMock());
        const id = user.insertedId.toString();
        testUserId = id;
        const mockGame = activeGame({user: basicUser({...user, userId: id})});
        await gamesCollection.insertOne(mockGame);
        const oldHand = mockGame.playerList[1].hand;
        const response = await request(app)
            .post(Routes.Game.ACTION_PROCESS)
            .set("Authorization", `Bearer ${await getToken(testUserId)}`)
            .send({gameCode: mockGame.code, action: "invalid", hand: oldHand});

        expect(response.status).toBe(400);
        expect(response.body.name).toBe("ActionIsNotDefined");

    });
    it('PlayerMustDrawCardFirst ', async () => {
        const user = await usersCollection.insertOne(userMock());
        const id = user.insertedId.toString();
        testUserId = id;
        const mockGame = activeGame({user: basicUser({...user, userId: id,}, {isCardDrawed: false})});
        await gamesCollection.insertOne(mockGame);
        const oldHand = mockGame.playerList[1].hand;
        const response = await request(app)
            .post(Routes.Game.ACTION_PROCESS)
            .set("Authorization", `Bearer ${await getToken(testUserId)}`)
            .send({gameCode: mockGame.code, action: GameActions.MOVE_CARD_TO_BOARD, targetIndex: 0, card: oldHand[0]});

        expect(response.status).toBe(400);
        expect(response.body.name).toBe("PlayerMustDrawCardFirst");

    });

});
describe('POST /game/action/process – user does not exist', () => {
    let app;

    beforeAll(async () => {
        testUserId = generateRandomId();
        const setup = await setupTestServer(() => testUserId, (app) => {
            new ProcessAction(app, IO);
        }, true);
        app = setup.app;
        gamesCollection = setup.gamesCollection;
        usersCollection = setup.usersCollection;
        getToken = setup.getToken;
    });
    it('User does not exist ', async () => {
        const response = await request(app)
            .post(Routes.Game.ACTION_PROCESS)
            .set("Authorization", `Bearer ${await getToken(testUserId)}`)
            .send({gameCode: generateGameCode(), action: GameActions.DRAW_CARD});

        expect(response.status).toBe(404);
        expect(response.body.name).toBe("UserDoesNotExist");

    });

});

function splitCardsIntoGroups(cards) {
    const rankOrder = RANK_CARD_ORDER;

    const sorted = [...cards].sort((a, b) => {
        return rankOrder.indexOf(a.rank) - rankOrder.indexOf(b.rank);
    });

    const result = [];
    for (let i = 0; i < sorted.length; i += 11) {
        result.push(sorted.slice(i, i + 11));
    }

    return result;
}