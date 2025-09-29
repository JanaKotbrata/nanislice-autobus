import BaseAlert from "./base-alert.jsx";
import ModalWrapper from "./modal-wrapper.jsx";
import CloseButton from "./close-button.jsx";
import DefaultButton from "./default-button.jsx";

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
    <DefaultButton key="confirm" onClick={onConfirm} buttonColor={buttonColor}>
      {confirmText}
    </DefaultButton>,
    <CloseButton key="cancel" onClose={onClose}>
      {cancelText}
    </CloseButton>,
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
