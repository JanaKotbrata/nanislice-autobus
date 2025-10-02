import { useState, useContext, useRef, useEffect } from "react";
import LanguageContext from "../../context/language.js";
import { FaMusic, FaVolumeMute } from "react-icons/fa";
import { useAudio } from "../providers/audio-context-provider.jsx";
import { useAuth } from "../providers/auth-context-provider.jsx";
import { updateUser } from "../../services/user-service.js";

function VolumeSettings({ size }) {
  const i18n = useContext(LanguageContext);
  const { volume, setVolume, muted, setMuted, playSound } = useAudio();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const feedbackTimeout = useRef(null);
  const feedbackAudio = useRef(null);
  const { user, token } = useAuth();

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleVolumeChange(val) {
    const normalized = val / 100;
    setVolume(normalized);
    if (normalized === 0) {
      setMuted(true);
    } else {
      setMuted(false);
    }

    if (!feedbackAudio.current) {
      feedbackAudio.current = playSound("/sounds/crickets.mp3", false);
    } else {
      feedbackAudio.current.currentTime = 0;
      feedbackAudio.current.play().catch(() => {});
    }

    clearTimeout(feedbackTimeout.current);
    feedbackTimeout.current = setTimeout(() => {
      if (feedbackAudio.current) {
        feedbackAudio.current.pause();
        feedbackAudio.current = null;
      }
    }, 1000);
  }

  function handleSave() {
    updateUser({ volume }, token).then(() => {
      setShowMenu(false);
      console.log("Volume saved");
    });
  }

  return (
    <div className="relative flex justify-end mb-3" ref={menuRef}>
      {muted || volume === 0 ? (
        <FaVolumeMute
          className="hover:!bg-green-700 cursor-pointer transition p-1 rounded"
          title={i18n.translate("changeVolume")}
          onClick={() => setShowMenu((prev) => !prev)}
          size={size || 19}
        />
      ) : (
        <FaMusic
          className="hover:!bg-green-700 cursor-pointer transition p-1 rounded"
          title={i18n.translate("changeVolume")}
          onClick={() => setShowMenu((prev) => !prev)}
          size={size || 19}
        />
      )}

      {showMenu && (
        <div className="absolute right-0 mt-2 w-48 !bg-white border !border-gray-300 rounded shadow-lg p-4 !z-50">
          <label className="block text-sm !text-gray-700 mb-2">
            {i18n.translate("volume")}
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={muted ? 0 : Math.round(volume * 100)}
            onChange={(e) => handleVolumeChange(Number(e.target.value))}
            className="w-full !accent-green-700"
          />
          <div className="text-sm !text-gray-600 mt-2 text-center">
            {muted ? "0%" : `${Math.round(volume * 100)}%`}
          </div>

          {user?.id && (
            <button
              onClick={() => handleSave()}
              title={i18n.translate("saveVolumeTitle")}
              className="mt-3 w-full px-3 py-1 rounded !bg-green-700 !text-white hover:!bg-green-800 transition"
            >
              {i18n.translate("savePermanently")}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default VolumeSettings;
