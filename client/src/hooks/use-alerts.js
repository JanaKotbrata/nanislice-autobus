import { useContext, useState } from "react";
import LanguageContext from "../context/language";

export function useAlerts() {
  const i18n = useContext(LanguageContext);

  const [errorMessage, setErrorMessage] = useState(null);
  const [showDangerAlert, setShowDangerAlert] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [startAlert, setStartAlert] = useState(false);
  // Info alert state
  const [infoMessage, setInfoMessage] = useState("");

  function showErrorAlert(messageKey, message = "") {
    console.log("děje se něco?", messageKey, message);
    const translatedMessage = i18n.translate(messageKey) + message;
    setErrorMessage(translatedMessage);
    setShowDangerAlert(true);
  }

  return {
    errorMessage,
    setErrorMessage,
    showDangerAlert,
    setShowDangerAlert,
    showAlert,
    setShowAlert,
    startAlert,
    setStartAlert,
    showErrorAlert,
    // Info alert API
    infoMessage,
    setInfoMessage,
  };
}
