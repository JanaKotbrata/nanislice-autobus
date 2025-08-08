import React, { useContext } from "react";
import ModalWrapper from "./modal-wrapper.jsx";
import BaseAlert from "./base-alert.jsx";
import LanguageContext from "../../../context/language.js";

function SuccessAlert({ message }) {
  const i18n = useContext(LanguageContext);
  return (
    <ModalWrapper>
      <BaseAlert
        title={i18n.translate("olala")}
        message={message}
        color="!text-green-400 border !border-green-800"
        icon={
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
          </svg>
        }
      />
    </ModalWrapper>
  );
}

export default SuccessAlert;
