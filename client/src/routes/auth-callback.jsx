import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/auth-context";

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

        navigate("/start-game", { replace: true });
      } catch (error) {
        console.error("Chyba:", error);
        navigate("/", { replace: true });
      }
    };

    initAuth();
  }, [searchParams]);

  return <p>Přihlašujeme tě...</p>;
}
