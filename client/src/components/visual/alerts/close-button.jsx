function CloseButton({ onClose, children }) {
  return (
    <button
      onClick={onClose}
      className="bg-transparent border focus:ring-4 font-medium rounded-lg text-xs px-3 py-1.5 !hover:bg-red-600 !border-red-600 !text-red-500 !hover:text-white"
    >
      {children}
    </button>
  );
}
export default CloseButton;
