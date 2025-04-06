import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/auth-context";

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const navigate = useNavigate();
  const authAttempted = useRef(false);

  useEffect(() => {
    const initAuth = async () => {
      if (authAttempted.current) return;
      authAttempted.current = true;

      try {
        const token = searchParams.get("token");
        const userId = searchParams.get("userId");

        if (!token || !userId) {
          console.error("Chybí token nebo userId");
          navigate("/", { replace: true });
          return;
        }

        const user = { token, id: userId };
        await login(user);
        navigate("/start-game", { replace: true });
      } catch (error) {
        console.error("Chyba:", error);
        navigate("/", { replace: true });
      }
    };

    initAuth();
  }, [searchParams, login, navigate]);

  return <p>Přihlašujeme tě...</p>;
}
