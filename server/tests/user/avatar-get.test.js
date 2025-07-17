const fs = require("fs");
const path = require("path");
const request = require('supertest');
require("../services/setup-db");
const GetAvatar = require('../../src/routes/user/avatar-get');
const Routes = require("../../../shared/constants/routes.json");
const {userMock, initialGame} = require("../helpers/default-mocks");
const {setupTestServer, cleanup} = require("../services/test-setup");
const IO = require("../helpers/io-mock");
let usersCollection;
let gamesCollection;
let testUserId;
let getToken;
describe('POST /user/avatar/get', () => {
    let app;
    beforeAll(async () => {
        const setup = await setupTestServer(() => testUserId, (app) => {
            new GetAvatar(app, IO);
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

    it('should return default avatar when user has no uploaded avatar', async () => {
        const user = await usersCollection.insertOne(userMock());
        testUserId = user.insertedId.toString();

        const token = await getToken(testUserId);
        const response = await request(app)
            .get(Routes.User.GET_AVATAR)
            .set("Authorization", `Bearer ${token}`)
            .query({ userId: testUserId });

        expect(response.status).toBe(200);
        expect(response.headers["content-type"]).toMatch(/image\/(png)/);

        const defaultAvatar = await fs.promises.readFile(path.join(__dirname, "../../avatars/pig-face.png"));
        expect(Buffer.compare(response.body, defaultAvatar)).toBe(0);
    });
    it('should return existing avatar when user has no uploaded avatar', async () => {
        const user = await usersCollection.insertOne(userMock());
        testUserId = user.insertedId.toString();

        const avatarsDir = path.join(__dirname, "../../avatars");
        const avatarPath = path.join(avatarsDir, `${testUserId}.png`);
        const sourceAvatarPath = path.join(avatarsDir, "pig-face.png");

        await fs.promises.copyFile(sourceAvatarPath, avatarPath);

        const token = await getToken(testUserId);
        const response = await request(app)
            .get(Routes.User.GET_AVATAR)
            .set("Authorization", `Bearer ${token}`)
            .query({ userId: testUserId });

        expect(response.status).toBe(200);
        expect(response.headers["content-type"]).toMatch(/image\/png/);

        const servedAvatar = response.body;
        const expectedAvatar = await fs.promises.readFile(avatarPath);
        expect(Buffer.compare(servedAvatar, expectedAvatar)).toBe(0);

        await fs.promises.unlink(avatarPath);
    });
});