import Config from "../../../shared/config/config.json";
import { io } from "socket.io-client";

export const socket = io(Config.SERVER_URI);
