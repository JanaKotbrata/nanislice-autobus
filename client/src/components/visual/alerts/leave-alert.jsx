import React, { useContext } from "react";
import { FaRegQuestionCircle } from "react-icons/fa";
import ConfirmAlert from "./confirm-alert.jsx";
import LanguageContext from "../../../context/language.js";

function LeaveAlert({ message, onClose, onConfirm }) {
  const i18n = useContext(LanguageContext);

  return (
    <ConfirmAlert
      title={i18n.translate("leaveGameAlertTitle")}
      message={message}
      confirmText={i18n.translate("leaveGameAlertConfirm")}
      cancelText={i18n.translate("leaveGameAlertClose")}
      onConfirm={onConfirm}
      onClose={onClose}
      icon={<FaRegQuestionCircle className="mr-2" />}
    />
  );
}

export default LeaveAlert;
