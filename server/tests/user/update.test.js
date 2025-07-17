const fs = require("fs");
const path = require("path");
const request = require('supertest');
require("../services/setup-db");
const UpdateUser = require('../../src/routes/user/update');
const Routes = require("../../../shared/constants/routes.json");
const {userMock, initialGame} = require("../helpers/default-mocks");
const {setupTestServer, cleanup} = require("../services/test-setup");
const IO = require("../helpers/io-mock");
let usersCollection;
let gamesCollection;
let testUserId;
let getToken;
describe('POST /user/update', () => {
    let app;
    beforeAll(async () => {
        const setup = await setupTestServer(() => testUserId, (app) => {
            new UpdateUser(app, IO);
        });
        app = setup.app;
        gamesCollection = setup.gamesCollection;
        usersCollection = setup.usersCollection;
        getToken = setup.getToken;
    });

    afterEach(async () => {
        await cleanup();
        await usersCollection.deleteMany({});
    });

    it('should update user', async () => {
        const user = await usersCollection.insertOne(userMock());
        testUserId = user.insertedId.toString();

        const name = "testing"

        const response = await request(app)
            .post(Routes.User.UPDATE)
            .set("Authorization", `Bearer ${await getToken(testUserId)}`)
            .send({name});

        expect(response.status).toBe(200);
        expect(response.body.name).toBe(name);
    });
    it('should update user - existing game', async () => {
        const user = await usersCollection.insertOne(userMock());
        testUserId = user.insertedId.toString();
        const initialGameData = initialGame({user: {...user, userId: testUserId}});
        const game = await gamesCollection.insertOne(initialGameData);
        const name = "testing"

        const response = await request(app)
            .post(Routes.User.UPDATE)
            .set("Authorization", `Bearer ${await getToken(testUserId)}`)
            .send({name});

        expect(response.status).toBe(200);
        expect(response.body.name).toBe(name);
    });
    it('should update user - with picture', async () => {
        const mock = userMock();
        const user = await usersCollection.insertOne(mock);
        testUserId = user.insertedId.toString();

        const imagePath = path.join(__dirname, "../avatars/pig-face.png");
        const token = await getToken(testUserId);

        const response = await request(app)
            .post(Routes.User.UPDATE)
            .set("Authorization", `Bearer ${token}`)
            .attach("picture", imagePath)
            .field("name", "karel");

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.name).toBe("karel");
        const avatarPath = path.join(__dirname, `../../avatars/${testUserId}.png`);
        await fs.promises.unlink(avatarPath);
    });
});