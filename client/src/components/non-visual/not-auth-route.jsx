import { useAuth } from "../providers/auth-context-provider.jsx";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Loading from "../visual/loading.jsx";

function NotAuthenticatedRoute({ children }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const navigateTo =
      localStorage.getItem("redirectAfterLogin") || "/start-game";
    if (user) {
      navigate(navigateTo, { replace: true });
    }
  }, [user]);

  if (loading) {
    return <Loading />;
  }
  return children;
}
export default NotAuthenticatedRoute;
