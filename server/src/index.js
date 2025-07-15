const express = require('express');
const session = require('express-session');
const passport = require('passport');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectToDb = require('./models/connection-db');
const ErrorHandler = require("./middlewares/error-handler");
const initGoogleAuth = require("./services/google-auth-service");
const initDiscordAuth = require("./services/discord-auth-service");
const initSeznamAuth = require("./services/seznam-auth-service");
const config = require("../config/config.json");
const registerRoutes = require("./utils/register-routes");
const createIndexes = require("./utils/create-indexes");
const getPathFromRoot = require("./utils/get-path-from-root");
const Config = require("../../shared/config/config.json")
const {initJwtStrategy} = require("./services/jwt-auth");

async function main() {
// Init express
    const app = express();
    const server = http.createServer(app);
    const io = new Server(server, {
        cors: {
            origin: Config.CLIENT_URI,
            credentials: true
        }
    });

    app.use(cors({
        origin: Config.CLIENT_URI,
        credentials: true
    }));


    app.use(passport.initialize());
    await initJwtStrategy(passport);



    //Init AUTH
    await initGoogleAuth(passport, app);
    await initDiscordAuth(passport, app);
    await initSeznamAuth(passport, app);

    // for parse JSON requests
    app.use(express.json());

    // Socket.io event handling
    io.on('connection', (socket) => {
        console.log('Uživatel připojen:', socket.id);

        socket.on("listenToGame", (gameCode, userId) => {
            socket.join(`${gameCode}_${userId}`);
            console.log(`Socket ${socket.id} joined lobby: ${gameCode}_${userId}`);
        });

        socket.on("disconnect", () => {
            console.log("Uživatel odpojen:", socket.id);
        });

        socket.on("player-attempted-leave", ({ userId, gameCode, playerName, playerIdList }) => {
            console.log("Někdo se pokouší odejít:", playerName, playerIdList);
            playerIdList.forEach((uid) => {
                if (uid !== userId) { // nepošleme alert sobě
                    socket.to(`${gameCode}_${uid}`).emit("notify-player-leaving", {
                        playerName,
                    });
                }
            });
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