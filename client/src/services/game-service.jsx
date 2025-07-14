import Routes from "../../../shared/constants/routes.json";
import { get, post } from "./http-method-service";
//TODO errors
export async function getGameByUser(token) {
  try {
    const response = await get(Routes.Game.GET_BY_USER, token);
    return response.data;
  } catch (error) {
    console.error("Error fetching game by user:", error);
    throw error;
  }
}

export async function addPlayer({ userId, gameCode, gameId }, token) {
  const params = { userId };
  if (gameId) {
    params.gameId = gameId;
  } else {
    params.gameCode = gameCode;
  }
  try {
    const response = await post(Routes.Game.PLAYER_ADD, params, token);
    return response.data;
  } catch (error) {
    console.error("Error adding player:", error);
    throw error;
  }
}

export async function removePlayer({ userId, gameCode, gameId }, token) {
  const params = { userId };
  if (gameId) {
    params.gameId = gameId;
  } else {
    params.gameCode = gameCode;
  }
  try {
    const response = await post(Routes.Game.PLAYER_REMOVE, params, token);
    return response.data;
  } catch (error) {
    console.error("Error removing player:", error);
    throw error;
  }
}

export async function processAction(actionData, token) {
  try {
    const response = await post(Routes.Game.ACTION_PROCESS, actionData, token);
    return response.data.newGame;
  } catch (error) {
    console.error("Error processing game action:", error);
    throw error;
  }
}

export async function startGame(gameCode, token) {
  try {
    const response = await post(Routes.Game.START, { gameCode }, token);
    return response.data;
  } catch (error) {
    console.error("Error starting game:", error);
    throw error;
  }
}

export async function getGame({ id, code }, token) {
  const params = {};
  if (id) {
    params.id = id;
  } else if (code) {
    params.code = code;
  }
  try {
    const response = await get(Routes.Game.GET, token, params);
    return response.data;
  } catch (error) {
    console.error("Error fetching game:", error);
    throw error;
  }
}

export async function createGame(data = {}, token) {
  try {
    const response = await post(Routes.Game.CREATE, data, token);
    return response.data;
  } catch (error) {
    console.error("Error creating game:", error);
    throw error;
  }
}
export async function closeGame(data = {}, token) {
  try {
    const response = await post(Routes.Game.CLOSE, data, token);
    return response.data;
  } catch (error) {
    console.error("Error closing game:", error);
    throw error;
  }
}

export async function setPlayer(data = {}, token) {
  try {
    const response = await post(Routes.Game.PLAYER_SET, data, token);
    return response.data;
  } catch (error) {
    console.error("Error setting player:", error);
    throw error;
  }
}
