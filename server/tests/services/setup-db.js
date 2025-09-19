// musi se nacist pred jakymkoli jinym souborem z projektu, aby ostatni soubory z projektu pracovali uz jen s mockem
const { MongoClient } = require("mongodb");
const { MongoMemoryServer } = require("mongodb-memory-server");
let mockDbPromiseResolve;
let mockDbPromise;
jest.mock("../../src/models/connection-db", () => {
  if (mockDbPromise) return () => mockDbPromise;
  mockDbPromise = new Promise((res) => {
    mockDbPromiseResolve = res;
  });

  return {
    connectToDb: () => mockDbPromise,
  };
});

let mongoServer;
let client;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  client = new MongoClient(mongoUri);
  await client.connect();
  mockDbPromiseResolve(client.db());
});

afterAll(async () => {
  await client.close();
  await mongoServer.stop();
});
