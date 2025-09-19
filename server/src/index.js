const express = require("express");
const passport = require("passport");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const { connectToDb } = require("./models/connection-db");
const ErrorHandler = require("./middlewares/error-handler");
const initGoogleAuth = require("./services/auth/google-auth-service");
const initDiscordAuth = require("./services/auth/discord-auth-service");
const initSeznamAuth = require("./services/auth/seznam-auth-service");
const config = require("../config/config.json");
const registerRoutes = require("./utils/register-routes");
const createIndexes = require("./utils/create-indexes");
const getPathFromRoot = require("./utils/get-path-from-root");
const Config = require("../../shared/config/config.json");
const Events = require("../../shared/constants/websocket-events.json");
const { initJwtStrategy } = require("./services/auth/jwt-auth");

// Init express
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: Config.CLIENT_URI,
    credentials: true,
  },
});

app.use(
  cors({
    origin: Config.CLIENT_URI,
    credentials: true,
  }),
);

app.use(passport.initialize());
initJwtStrategy(passport);

//Init AUTH
initGoogleAuth(passport, app);
initDiscordAuth(passport, app);
initSeznamAuth(passport, app);

// for parse JSON requests
app.use(express.json());

// Socket.io event handling
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Using constants from websocket-events.json
  socket.on(Events.LISTEN_TO_GAME, (gameCode, userId) => {
    socket.join(`${gameCode}_${userId}`);
    console.log(`Socket ${socket.id} joined lobby: ${gameCode}_${userId}`);
  });

  socket.on(Events.SPECTATE, (gameCode) => {
    socket.join(`spectate_${gameCode}`);
    console.log(`Socket ${socket.id} joined spectate: ${gameCode}`);
  });

  socket.on(Events.DISCONNECT, () => {
    console.log("User disconnected:", socket.id);
  });

  socket.on(
    Events.PLAYER_ATTEMPTED_LEAVE,
    ({ userId, gameCode, playerName, playerIdList }) => {
      console.log("Someone is attempting to leave:", playerName, playerIdList);
      playerIdList.forEach((uid) => {
        if (uid !== userId) {
          socket.to(`${gameCode}_${uid}`).emit(Events.NOTIFY_PLAYER_LEAVING, {
            playerName,
          });
        }
      });
    },
  );
});

// WebSocketService
const WebSocketService = require("./services/websocket-service");
const websocketService = new WebSocketService(io);

// Adding routers
registerRoutes(getPathFromRoot("./routes"), app, websocketService);

app.use(ErrorHandler);

// Connection DB and start server
connectToDb()
  .then(async () => {
    //for creating indexes in db
    await createIndexes(getPathFromRoot("./models"));
    // for server startup
    server.listen(config.port, () => console.log(`Server run: ${config.port}`));
  })
  .catch((err) => console.error(err));
