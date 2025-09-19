require("../services/setup-db");
const ListGame = require("../../src/routes/game/list");
const Routes = require("../../../shared/constants/routes.json");
const {
  Roles,
  States,
} = require("../../../shared/constants/game-constants.json");
const { activeGame } = require("../helpers/default-mocks");
const {
  cleanupTestContext,
  createUser,
  apiRequestSuccess,
} = require("../test-helpers");
const applyBeforeAll = require("../helpers/before-all-helper");

describe("GET /game/list", () => {
  let ctx = applyBeforeAll(ListGame);

  afterEach(async () => {
    const { usersCollection, gamesCollection } = ctx;
    await cleanupTestContext({ usersCollection, gamesCollection });
  });

  it("should list all game", async () => {
    const user = await createUser(ctx.usersCollection, { role: Roles.ADMIN });
    ctx.setTestUserId(user.id);
    const count = 10;
    for (let i = 0; i < count; i++) {
      const mockGame = activeGame();
      await ctx.gamesCollection.insertOne(mockGame);
    }
    const response = await apiRequestSuccess(
      ctx.app,
      "get",
      Routes.Game.LIST,
      ctx.getToken,
      user.id,
      {},
    );

    expect(response.body.list).toHaveLength(count);
    expect(response.body.pageInfo).toBeDefined();
    expect(response.body.pageInfo.totalCount).toBe(count);
  });

  test("should return empty list", async () => {
    const user = await createUser(ctx.usersCollection, { role: Roles.ADMIN });
    ctx.setTestUserId(user.id);
    const response = await apiRequestSuccess(
      ctx.app,
      "get",
      Routes.Game.LIST,
      ctx.getToken,
      user.id,
      { state: States.ACTIVE },
    );

    expect(response.body.list.length).toBe(0);
    expect(response.body.pageInfo).toBeDefined();
    expect(response.body.pageInfo.totalCount).toBe(0);
  });
});
