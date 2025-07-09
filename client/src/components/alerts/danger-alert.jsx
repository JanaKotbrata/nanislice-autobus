import React, { useState, useEffect } from "react";
import { Rnd } from "react-rnd";

function DangerAlert({ message, onClose }) {
  const [showRules, setShowRules] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Zjistíme, jestli je mobilní zařízení
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const content = (
    <div
      id="alert-additional-content-2"
      className="relative p-4 mb-4 rounded-lg !bg-gray-800 text-red-400 !border-red-800"
      role="alert"
    >
      <div className="flex items-center">
        <svg
          className="shrink-0 w-4 h-4 me-2"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
        </svg>
        <h3 className="text-lg font-medium">WTF ale?!</h3>
      </div>
      <div className="mt-2 mb-4 text-sm">{message}</div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setShowRules(true)}
          className="text-white font-medium rounded-lg text-xs px-3 py-1.5 inline-flex items-center !bg-red-600 !hover:bg-red-700 !focus:ring-red-800"
        >
          <svg
            className="me-2 h-3 w-3"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 20 14"
          >
            <path d="M10 0C4.612 0 0 5.336 0 7c0 1.742 3.546 7 10 7 6.454 0 10-5.258 10-7 0-1.664-4.612-7-10-7Zm0 10a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z" />
          </svg>
          Pravidla?
        </button>
        <button
          type="button"
          onClick={onClose}
          className="bg-transparent border focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-xs px-3 py-1.5 !hover:bg-red-600 !border-red-600 !text-red-500 !hover:text-white !focus:ring-red-800"
        >
          No jo furt
        </button>
      </div>

      {showRules && (
        <div className="absolute inset-0 z-50 flex items-center justify-center !bg-black/60 rounded-lg">
          <div className="!bg-gray-700 p-4 rounded-lg shadow-lg max-w-xs text-sm !text-gray-100 max-h-[80vh] overflow-y-auto">
            <h3 className="font-semibold mb-2">Rady</h3>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Dvojklikem na autobus zjistíš svou poslední kartu.</li>
              <li>Při najetí myší na autobus se zobrazí počet karet.</li>
              <li>Totéž platí pro balíček v zastávce.</li>
            </ol>

            <h3 className="font-semibold my-2">Pravidla</h3>
            <h4 className="mb-2">
              Cílem hry je zbavit se všech karet v autobusu...
            </h4>
            <ol className="list-decimal pl-5 space-y-2">
              <li>
                Na začátku máš 5 karet v ruce a 10 v autobusu + 4 místa...
              </li>
              <li>Když jsi na řadě, lížeš karty, dokud nemáš 5 v ruce.</li>
              <li>
                Do hracího pole můžeš jako první kartu dát eso nebo žolíka.
              </li>
              <li>Pokud máš vhodnou kartu, můžeš ji zahrát.</li>
              <li>Jinak odkládáš do zastávky nebo dospod autobusu.</li>
            </ol>
            <button
              onClick={() => setShowRules(false)}
              className="mt-4 text-xs px-3 py-1.5 rounded !bg-red-600 !hover:bg-red-700 !text-white"
            >
              Zavřít
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 flex items-center justify-center !bg-gray-700/50 z-40">
      {isMobile ? (
        // Na mobilu nedáváme Rnd kvůli problémům s touch
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

export default DangerAlert;
