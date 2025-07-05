import React from "react";

function Button({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="min-w-[100px] text-white !bg-gray-900 hover:!bg-black !border-cyan-400/50 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
    >
      {children}
    </button>
  );
}

export default Button;
