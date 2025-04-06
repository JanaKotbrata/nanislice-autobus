import { useLocation } from "react-router-dom";
import React from "react";
import Member from "../components/form/visual/member.jsx";
import Invite from "../components/form/visual/invite.jsx";
import Start from "../components/form/visual/start.jsx";
import nanislice from "../assets/nanislice.svg";
import Instructions from "../components/instructions.jsx";

function Lobby({
  user = {
    name: "Karel",
    avatar:
      "https://static-cdn.jtvnw.net/jtv_user_pictures/27fdad08-a2c2-4e0b-8983-448c39519643-profile_image-70x70.png",
  },
}) {
  const { state } = useLocation();
  const gameData = state?.gameData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-700 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl aspect-square bg-gray-950/50 rounded-2xl shadow-2xl p-6">
        {/* První div obsahující informace o lobby */}
        <div className="h-12 flex justify-between items-center border-b border-cyan-400/50 mb-20">
          <div>
            <div className="text-xl font-bold text-gray-300">
              Lobby {gameData.code}
            </div>
            <div className="text-sm font-base text-gray-500">
              Waiting for more players...
            </div>
          </div>
          <div>
            <div className="flex items-center justify-center w-full shadow-md rounded-full">
              <img className="h-12 w-12" src={nanislice} alt="logo" />
            </div>
          </div>
        </div>

        {/* Grid layout pro zbytek obsahu */}
        <div className="grid grid-cols-2 gap-5">
          {/* Left box - Player info */}
          <div className="flex flex-col items-center justify border-r-2 border-cyan-400/50 pr-4">
            {gameData.playerList.map((player) => (
              <Member
                key={player.userId}
                level={player.creator ? "Zakladatel" : "Pleb"}
              >
                {player.name}
              </Member>
            ))}
            <Invite />
            <Start />
          </div>
          {/* Right box - How to play */}
          <Instructions />
        </div>
      </div>
    </div>
  );
}

export default Lobby;
