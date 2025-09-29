import { useContext, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../components/providers/auth-context-provider.jsx";
import { getGameByUser } from "../services/game-service.js";
import LanguageContext from "../context/language.js";
import { States } from "../../../shared/constants/game-constants.json";
import { Routes } from "../constants/routes.js";

function AuthCallback() {
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const navigate = useNavigate();
  const i18n = useContext(LanguageContext);

  useEffect(() => {
    async function initAuth() {
      try {
        const token = searchParams.get("token");

        if (!token) {
          console.error("Chybí token");
          navigate(Routes.HOME, { replace: true });
          return;
        }

        await login(token);
        const redirect = localStorage.getItem("redirectAfterLogin");
        if (redirect) {
          navigate(redirect, { replace: true });
          return;
        }

        const activeGame = await getGameByUser(token);
        if (activeGame?.state === States.ACTIVE) {
          navigate(Routes.GAME(activeGame.code));
        } else if (activeGame?.state === States.INITIAL) {
          navigate(Routes.LOBBY(activeGame?.code));
        } else {
          navigate(Routes.START_GAME, { replace: true });
        }
      } catch (error) {
        console.error("Chyba:", error);
        navigate(Routes.HOME, { replace: true });
      }
    }

    initAuth();
  }, [searchParams]);

  return <p> {i18n.translate("signing")}</p>;
}
export default AuthCallback;
