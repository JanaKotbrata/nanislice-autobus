import React from "react";
import UserContext from "../../context/user";
import { useAuth } from "../../context/auth-context.jsx";
import { updateUser } from "../../services/user-service.jsx";

function UserContextProvider({ children }) {
  const { user: authUser, token } = useAuth();
  const [user, setUser] = React.useState(authUser);

  function setContextUser(user) {
    setUser(user);
  }
  async function update(formData) {
    try {
      const updatedUser = await updateUser(formData, token);
      setContextUser(updatedUser);
      return updatedUser;
    } catch (err) {
      console.error("Chyba při nahrávání obrázku:", err);
    }
  }

  return (
    <UserContext.Provider value={{ setContextUser, user, update }}>
      {children}
    </UserContext.Provider>
  );
}

export default UserContextProvider;
