import { useContext, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/auth-context";
import { getGameByUser } from "../services/game-service.jsx";
import GameContext from "../context/game.js";

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const navigate = useNavigate();
  const gameContext = useContext(GameContext);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = searchParams.get("token");

        if (!token) {
          console.error("Chybí token");
          navigate("/", { replace: true });
          return;
        }

        await login(token);

        const activeGame = await getGameByUser(token);
        if (activeGame?.state === "active") {
          gameContext.setContextGame(activeGame);
          //TODO konstanty
          navigate(`/game/${activeGame.code}`);
        } else if (activeGame?.state === "initial") {
          gameContext.setContextGame(activeGame);
          navigate(`/lobby/${activeGame.code}`);
        } else {
          navigate("/start-game", { replace: true });
        }
      } catch (error) {
        console.error("Chyba:", error);
        navigate("/", { replace: true });
      }
    };

    initAuth();
  }, [searchParams]);

  return <p>Přihlašujeme tě...</p>;
}
