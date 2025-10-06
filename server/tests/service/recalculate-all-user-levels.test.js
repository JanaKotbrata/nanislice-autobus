require("../services/setup-db");

const RecalculateAllUserLevels = require("../../src/routes/service/recalculate-all-user-levels");
const Routes = require("../../../shared/constants/routes.json");
const { Roles } = require("../../../shared/constants/game-constants.json");
const {
  cleanupTestContext,
  createUser,
  getUserById,
  apiRequestSuccess,
} = require("../test-helpers");
const applyBeforeAll = require("../helpers/before-all-helper");

describe("POST /user/recalculate-level", () => {
  let ctx = applyBeforeAll(RecalculateAllUserLevels);
  afterEach(async () => {
    const { usersCollection } = ctx;
    await cleanupTestContext({ usersCollection });
  });

  it("should recalculate all user levels based on XP", async () => {
    const count = 5;
    let userList = [];
    const admin = await createUser(
      ctx.usersCollection,
      { role: Roles.ADMIN },
      { level: 0, xp: 0 },
    );
    for (let i = 0; i < count; i++) {
      const user = await createUser(
        ctx.usersCollection,
        {},
        {
          xp: (i + 1) * 1000,
          level: 0,
        },
      );
      userList.push(user);
    }
    ctx.setTestUserId(admin.id);

    const response = await apiRequestSuccess(
      ctx.app,
      "post",
      Routes.User.RECALCULATE_LEVEL,
      ctx.getToken,
      admin.id,
      {},
    );

    expect(response.body.success).toBe(true);
    expect(response.body.updatedCount).toBeGreaterThan(0);

    for (const user of userList) {
      const dbUser = await getUserById(ctx.usersCollection, user.id);
      expect(dbUser.level).toBeGreaterThan(0);
      expect(dbUser.level).toBeDefined();
    }
  });
});
