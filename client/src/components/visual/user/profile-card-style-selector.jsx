import { useState, useContext, useRef, useEffect } from "react";
import { FaPaintBrush, FaLock, FaCheckCircle } from "react-icons/fa";
import ProfileProgressBar from "./profile-progress-bar.jsx";
import CardStyleContext from "../../../context/card-style-context.js";
import { useAuth } from "../../providers/auth-context-provider.jsx";
import { updateUser } from "../../../services/user-service.js";
import CardBack from "../game/card/card-back/card-back.jsx";
import LanguageContext from "../../../context/language.js";
import { Bg } from "../../../../../shared/constants/game-constants.json";

// Classic is always unlocked. Other styles unlock at increasing levels.
function getUnlockLevel(index) {
  if (index === 0) return 0; // classic
  // Progressive unlock: first unlock at 5, then +4, +5, +6, ... (no max step)
  let level = 2;
  for (let i = 1; i < index; i++) {
    level += 3 + i; // increases by 4, 5, 6, 7, ...
  }
  return level;
}
export default function CardStyleSelector({ size, winnerId, xp }) {
  const i18n = useContext(LanguageContext);
  const { cardStyle, setCardStyle, availableStyles } =
    useContext(CardStyleContext);
  const { user, token } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [selected, setSelected] = useState(cardStyle);
  const menuRef = useRef(null);
  const userLevel = user?.level ?? 0;
  const isAdmin = user?.role === "admin";

  // Zobrazit progress bar pouze pro vítěze
  const isWinner = user?.id === winnerId;

  useEffect(() => {
    setSelected(cardStyle);
  }, [cardStyle]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(style) {
    const styleIndex = availableStyles.findIndex((s) => s.code === style);
    const unlockLevel = getUnlockLevel(styleIndex);
    if (!isAdmin && userLevel < unlockLevel) return;
    setSelected(style);
  }

  function handleConfirm(e) {
    if (e) e.preventDefault();
    if (!canConfirm) return;
    setCardStyle(selected);
    if (user?.id && selected) {
      updateUser({ cardStyle: selected }, token).then(() => {
        setShowMenu(false);
      });
    } else {
      setShowMenu(false);
    }
  }

  const selectedStyleObj = availableStyles.find(
    (style) => style.code === selected,
  );
  const selectedStyleIndex = availableStyles.findIndex(
    (s) => s.code === selected,
  );
  const unlockLevel = getUnlockLevel(selectedStyleIndex);
  const isSelectedLocked =
    selectedStyleObj &&
    selectedStyleObj.code !== "classic" &&
    !isAdmin &&
    userLevel < unlockLevel;
  const canConfirm =
    (isAdmin || userLevel >= unlockLevel) &&
    selected !== cardStyle &&
    !isSelectedLocked;

  return (
    <div className="relative inline-block" ref={menuRef}>
      {/* Progress bar pouze pro vítěze */}
      {isWinner && xp?.[user?.id] && (
        <div className="mb-4">
          <ProfileProgressBar
            level={user.level}
            xp={xp[user.id].xp}
            i18n={i18n}
          />
        </div>
      )}
      <span
        className="flex items-center gap-2 cursor-pointer select-none min-h-[40px] px-2"
        style={{ lineHeight: 1.2 }}
        onClick={() => setShowMenu((prev) => !prev)}
      >
        <FaPaintBrush
          className="hover:!bg-blue-700 transition p-1 rounded"
          size={size || 32}
        />
        <span className="text-base leading-none flex items-center h-[32px] sm:whitespace-nowrap whitespace-normal max-w-xs">
          {i18n.translate("setCardStyle")}
        </span>
      </span>
      {showMenu && (
        <div className="absolute right-0 bottom-full mb-2 !bg-white/90 border !border-gray-300 shadow-lg p-4 z-50 min-w-[260px]">
          <div className="grid grid-cols-3 gap-3 mb-4">
            {availableStyles.map((style, idx) => {
              const unlockLevel = getUnlockLevel(idx);
              const isLocked =
                style.code !== "classic" && !isAdmin && userLevel < unlockLevel;
              const isSelected = selected === style.code;
              return (
                <button
                  key={style.code}
                  onClick={() => handleSelect(style.code)}
                  className={`relative border-2 rounded-lg p-1 flex flex-col items-center transition-all duration-200 shadow-md group
                    ${isSelected ? "border-4 !border-green-500 !bg-green-50" : "!border-gray-400 !bg-white/80"}
                    ${isLocked ? "opacity-60 cursor-not-allowed" : "hover:!border-blue-400 hover:!bg-blue-50"}`}
                  title={
                    isLocked
                      ? i18n.translate("cardStyle.unlock") + unlockLevel
                      : i18n.translate(`cardStyle.${style.code}`)
                  }
                  disabled={isLocked}
                  style={{ minWidth: 64 }}
                >
                  <div className="relative">
                    <CardBack card={{ bg: Bg.RED }} forceStyle={style.code} />
                    {isSelected && !isLocked && (
                      <span className="absolute top-1 right-1 !text-green-500 !bg-white rounded-full">
                        <FaCheckCircle className="text-lg drop-shadow" />
                      </span>
                    )}
                    {isLocked && (
                      <span className="absolute inset-0 flex items-center justify-center z-10">
                        <FaLock className="text-2xl !text-gray-700 !bg-white/80 rounded-full p-1" />
                      </span>
                    )}
                  </div>
                  <div
                    className={`text-xs mt-2 px-2 py-1 rounded font-semibold ${isSelected ? "!bg-green-500 !text-white" : "!bg-gray-200 !text-gray-700"} ${isLocked ? "opacity-70" : ""}`}
                  >
                    {i18n.translate(`cardStyle.${style.code}`)}
                  </div>
                </button>
              );
            })}
          </div>
          <button
            onClick={handleConfirm}
            className={`w-full px-3 py-1 rounded !bg-gray-900 !text-white transition
              ${!canConfirm ? "opacity-50 cursor-not-allowed" : "hover:!bg-gray-800"}`}
            disabled={!canConfirm}
            tabIndex={canConfirm ? 0 : -1}
            type="button"
          >
            {i18n.translate("savePermanently")}
          </button>
        </div>
      )}
    </div>
  );
}
