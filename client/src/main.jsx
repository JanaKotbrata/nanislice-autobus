import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
//import BackCard from "./routes/game/back-card.jsx";
//import Profile from "./routes/profile.jsx";
//import Users from "./routes/users.jsx";
//import Loading from "./components/loading.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
