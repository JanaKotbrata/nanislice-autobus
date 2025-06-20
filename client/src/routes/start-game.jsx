import { useNavigate } from "react-router-dom";
import React, { useContext, useState } from "react";
import Instructions from "../components/instructions.jsx";
import { useAuth } from "../context/auth-context.jsx";
import { addPlayer, createGame, getGame } from "../services/game-service.jsx";
import GameContext from "../context/game.js";
import { FaSignInAlt } from "react-icons/fa";

function StartGame() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const gameContext = useContext(GameContext);
  const [gameCode, setGameCode] = useState("");

  async function startGame() {
    try {
      const response = await createGame();
      gameContext.setContextGame(response);
      if (response.state === "active") {
        navigate(`/game/${response.code}`);
      } else {
        navigate(`/lobby/${response.code}`);
      }
    } catch (error) {
      if (error.response?.data?.name === "UserAlreadyInGame") {
        const game = await getGame({
          id: `?id=${error.response.data?.params?.gameId}`,
        });
        gameContext.setContextGame(game);
        navigate(`/lobby/${game?.code}`);
      } else {
        alert(error.message);
        console.error("Chyba při vytváření hry:", error);
      }
    }
  }

  async function joinGame() {
    if (!gameCode) {
      alert("Jakobyyy musíš zadat kód hry, víš. Anebo si vytvoř svojí, jo?");
      return;
    }
    try {
      await addPlayer({ userId: user.id, gameCode });
      navigate(`/lobby/${gameCode}`);
    } catch (error) {
      alert(error.message);
      console.error("Chyba při připojování do hry:", error);
    }
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-700 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl aspect-square bg-gray-950/50  rounded-2xl shadow-2xl p-6 grid grid-cols-2 gap-4">
        {/* Left box - Player info */}
        <div className="flex flex-col items-center justify-center border-r-2 border-cyan-400/50 pr-4 ">
          <img
            src={user.picture}
            alt="avatar"
            className="w-24 h-24 rounded-full shadow-md mb-4"
          />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            {user.name}
          </h2>
          <button
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 transition"
            onClick={() => startGame()}
          >
            Create Game
          </button>
          <input
            type="text"
            placeholder="Enter game code"
            value={gameCode}
            onChange={(e) => setGameCode(e.target.value)}
            className="mt-4 px-6 py-2 border rounded-md mb-2"
          />
          <FaSignInAlt
            className="text-gray-500 hover:text-green-500"
            onClick={() => joinGame()}
            title="Join Game"
            size={16}
          />
        </div>
        {/* Right box - How to play */}
        <Instructions />
      </div>
    </div>
  );
}

export default StartGame;
