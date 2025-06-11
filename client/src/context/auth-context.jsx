import { createContext, useContext, useState, useEffect } from "react";
import { initAuth } from "../services/user-service.jsx"; // Adjust the import path as necessary

const AuthContext = createContext(null);

const LOCAL_TOKEN_KEY = "userToken";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  function logout() {
    setUser(null);
    localStorage.removeItem(LOCAL_TOKEN_KEY);
  }

  async function login(token) {
    const user = await initAuth(token, logout);
    setUser(user);
    localStorage.setItem(LOCAL_TOKEN_KEY, token);
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
