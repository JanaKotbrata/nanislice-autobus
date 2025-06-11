import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/auth-context";
import { getGameByUser } from "../services/game-service.jsx";

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const navigate = useNavigate();

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

        const activeGame = await getGameByUser();
        console.log("spadlo to nebo?", activeGame);
        if (activeGame?.state === "active") {
          //TODO konstanty
          navigate(`/game/${activeGame.code}`);
        } else if (activeGame?.state === "initial") {
          navigate(`/lobby/${activeGame.code}`, {
            state: { gameData: activeGame },
          });
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
