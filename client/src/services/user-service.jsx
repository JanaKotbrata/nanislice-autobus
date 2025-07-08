import axios from "axios";
import Routes from "../../../shared/constants/routes.json";
import Config from "../../../shared/config/config.json";

export async function initAuth(token, logout) {
  let response;
  try {
    response = await axios.post(
      Routes.User.AUTHENTICATE,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
  } catch (error) {
    console.error("Auth initialization failed:", error);
    logout();
    throw new Error("Unauthenticated user");
  }
  if (response.data) {
    return response.data;
  } else {
    console.error("Auth initialization failed - no return data", response);
    logout();
    throw new Error("Unauthenticated user");
  }
}
export async function updateUser(data = {}) {
  try {
    const response = await axios.post(Routes.User.UPDATE, data);
    return response.data;
  } catch (error) {
    console.error("Error setting player:", error);
    throw error;
  }
}
export function getAvatar(userId, cacheBreaker = "") {
  const target = `${Config.SERVER_URI}${Routes.User.GET_AVATAR}?userId=${userId}`;
  if (cacheBreaker) {
    return `${target}&cacheBreaker=${cacheBreaker}`;
  }
  return target;
}
