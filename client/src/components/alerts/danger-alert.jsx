import React, { useState } from "react";
import { Rnd } from "react-rnd";

function DangerAlert({ message, onClose }) {
  const [showRules, setShowRules] = useState(false);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-700/50 z-40">
      <Rnd
        default={{
          x: 100,
          y: 100,
          width: 300,
          height: "auto",
        }}
        bounds="window"
      >
        <div
          id="alert-additional-content-2"
          className="relative p-4 mb-4 text-red-800 border border-red-300 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400 dark:border-red-800"
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
          <div className="flex">
            <button
              type="button"
              onClick={() => setShowRules(true)}
              className="text-white bg-red-800 hover:bg-red-900 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-xs px-3 py-1.5 me-2 inline-flex items-center dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800"
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
              className="text-red-800 bg-transparent border border-red-800 hover:bg-red-900 hover:text-white focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-xs px-3 py-1.5 dark:hover:bg-red-600 dark:border-red-600 dark:text-red-500 dark:hover:text-white dark:focus:ring-red-800"
            >
              No jo furt
            </button>
          </div>

          {/* Modal s pravidly */}
          {showRules && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 rounded-lg">
              <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-lg max-w-xs text-sm text-gray-800 dark:text-gray-100">
                <h3 className="font-semibold mb-2">Pravidla</h3>
                <h4>
                  Cílem hry, je zbavit se všech karet v autobusu. Hráč, který
                  jako první vyloží všechny karty z autobusu, vyhrává.
                </h4>{" "}
                <ol className="list-decimal pl-5 space-y-2">
                  <li>
                    Na začátku máš 5 karet v ruce a 10 karet v autobusu. Ještě
                    máš k dispozici 4 místa v zastávce pro odložení karet na
                    konci tvého kola.
                  </li>
                  <li>
                    Když jsi na řadě tak si lízneš kartu, dokud nemáš v ruce 5
                    karet.
                  </li>
                  <li>
                    Do hracího pole můžeš jako první kartu dát eso nebo
                    žolíka...
                  </li>
                  <li>
                    Pokud máš v ruce, v zastávce nebo na vrchu autobusu nějakou
                    kartu, která se hodí na hrací pole, můžeš ji zahrát.
                  </li>
                  <li>
                    Pokud již nemáš žádnou kartu, co bys mohl zahrát, tak
                    odkládáš kartu z ruky do zastávky. V zastávce si můžeš dávat
                    stejný ranky karet na sebe a tím šetříš místo. Pokud nemáš
                    místo v zastávce, dáváš dospod autobusu (stačí kartu
                    přetáhnout na autobus)... !!Můžeš se dvojklikem podívat co
                    máš jako poslední kartu v autobusu, aby si věděl, co tam
                    nejlépe odložit!!
                  </li>
                </ol>
                <button
                  onClick={() => setShowRules(false)}
                  className="mt-4 text-xs px-3 py-1.5 rounded bg-red-600 hover:bg-red-700 text-white"
                >
                  Zavřít
                </button>
              </div>
            </div>
          )}
        </div>
      </Rnd>
    </div>
  );
}

export default DangerAlert;
