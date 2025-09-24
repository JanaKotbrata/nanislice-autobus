import { useAuth } from "../providers/auth-context-provider.jsx";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const currentAddress = location.pathname + location.search;
    if (!user) {
      localStorage.setItem("redirectAfterLogin", currentAddress);
      navigate("/", { replace: true });
    } else {
      // user is logged in
      const shouldRedirectTo = localStorage.getItem("redirectAfterLogin");
      if (shouldRedirectTo === currentAddress) {
        localStorage.removeItem("redirectAfterLogin"); // we have reached the final destination
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
