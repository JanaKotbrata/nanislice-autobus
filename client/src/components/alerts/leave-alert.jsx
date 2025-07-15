import React, { useState, useEffect } from "react";
import { Rnd } from "react-rnd";
import { FaRegQuestionCircle } from "react-icons/fa";

function LeaveAlert({ message, onClose, onConfirm }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const content = (
    <div
      id="alert-additional-content-2"
      className="relative p-4 mb-4 rounded-lg !bg-gray-800 text-orange-400 !border-orange-800"
      role="alert"
    >
      <div className="flex items-center">
        <FaRegQuestionCircle className={"mr-2"} />
        <h3 className="text-lg font-medium">Ehm, ehm</h3>
      </div>
      <div className="mt-2 mb-4 text-sm">{message}</div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onConfirm}
          className="text-white font-medium rounded-lg text-xs px-3 py-1.5 inline-flex items-center !bg-orange-600 !hover:bg-orange-700 !focus:ring-orange-800"
        >
          Jasně, že chci odejít a nesu následky za své činy!
        </button>
        <button
          type="button"
          onClick={onClose}
          className="bg-transparent border focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-xs px-3 py-1.5 !hover:bg-red-600 !border-red-600 !text-red-500 !hover:text-white !focus:ring-red-800"
        >
          Ne, tak já teda zůstanu ve hře.
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 flex items-center justify-center !bg-gray-700/50 z-40">
      {isMobile ? (
        content
      ) : (
        <Rnd
          default={{
            x: 100,
            y: 100,
            width: "auto",
            height: "auto",
          }}
          bounds="window"
          disableDragging={false}
          enableResizing={false}
          style={{ pointerEvents: "auto" }}
        >
          {content}
        </Rnd>
      )}
    </div>
  );
}

export default LeaveAlert;
