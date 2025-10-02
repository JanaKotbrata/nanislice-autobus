import { useContext, useState, useRef, useEffect } from "react";
import { FaPalette } from "react-icons/fa";
import GameboardColorContext from "../../../context/gameboard-color-context.js";
import { useAuth } from "../../providers/auth-context-provider.jsx";
import { updateUser } from "../../../services/user-service.js";
import LanguageContext from "../../../context/language.js";
import { GAMEBOARD_COLOR } from "../../../constants/local-storage.js";
import { DEFAULT_GAMEBOARD_COLOR } from "../../../constants/game.js";

function GameboardColorPicker({ size }) {
  const i18n = useContext(LanguageContext);
  const { gameboardColor, setGameboardColor } = useContext(
    GameboardColorContext,
  );
  const { user, token } = useAuth();
  const [tempColor, setTempColor] = useState(gameboardColor);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleColorChange(e) {
    setTempColor(e.target.value);
    localStorage.setItem(GAMEBOARD_COLOR, e.target.value);
    setGameboardColor(e.target.value);
  }

  function handleSave() {
    setGameboardColor(tempColor);
    if (user?.id && tempColor) {
      updateUser({ gameboardColor: tempColor }, token);
      localStorage.removeItem(GAMEBOARD_COLOR);
    }
    setShowMenu(false);
  }

  function handleReset() {
    setTempColor(DEFAULT_GAMEBOARD_COLOR);
    setGameboardColor(DEFAULT_GAMEBOARD_COLOR);
    if (user?.id) {
      updateUser({ gameboardColor: DEFAULT_GAMEBOARD_COLOR }, token);
      localStorage.removeItem(GAMEBOARD_COLOR);
    } else {
      localStorage.setItem(GAMEBOARD_COLOR, DEFAULT_GAMEBOARD_COLOR);
    }
    setShowMenu(false);
  }

  return (
    <div className="relative inline-block" ref={menuRef}>
      <span
        className="flex items-center gap-2 cursor-pointer select-none min-h-[40px] px-2"
        style={{ lineHeight: 1.2 }}
        onClick={() => setShowMenu((prev) => !prev)}
      >
        <FaPalette
          className="hover:!bg-blue-700 transition p-1 rounded"
          size={size || 32}
        />
        <span className="text-base leading-none flex items-center h-[32px] sm:whitespace-nowrap whitespace-normal max-w-xs">
          {i18n.translate("setGameboardColor")}
        </span>
      </span>
      {showMenu && (
        <div className="absolute right-0 bottom-full mb-2 !bg-white/90 border !border-gray-300 shadow-lg p-4 z-50 min-w-[260px] flex flex-col items-center gap-2">
          <div className="flex flex-col items-center gap-2">
            <label className="block text-sm text-gray-700 mb-2">
              {i18n.translate("setGameboardColor")}
            </label>
            <input
              id="gameboard-color-input"
              type="color"
              value={tempColor}
              onChange={handleColorChange}
              className="w-12 h-12 border rounded-full cursor-pointer mb-2"
              style={{ display: "block" }}
            />
          </div>
          <button
            onClick={handleSave}
            className="w-full px-3 py-1 rounded !bg-gray-900 !text-white transition hover:!bg-gray-800"
            type="button"
          >
            {i18n.translate("savePermanently")}
          </button>

          <button
            onClick={handleReset}
            className="w-full px-3 py-1 rounded !bg-gray-200 !text-gray-900 border border-gray-400 transition hover:!bg-gray-100 mt-2"
            type="button"
          >
            {i18n.translate("resetColor")}
          </button>
        </div>
      )}
    </div>
  );
}
export default GameboardColorPicker;
