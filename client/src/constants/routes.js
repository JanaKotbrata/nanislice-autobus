/**
 * Frontend routes constants and utilities
 */
export const Routes = {
  HOME: "/",
  START_GAME: "/start-game",
  LOBBY: (gameCode) => `/lobby/${gameCode}`,
  GAME: (gameCode) => `/game/${gameCode}`,
};
