const express = require("express");
const jwt = require("jsonwebtoken");
const jwtAuth = require("../../src/services/auth/jwt-auth");
const passport = require("passport");
const { connectToDb } = require("../../src/models/connection-db");
const { secret: JWT_SECRET } = require("../../config/config.json");
const ErrorHandler = require("../../src/middlewares/error-handler");

function injectUserEvenIfNotExists(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.sendStatus(401);

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { _id: payload.id };
    next();
  } catch (e) {
    console.log(e);
    return res.sendStatus(401);
  }
}

async function setupTestServer(
  testUserIdCallback,
  registerRoutes,
  notExistUser = false,
  notAuth = false,
) {
  const db = await connectToDb();
  const gamesCollection = db.collection("games");
  const usersCollection = db.collection("users");
  const tokenHashCollection = db.collection("tokenHash");

  const getToken = async (testUserId) => {
    const hash = "AAAaaa";
    const userId = testUserId || testUserIdCallback();
    await tokenHashCollection.insertOne({ userId, hash });
    return jwt.sign({ id: userId, loginHash: hash }, JWT_SECRET, {
      expiresIn: "24h",
    });
  };

  const app = express();
  app.use(express.json());

  if (notExistUser) {
    // mock out authentication to inject a user that does not exist
    jest
      .spyOn(passport, "authenticate")
      .mockImplementation(() => (req, res, next) => {
        req.user = { id: testUserIdCallback() };
        req.isAuthenticated = () => true;
        next();
      });
    app.use(injectUserEvenIfNotExists);
  } else if (notAuth) {
    jest
      .spyOn(passport, "authenticate")
      .mockImplementation(() => (req, res, next) => {
        req.user = { id: testUserIdCallback() };
        req.isAuthenticated = () => false;
        next();
      });
    app.use(injectUserEvenIfNotExists);
  } else {
    app.use(passport.initialize());
    jwtAuth.initJwtStrategy(passport);
  }

  if (typeof registerRoutes === "function") {
    registerRoutes(app);
  }

  app.use(ErrorHandler);

  return {
    app,
    gamesCollection,
    usersCollection,
    getToken,
  };
}

module.exports = {
  setupTestServer,
};
