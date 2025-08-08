import React from "react";

function InfoAlert({ message, onClose }) {
  return (
    <div
      className="flex items-center p-4 mb-4 text-yellow-800 border-t-4 border-yellow-300 bg-yellow-50 dark:text-yellow-300 dark:bg-gray-800 dark:border-yellow-800 z-10"
      role="alert"
    >
      <svg className="shrink-0 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
      </svg>
      <div className="ms-3 text-sm font-medium">{message}</div>
      <button
        className="ms-auto -mx-1.5 -my-1.5 inline-flex items-center justify-center h-8 w-8 !text-black !bg-yellow-300 hover:!bg-gray-700"
        onClick={onClose}
      >
        X
      </button>
    </div>
  );
}

export default InfoAlert;
