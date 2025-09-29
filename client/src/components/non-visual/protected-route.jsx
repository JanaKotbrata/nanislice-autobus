import { useAuth } from "../providers/auth-context-provider.jsx";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { REDIRECT_AFTER_LOGIN } from "../../constants/local-storage.js";
import { Routes } from "../../constants/routes.js";

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const currentAddress = location.pathname + location.search;
    if (!user) {
      localStorage.setItem(REDIRECT_AFTER_LOGIN, currentAddress);
      navigate(Routes.HOME, { replace: true });
    } else {
      // user is logged in
      const shouldRedirectTo = localStorage.getItem(REDIRECT_AFTER_LOGIN);
      if (shouldRedirectTo === currentAddress) {
        localStorage.removeItem(REDIRECT_AFTER_LOGIN); // we have reached the final destination
      }
    }
  }, [user]);

  if (!user) {
    return null;
  } else {
    return children;
  }
}
export default ProtectedRoute;
