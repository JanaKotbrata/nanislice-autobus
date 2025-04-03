import { useAuth } from "../context/auth-context.js";
import { useNavigate } from "react-router-dom";
import React from "react";
import Member from "../components/form/visual/member.jsx";
import Invite from "../components/form/visual/invite.jsx";
import Start from "../components/form/visual/start.jsx";
import nanislice from "../assets/nanislice.svg";

function Lobby() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
      <div className="dark:bg-gray-800 dark:border-gray-700">
        <div className="h-12 flex justify-between items-center border-b border-gray-200 m-4">
          <div>
            <div className="text-xl font-bold text-gray-700">Lobby 122345</div>
            <div className="text-sm font-base text-gray-500">
              Waiting for more players...
            </div>
          </div>
          <div>
            <div className="flex items-center justify-center w-full  shadow-md rounded-full">
              <img className=" h-12 w-12" src={nanislice} alt="logo" />
            </div>
          </div>
        </div>
        <div className="px-6">
          <Member level="Level 1 - Chlebík">Nani</Member>
          <Member level="Level 2 - Chléb">Karel</Member>
          <Invite />
          <Start />
        </div>
      </div>
    </div>
  );
}

export default Lobby;
