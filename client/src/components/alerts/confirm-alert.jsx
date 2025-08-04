import React from "react";
import BaseAlert from "./base-alert.jsx";
import ModalWrapper from "./modal-wrapper.jsx";

function ConfirmAlert({
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onClose,
  icon,
  color = "!text-orange-400 !border-orange-800",
  buttonColor = "!bg-orange-600 hover:!bg-orange-700  focus:!ring-orange-800",
}) {
  const buttons = [
    <button
      key="confirm"
      onClick={onConfirm}
      className={`text-white font-medium rounded-lg text-xs px-3 py-1.5 inline-flex items-center ${buttonColor}`}
    >
      {confirmText}
    </button>,
    <button
      key="cancel"
      onClick={onClose}
      className="bg-transparent border focus:ring-4 font-medium rounded-lg text-xs px-3 py-1.5 !hover:bg-red-600 !border-red-600 !text-red-500 !hover:text-white"
    >
      {cancelText}
    </button>,
  ];

  return (
    <ModalWrapper>
      <BaseAlert
        title={title}
        message={message}
        color={color}
        icon={icon}
        buttons={buttons}
      />
    </ModalWrapper>
  );
}

export default ConfirmAlert;
