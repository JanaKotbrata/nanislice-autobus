const express = require('express');
const session = require('express-session');
const passport = require('passport');
const connectToDb = require('./models/connection-db');
const users = require('./models/users-repository');
const initGoogleAuth = require("./services/google-auth-service");
const initDiscordAuth = require("./services/discord-auth-service");
const config = require("../config/config.json");


// Nastavení Passport.js
async function main() {
// Init express
    const app = express();

    app.use(
        session({
            secret: config.secret,
            resave: false,
            saveUninitialized: true,
        })
    );
    app.use(passport.initialize());
    app.use(passport.session());

    passport.serializeUser((user, done) => done(null, user._id));
    passport.deserializeUser(async (id, done) => {
        const user = await users.getUserById(id);
        done(null, user);
    });

    //Init AUTH
    await initGoogleAuth(passport, app);
    await initDiscordAuth(passport, app);

    //Prepare DB
    connectToDb()
        .then(async () => {
            //for creating indexes in db
            await users.createIndexes();
            //for server startup
            app.listen(config.port, () => console.log(`Server run: ${config.port}`))
        })
        .catch((err) => console.error(err));

}

main().catch(console.error);