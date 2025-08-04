import React, { useContext, useState } from "react";
import ModalWrapper from "./modal-wrapper.jsx";
import BaseAlert from "./base-alert.jsx";
import LanguageContext from "../../context/language";
import AlertRules from "./alert-rules.jsx";

function DangerAlert({ message, onClose }) {
  const i18n = useContext(LanguageContext);
  const [showRules, setShowRules] = useState(false);

  const buttons = [
    <button
      key="rules"
      onClick={() => setShowRules(true)}
      className="text-white font-medium rounded-lg text-xs px-3 py-1.5 inline-flex items-center !bg-red-600 !hover:bg-red-700 !focus:ring-red-800"
    >
      <svg className="me-2 h-3 w-3" fill="currentColor" viewBox="0 0 20 14">
        <path d="M10 0C4.612 0 0 5.336 0 7c0 1.742 3.546 7 10 7 6.454 0 10-5.258 10-7 0-1.664-4.612-7-10-7Zm0 10a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z" />
      </svg>
      {i18n.translate("dangerAlertConfirm")}
    </button>,
    <button
      key="close"
      onClick={onClose}
      className="bg-transparent border focus:ring-4 font-medium rounded-lg text-xs px-3 py-1.5 !hover:bg-red-600 !border-red-600 !text-red-500 !hover:text-white"
    >
      {i18n.translate("dangerAlertClose")}
    </button>,
  ];
  //TODO
  return (
    <ModalWrapper>
      <BaseAlert
        title={i18n.translate("wtf")}
        message={message}
        color="!text-red-400 !border-red-800"
        icon={
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
          </svg>
        }
        buttons={buttons}
      ></BaseAlert>
      {showRules && <AlertRules onClose={() => setShowRules(false)} />}
    </ModalWrapper>
  );
}

export default DangerAlert;
