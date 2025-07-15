const express = require('express');
const jwt = require('jsonwebtoken');
const jwtAuth = require("../../src/services/jwt-auth");
const passport = require('passport');
const connectionDb = require("../../src/models/connection-db");
const { secret: JWT_SECRET } = require("../../config/config.json");
const ErrorHandler = require("../../src/middlewares/error-handler");

function injectUserEvenIfNotExists(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.sendStatus(401);

    try {
        const payload = jwt.verify(token, JWT_SECRET);
        req.user = { _id: payload.id };
        next();
    } catch (e) {
        return res.sendStatus(401);
    }
}

async function setupTestServer(testUserIdCallback, registerRoutes, notExistUser = false) {
    const db = await connectionDb();
    const gamesCollection = db.collection('games');
    const usersCollection = db.collection('users');
    const tokenHashCollection = db.collection('tokenHash');

    const getToken = async () => {
        const hash = "AAAaaa";
        const userId = testUserIdCallback();
        await tokenHashCollection.insertOne({userId, hash});
        return jwt.sign({ id: userId, loginHash: hash }, JWT_SECRET, { expiresIn: '24h' })
    }


    const app = express();
    app.use(express.json());

    if (notExistUser) {
        // mock out authentication to inject a user that does not exist
        jest.spyOn(passport, "authenticate").mockImplementation(() => (req, res, next) => {
            req.user = { id: testUserIdCallback() };
            next();
        })
        app.use(injectUserEvenIfNotExists);
    } else {
        app.use(passport.initialize());
        jwtAuth.initJwtStrategy(passport);
    }

    if (typeof registerRoutes === 'function') {
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

async function cleanup() {
    jest.clearAllMocks();
}

module.exports = {
    setupTestServer,
    cleanup,
};
