import axios from "axios";
import Routes from "../../../shared/constants/routes.json";

//TODO errors
export async function getGameByUser() {
  try {
    const response = await axios.get(Routes.Game.GET_BY_USER);
    return response.data;
  } catch (error) {
    console.error("Error fetching game by user:", error);
    throw error;
  }
}

export async function addPlayer({ userId, gameCode, gameId }) {
  const params = { userId };
  if (gameId) {
    params.gameId = gameId;
  } else {
    params.gameCode = gameCode;
  }
  try {
    const response = await axios.post(Routes.Game.PLAYER_ADD, params);
    return response.data;
  } catch (error) {
    console.error("Error adding player:", error);
    throw error;
  }
}

export async function removePlayer({ userId, gameCode, gameId }) {
  const params = { userId };
  if (gameId) {
    params.gameId = gameId;
  } else {
    params.gameCode = gameCode;
  }
  try {
    const response = await axios.post(Routes.Game.PLAYER_REMOVE, params);
    return response.data;
  } catch (error) {
    console.error("Error removing player:", error);
    throw error;
  }
}

export async function processAction(actionData) {
  try {
    const response = await axios.post(Routes.Game.ACTION_PROCESS, actionData);
    return response.data.newGame;
  } catch (error) {
    console.error("Error processing game action:", error);
    throw error;
  }
}

export async function startGame(gameCode) {
  try {
    const response = await axios.post(Routes.Game.START, { gameCode });
    return response.data;
  } catch (error) {
    console.error("Error starting game:", error);
    throw error;
  }
}

export async function getGame({ id, code }) {
  //FIXME - mělo by fungovat toto - await axios.get(Routes.Game.GET, {
  //           params: {
  //             id: error.response.data.gameId,
  //           },
  //         });
  let parameter;
  if (id) {
    parameter = `?id=${id}`;
  } else if (code) {
    parameter = `?code=${code}`;
  }
  try {
    const response = await axios.get(Routes.Game.GET + parameter);
    return response.data;
  } catch (error) {
    console.error("Error fetching game:", error);
    throw error;
  }
}

export async function createGame(data = {}) {
  try {
    const response = await axios.post(Routes.Game.CREATE, data);
    return response.data;
  } catch (error) {
    console.error("Error creating game:", error);
    throw error;
  }
}
export async function closeGame(data = {}) {
  try {
    const response = await axios.post(Routes.Game.CLOSE, data);
    return response.data;
  } catch (error) {
    console.error("Error closing game:", error);
    throw error;
  }
}
