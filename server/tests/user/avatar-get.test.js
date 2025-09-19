const fs = require("fs");
const path = require("path");
require("../services/setup-db");
const GetAvatar = require("../../src/routes/user/avatar-get");
const Routes = require("../../../shared/constants/routes.json");
const {
  cleanupTestContext,
  apiRequest,
  createUser,
  apiRequestError,
} = require("../test-helpers");
const applyBeforeAll = require("../helpers/before-all-helper");

describe("POST /user/avatar/get", () => {
  let ctx = applyBeforeAll(GetAvatar);

  afterEach(async () => {
    const { usersCollection, gamesCollection } = ctx;
    await cleanupTestContext({ usersCollection, gamesCollection });
  });

  it("should return default avatar when user has no uploaded avatar", async () => {
    const user = await createUser(ctx.usersCollection);
    ctx.setTestUserId(user.id);
    const response = await apiRequest(
      ctx.app,
      "get",
      Routes.User.GET_AVATAR,
      ctx.getToken,
      user.id,
      { userId: user.id },
    );
    expect(response.headers["content-type"]).toMatch(/image\/(png)/);
    const defaultAvatar = await fs.promises.readFile(
      path.join(__dirname, "../../avatars/pig-face.png"),
    );
    expect(Buffer.compare(response.body, defaultAvatar)).toBe(0);
  });

  it("should return existing avatar when user has no uploaded avatar", async () => {
    const user = await createUser(ctx.usersCollection);
    ctx.setTestUserId(user.id);
    const avatarsDir = path.join(__dirname, "../../avatars");
    const avatarPath = path.join(avatarsDir, `${user.id}.png`);
    const sourceAvatarPath = path.join(avatarsDir, "pig-face.png");
    await fs.promises.copyFile(sourceAvatarPath, avatarPath);
    const response = await apiRequest(
      ctx.app,
      "get",
      Routes.User.GET_AVATAR,
      ctx.getToken,
      user.id,
      { userId: user.id },
    );
    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toMatch(/image\/png/);
    const servedAvatar = response.body;
    const expectedAvatar = await fs.promises.readFile(avatarPath);
    expect(Buffer.compare(servedAvatar, expectedAvatar)).toBe(0);
    await fs.promises.unlink(avatarPath);
  });

  it("should throw AvatarNotFound", async () => {
    const error = {
      name: "AvatarNotFound",
      message: "Default avatar not found for user",
      status: 404,
    };
    const mockedFs = jest.spyOn(fs.promises, "stat").mockImplementation(() => {
      const error = new Error("File not found");
      error.code = "ENOENT"; // code we care about
      throw error;
    });
    const user = await createUser(ctx.usersCollection);
    ctx.setTestUserId(user.id);
    await apiRequestError(
      ctx.app,
      "get",
      Routes.User.GET_AVATAR,
      ctx.getToken,
      user.id,
      { userId: user.id },
      error,
    );
    mockedFs.mockRestore();
  });

  it("should throw FailToDownloadAvatar", async () => {
    const error = {
      name: "FailToDownloadAvatar",
      message: "Failed to download avatar",
      status: 500,
    };
    jest.spyOn(fs.promises, "readdir").mockImplementation(() => {
      throw new Error("File not found - error with no code");
    });
    const user = await createUser(ctx.usersCollection);
    ctx.setTestUserId(user.id);
    await apiRequestError(
      ctx.app,
      "get",
      Routes.User.GET_AVATAR,
      ctx.getToken,
      user.id,
      { userId: user.id },
      error,
    );
  });
});
