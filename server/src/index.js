const express = require('express');
const session = require('express-session');
const passport = require('passport');
const connectToDb = require('./models/connection-db');
const usersRepository = require('./models/users-repository');
const users = new usersRepository();

const ErrorHandler = require("./middlewares/error-handler");
const initGoogleAuth = require("./services/google-auth-service");
const initDiscordAuth = require("./services/discord-auth-service");
const config = require("../config/config.json");
const registerRoutes = require("./utils/register-routes");
const createIndexes = require("./utils/create-indexes");
const getPathFromRoot = require("./utils/get-path-from-root");



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

    // for parse JSON requests
    app.use(express.json());

    // Adding routers
    registerRoutes(getPathFromRoot("./routes"), app);


    app.use(ErrorHandler);

    // Připojení k DB a spuštění serveru
    connectToDb()
        .then(async () => {
            //for creating indexes in db
            await createIndexes(getPathFromRoot("./models"));
            //for server startup
            app.listen(config.port, () => console.log(`Server run: ${config.port}`))
        })
        .catch((err) => console.error(err));

}

main().catch(console.error);