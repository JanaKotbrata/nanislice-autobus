const request = require("supertest");
const { setupTestServer } = require("./services/test-setup");
const { userMock } = require("./helpers/default-mocks");

async function apiRequestSuccess(
  app,
  method,
  route,
  getToken,
  userId,
  data,
  files = [],
) {
  const response = await apiRequest(
    app,
    method,
    route,
    getToken,
    userId,
    data,
    files,
  );
  expectApiSuccess(response);
  return response;
}

async function apiRequestError(
  app,
  method,
  route,
  getToken,
  userId,
  data,
  error,
  files = [],
) {
  const response = await apiRequest(
    app,
    method,
    route,
    getToken,
    userId,
    data,
    files,
  );
  expectApiError(response, error);
  return response;
}

function expectApiSuccess(response) {
  expect(response.status).toBe(200);
  expect(response.body.success).toBe(true);
}

function expectApiError(response, error) {
  expect(response.status).toBe(error.status);
  if (error.name !== undefined) expect(response.body.name).toBe(error.name);
  if (error.message !== undefined)
    expect(response.body.message).toBe(error.message);
}

async function setupTestContext(
  routeInit,
  notExistUser = false,
  notAuth = false,
) {
  let testUserId;
  const setup = await setupTestServer(
    () => testUserId,
    (app) => {
      if (routeInit) routeInit(app);
    },
    notExistUser,
    notAuth,
  );
  return {
    app: setup.app,
    gamesCollection: setup.gamesCollection,
    usersCollection: setup.usersCollection,
    getToken: setup.getToken,
    setTestUserId: (id) => {
      testUserId = id;
    },
    getTestUserId: () => testUserId,
  };
}

async function cleanupTestContext({ usersCollection, gamesCollection }) {
  if (usersCollection) await usersCollection.deleteMany({});
  if (gamesCollection) await gamesCollection.deleteMany({});
}

async function createUser(usersCollection, userData = {}) {
  const result = await usersCollection.insertOne(userMock(userData));
  let user = await usersCollection.findOne({ _id: result.insertedId });
  user.id = user._id.toString();
  return user;
}

async function apiRequest(
  app,
  method,
  route,
  getToken,
  userId,
  data,
  files = [],
) {
  const token = await getToken(userId);
  let req = request(app)[method](route).set("Authorization", `Bearer ${token}`);
  if (files.length > 0) {
    files.forEach((f) => (req = req.attach(f.field, f.path)));
    if (data) Object.entries(data).forEach(([k, v]) => (req = req.field(k, v)));
  } else {
    if (method === "get") req = req.query(data);
    else req = req.send(data);
  }
  return req;
}

module.exports = {
  setupTestContext,
  cleanupTestContext,
  createUser,
  apiRequest,
  apiRequestSuccess,
  apiRequestError,
};
