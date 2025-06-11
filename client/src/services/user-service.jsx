import axios from "axios";
import Routes from "../../../shared/constants/routes.json";

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
