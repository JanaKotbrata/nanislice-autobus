import { FaSignOutAlt } from "react-icons/fa";
import { useContext, useState } from "react";
import { useAuth } from "../../providers/auth-context-provider.jsx";
import { logOut } from "../../../services/user-service.js";
import LogOutAlert from "../alerts/log-out-alert.jsx";
import LanguageContext from "../../../context/language.js";

function LogOut({ size }) {
  const i18n = useContext(LanguageContext);
  const { token, logout } = useAuth();
  const [showAlert, setShowAlert] = useState(false);

  function handleLogOut() {
    logOut({}, token)
      .then(() => {
        logout();
        window.location.href = "/";
      })
      .catch((err) => console.error(err));
  }
  return (
    <div className="flex justify-end p-2 z-10">
      <FaSignOutAlt
        className="text-gray-500 hover:text-red-500 cursor-pointer"
        onClick={() => setShowAlert(true)}
        title={i18n.translate("logOutTitle")}
        size={size || 32}
      />
      {showAlert && (
        <LogOutAlert
          className="ml-2 !text-white"
          message={i18n.translate("logOutMessage")}
          onConfirm={() => handleLogOut()}
          onClose={() => setShowAlert(false)}
        />
      )}
    </div>
  );
}

export default LogOut;
