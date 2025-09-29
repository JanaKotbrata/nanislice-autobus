function DefaultButton({ children, onClick, buttonColor = "" }) {
  return (
    <button
      onClick={onClick}
      className={`text-white font-medium rounded-lg text-xs px-3 py-1.5 inline-flex items-center ${buttonColor}`}
    >
      {children}
    </button>
  );
}
export default DefaultButton;
