import { useState } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./App.css";
import { motion } from "motion/react";
import Welcome from "./components/welcome.jsx";
import config from "../../shared/config/config.json";

function App() {
  const [google, signInGoogle] = useState(0);

  return (
    <GoogleOAuthProvider clientId={config.google.client_id}>
      <div className="container">
        <Welcome />
      </div>
    </GoogleOAuthProvider>
    /* <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
          <motion.div animate={{ opacity: count % 2 ? 1 : 0 }}>ahoj</motion.div>
      </div>

      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>



          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>*/
  );
}

export default App;
