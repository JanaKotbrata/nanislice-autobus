import Config from "../../../shared/config/config.json";
import { io } from "socket.io-client";

export const socket = io(Config.SERVER_URI, {
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
  autoConnect: true,
});
function reconnectIfNeeded() {
  if (document.visibilityState === "visible" && !socket.connected) {
    socket.connect();
  }
}
document.addEventListener("visibilitychange", reconnectIfNeeded);
window.addEventListener("focus", reconnectIfNeeded);
window.addEventListener("pageshow", reconnectIfNeeded);
