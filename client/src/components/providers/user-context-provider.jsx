import UserContext from "../../context/user";
import { useAuth } from "./auth-context-provider.jsx";
import { updateUser } from "../../services/user-service.js";
import { useState } from "react";

function UserContextProvider({ children }) {
  const { user: authUser, token } = useAuth();
  const [user, setUser] = useState(authUser);

  async function update(formData) {
    try {
      const updatedUser = await updateUser(formData, token);
      setUser(updatedUser);
      return updatedUser;
    } catch (err) {
      console.error("Failed to update user:", err);
    }
  }

  return (
    <UserContext.Provider value={{ setUser, user, update }}>
      {children}
    </UserContext.Provider>
  );
}

export default UserContextProvider;
