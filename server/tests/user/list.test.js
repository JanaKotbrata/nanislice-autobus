require("../services/setup-db");

const ListUser = require("../../src/routes/user/list");
const Routes = require("../../../shared/constants/routes.json");
const { Roles } = require("../../../shared/constants/game-constants.json");
const {
  cleanupTestContext,
  createUser,
  apiRequestSuccess,
} = require("../test-helpers");
const applyBeforeAll = require("../helpers/before-all-helper");

describe("GET /user/list", () => {
  let ctx = applyBeforeAll(ListUser);
  afterEach(async () => {
    const { usersCollection } = ctx;
    await cleanupTestContext({ usersCollection });
  });

  it("should list all user", async () => {
    const count = 10;
    let user;
    for (let i = 0; i < count; i++) {
      user = await createUser(ctx.usersCollection);
    }
    ctx.setTestUserId(user.id);
    const response = await apiRequestSuccess(
      ctx.app,
      "get",
      Routes.User.LIST,
      ctx.getToken,
      user.id,
      {},
    );

    expect(response.body.list).toHaveLength(count);
    expect(response.body.pageInfo).toBeDefined();
    expect(response.body.pageInfo.totalCount).toBe(count);
  });

  it("should list 2. page", async () => {
    const count = 10;
    const pageSize = 5;
    let user;
    let userList = [];
    for (let i = 0; i < count; i++) {
      user = await createUser(ctx.usersCollection);
      userList.push(user);
    }
    ctx.setTestUserId(user.id);
    const response = await apiRequestSuccess(
      ctx.app,
      "get",
      Routes.User.LIST,
      ctx.getToken,
      user.id,
      { pageInfo: { pageSize, pageIndex: 1 } },
    );

    expect(response.body.list).toHaveLength(pageSize);
    expect(response.body.list[0].id).toBe(userList[5].id);
    expect(response.body.pageInfo).toBeDefined();
    expect(response.body.pageInfo.totalCount).toBe(count);
  });

  it("should list user by role", async () => {
    const count = 10;
    let user;
    for (let i = 0; i < count; i++) {
      user = await createUser(ctx.usersCollection);
    }
    ctx.setTestUserId(user.id);
    const response = await apiRequestSuccess(
      ctx.app,
      "get",
      Routes.User.LIST,
      ctx.getToken,
      user.id,
      { role: Roles.PLEB },
    );

    expect(response.body.list).toHaveLength(count);
    expect(response.body.pageInfo).toBeDefined();
    expect(response.body.pageInfo.totalCount).toBe(count);
  });
});
