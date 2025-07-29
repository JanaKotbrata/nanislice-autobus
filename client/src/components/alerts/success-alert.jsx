import React, { useContext } from "react";
import { Rnd } from "react-rnd";
import LanguageContext from "../../context/language.js";

function SuccessAlert({ message }) {
  const i18n = useContext(LanguageContext);
  return (
    <div className="fixed inset-0 flex items-center justify-center !bg-gray-700/50 z-40">
      <Rnd
        default={{
          x: 300,
          y: 300,
          width: 300,
          height: "auto",
        }}
        bounds="window"
      >
        <div
          id="alert-additional-content-2"
          className="relative p-4 mb-4  rounded-lg  !bg-gray-800 !text-green-400 border  !border-green-800"
          role="alert"
        >
          <div className="flex items-center">
            <svg
              className="shrink-0 w-4 h-4 me-2"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
            </svg>
            <h3 className="text-lg font-medium">{i18n.translate("olala")}</h3>
          </div>
          <div className="mt-2 mb-4 text-sm">{message}</div>
        </div>
      </Rnd>
    </div>
  );
}

export default SuccessAlert;
