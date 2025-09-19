require("../services/setup-db");
const fs = require("fs");
const path = require("path");
const UpdateUser = require("../../src/routes/user/update");
const Routes = require("../../../shared/constants/routes.json");
const { initialGame } = require("../helpers/default-mocks");
const {
  cleanupTestContext,
  createUser,
  apiRequestSuccess,
  apiRequestError,
} = require("../test-helpers");
const applyBeforeAll = require("../helpers/before-all-helper");
const UsersRepository = require("../../src/models/users-repository");

describe("POST /user/update", () => {
  let ctx = applyBeforeAll(UpdateUser);

  afterEach(async () => {
    const { usersCollection, gamesCollection } = ctx;
    await cleanupTestContext({ usersCollection, gamesCollection });
  });

  it("should update user", async () => {
    const user = await createUser(ctx.usersCollection);
    ctx.setTestUserId(user.id);
    const name = "testing";
    const response = await apiRequestSuccess(
      ctx.app,
      "post",
      Routes.User.UPDATE,
      ctx.getToken,
      user.id,
      { name },
    );

    expect(response.body.name).toBe(name);
  });
  it("failed to update user", async () => {
    const error = {
      status: 500,
      name: "UserUpdateFailed",
      message: "Failed to update user",
    };
    const mocked = jest
      .spyOn(UsersRepository.prototype, "update")
      .mockImplementation(() => {
        throw new Error();
      });
    const user = await createUser(ctx.usersCollection);
    ctx.setTestUserId(user.id);
    const name = "testing";
    await apiRequestError(
      ctx.app,
      "post",
      Routes.User.UPDATE,
      ctx.getToken,
      user.id,
      { name },
      error,
    );
    mocked.mockRestore();
  });

  it("should update user - existing game", async () => {
    const user = await createUser(ctx.usersCollection);
    ctx.setTestUserId(user.id);
    const initialGameData = initialGame({ user: { userId: user.id } });
    await ctx.gamesCollection.insertOne(initialGameData);
    const name = "testing";
    const response = await apiRequestSuccess(
      ctx.app,
      "post",
      Routes.User.UPDATE,
      ctx.getToken,
      user.id,
      { name },
    );

    expect(response.body.name).toBe(name);
  });
  it("should update language - null", async () => {
    const user = await createUser(ctx.usersCollection);
    ctx.setTestUserId(user.id);
    const response = await apiRequestSuccess(
      ctx.app,
      "post",
      Routes.User.UPDATE,
      ctx.getToken,
      user.id,
      { language: "null" },
    );

    expect(response.body.language).toBe(null);
  });
  it("should update language", async () => {
    const user = await createUser(ctx.usersCollection);
    ctx.setTestUserId(user.id);
    const response = await apiRequestSuccess(
      ctx.app,
      "post",
      Routes.User.UPDATE,
      ctx.getToken,
      user.id,
      { language: "cs" },
    );

    expect(response.body.language).toBe("cs");
  });
  it("should update volume", async () => {
    const user = await createUser(ctx.usersCollection);
    ctx.setTestUserId(user.id);
    const response = await apiRequestSuccess(
      ctx.app,
      "post",
      Routes.User.UPDATE,
      ctx.getToken,
      user.id,
      { volume: 30 },
    );

    expect(response.body.volume).toBe(30);
  });
  it("should update user - with picture", async () => {
    const user = await createUser(ctx.usersCollection);
    ctx.setTestUserId(user.id);
    const imagePath = path.join(__dirname, "../avatars/pig-face.png");
    const response = await apiRequestSuccess(
      ctx.app,
      "post",
      Routes.User.UPDATE,
      ctx.getToken,
      user.id,
      { name: "karel" },
      [{ field: "picture", path: imagePath }],
    );

    expect(response.body.name).toBe("karel");
    const avatarPath = path.join(__dirname, `../../avatars/${user.id}.png`);
    await fs.promises.unlink(avatarPath);
  });
  it("should update volume", async () => {
    const error = {
      status: 403,
      name: "UserNotAuthorized",
      message: "User is not authorized to perform this action",
    };
    const user = await createUser(ctx.usersCollection, { role: "nonexist" });
    ctx.setTestUserId(user.id);
    await apiRequestError(
      ctx.app,
      "post",
      Routes.User.UPDATE,
      ctx.getToken,
      user.id,
      { volume: 30 },
      error,
    );
  });
});
