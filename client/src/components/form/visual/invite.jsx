import React, { useContext, useState } from "react";
import DangerAlert from "../../alerts/danger-alert.jsx";
import SuccessAlert from "../../alerts/danger-alert.jsx";
import GameContext from "../../../context/game.js";

function Invite({}) {
  const [copied, setCopied] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const gameContext = useContext(GameContext);

  const handleCopy = async () => {
    try {
      const url = `${window.location.origin}/lobby/${gameContext.gameCode}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setShowAlert(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Nepodařilo se zkopírovat URL:", err);
    }
  };

  return (
    <div className="flex bg-gray-200 justify-center items-center h-16 p-4 my-6  rounded-lg  shadow-inner">
      <div className="flex items-center border border-green-700 p-2 border-dashed rounded cursor-pointer">
        <div>
          <svg
            className="text-gray-500 w-6 h-6"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        </div>
        <div className="ml-1 text-gray-500 font-medium" onClick={handleCopy}>
          Copy - invite a friend
          {copied ? "Zkopírováno!" : "Pozvat hráče"}
          {/*showAlert &&
            (copied ? (
              <SuccessAlert
                message="Odkaz byl zkopírován do schránky."
                onClose={() => setShowAlert(false)}
              />
            ) : (
              <DangerAlert
                message="Nepodařilo se zkopírovat odkaz."
                onClose={() => setShowAlert(false)}
              />
            ))*/}
        </div>
      </div>
    </div>
  );
}

export default Invite;
