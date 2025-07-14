import Routes from "../../../shared/constants/routes.json";
import Config from "../../../shared/config/config.json";
import { post } from "./http-method-service";

export async function initAuth(token, logout) {
  let response;
  try {
    response = await post(Routes.User.AUTHENTICATE, {}, token);
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
export async function updateUser(data = {}, token) {
  try {
    const response = await post(Routes.User.UPDATE, data, token);
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
