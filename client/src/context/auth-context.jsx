import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import Routes from "../../../shared/constants/routes.json";

const AuthContext = createContext(null);

const LOCAL_TOKEN_KEY = "userToken";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function initAuth(token) {
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

  async function login(token) {
    const user = await initAuth(token);
    setUser(user);
    localStorage.setItem(LOCAL_TOKEN_KEY, token);
  }

  function logout() {
    setUser(null);
    localStorage.removeItem(LOCAL_TOKEN_KEY);
  }

  useEffect(() => {
    const token = localStorage.getItem(LOCAL_TOKEN_KEY);
    if (token) {
      initAuth(token)
        .then((user) => setUser(user))
        .catch(() => logout())
        .then(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
