import Routes from "../../../shared/constants/routes.json";
import Config from "../../../shared/config/config.json";
import { get, post } from "./http-method-service";

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
    console.error("Error setting user:", error);
    throw error;
  }
}
export async function logOut(data = {}, token) {
  try {
    const response = await post(Routes.User.DELETE_TOKEN, data, token);
    return response.data;
  } catch (error) {
    console.error("Error log out:", error);
    throw error;
  }
}
export async function listUser(params = {}, token) {
  try {
    const response = await get(Routes.User.LIST, token, params);
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
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
// Helper for updating user data (name, picture, language, ...)
// type: string (e.g. "name", "picture", "language")
// value: value to set (string or File)
// onSuccess: optional callback after successful update
export function updateUserData(userContext, type, value, onSuccess) {
  const formData = new FormData();
  formData.append(type, value);
  return userContext.update(formData).then(() => {
    if (onSuccess) onSuccess();
  });
}
