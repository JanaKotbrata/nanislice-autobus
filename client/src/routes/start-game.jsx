import { useNavigate } from "react-router-dom";
import React from "react";
import axios from "axios";
import Routes from "./../../../shared/constants/routes.json";
import Instructions from "../components/instructions.jsx";
import { useAuth } from "../context/auth-context.jsx";

function StartGame() {
  const { user } = useAuth();
  const navigate = useNavigate();

  async function createGame() {
    try {
      const response = await axios.post(Routes.Game.CREATE, {});
      navigate("/lobby", {
        state: { gameData: response.data },
      });
    } catch (error) {
      if (error.response?.data?.name === "UserAlreadyInGame") {
        //FIXME - mělo by fungovat toto - await axios.get(Routes.Game.GET, {
        //           params: {
        //             id: error.response.data.gameId,
        //           },
        //         });
        const game = await axios.get(
          Routes.Game.GET + `?id=${error.response.data?.params?.gameId}`,
        );
        navigate("/lobby", { state: { gameData: game?.data } });
      } else {
        alert(error.message);
        console.error("Chyba při vytváření hry:", error);
      }
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
            onClick={() => createGame()}
          >
            Start Game
          </button>
        </div>

        {/* Right box - How to play */}
        <Instructions />
      </div>
    </div>
  );
}

export default StartGame;
