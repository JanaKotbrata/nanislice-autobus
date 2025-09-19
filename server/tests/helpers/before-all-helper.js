const { setupTestContext } = require("../test-helpers");
const WebsocketService = require("../../src/services/websocket-service");
const IO = require("./io-mock");

function applyBeforeAll(endpoint, notExistUser = false, notAuth = false) {
  const context = {};
  beforeAll(async () => {
    const ctx = await setupTestContext(
      (app) => {
        new endpoint(app, new WebsocketService(IO));
      },
      notExistUser,
      notAuth,
    );
    context.app = ctx.app;
    context.gamesCollection = ctx.gamesCollection;
    context.usersCollection = ctx.usersCollection;
    context.getToken = ctx.getToken;
    context.setTestUserId = ctx.setTestUserId;
    context.getTestUserId = ctx.getTestUserId;
  });

  return context;
}

module.exports = applyBeforeAll;
