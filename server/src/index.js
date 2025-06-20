const express = require('express');
const session = require('express-session');
const passport = require('passport');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
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

const AddGamePlayer = require("./routes/game/player-add");

async function main() {
// Init express
    const app = express();
    const server = http.createServer(app);
    const io = new Server(server, {
        cors: {
            origin: 'http://localhost:5173',
            credentials: true
        }
    });

    app.use(cors({
        origin: 'http://localhost:5173',
        credentials: true
    }));

    app.use(
        session({
            secret: config.secret,
            resave: false,
            saveUninitialized: true,
            cookie: {
                sameSite: 'lax',
                secure: process.env.NODE_ENV === 'production'
            }
        })
    );
    app.use(passport.initialize());
    app.use(passport.session());

    passport.serializeUser((user, done) => done(null, user.id));
    passport.deserializeUser(async (id, done) => {
        const user =
            await users.getUserById(id);
        done(null, user);
    });

    //Init AUTH
    await initGoogleAuth(passport, app);
    await initDiscordAuth(passport, app);

    // for parse JSON requests
    app.use(express.json());

    // Socket.io event handling
    io.on('connection', (socket) => {
        console.log('Uživatel připojen:', socket.id);

        socket.on("joinLobby", (gameCode, userId) => {
            socket.join(`${gameCode}_${userId}`);
            console.log(`Socket ${socket.id} joined lobby: ${gameCode}_${userId}`);
        });
        socket.on("startGame", (gameCode, userId) => {
            io.to(`${gameCode}_${userId}`).emit("gameStarted", { gameCode });
        });

        socket.on("disconnect", () => {
            console.log("Uživatel odpojen:", socket.id);
        });
    });

    // Adding routers
    registerRoutes(getPathFromRoot("./routes"), app, io);


    app.use(ErrorHandler);

    // Připojení k DB a spuštění serveru
    connectToDb()
        .then(async () => {
            //for creating indexes in db
            await createIndexes(getPathFromRoot("./models"));
            // for server startup
            server.listen(config.port, () => console.log(`Server run: ${config.port}`));
        })
        .catch((err) => console.error(err));

}

main().catch(console.error);