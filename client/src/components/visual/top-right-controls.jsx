import React from "react";
import VolumeSettings from "./volume-settings.jsx";
import LangSelector from "./lang-selector.jsx";
import LogOut from "./login/log-out.jsx";

/**
 * TopRightControls - reusable wrapper for icons in the top right corner
 * Use in lobby, start-game, about, users, etc.
 * Props:
 *   - showVolume (bool, default true)
 *   - showLang (bool, default true)
 *   - showLogout (bool, default true)
 */
export default function TopRightControls({
  showVolume = true,
  showLang = true,
  showLogOut = true,
}) {
  return (
    <div
      className={`fixed top-6 right-8 z-50 flex items-center gap-4 px-4`}
      style={{ minHeight: 48 }}
    >
      {showVolume && (
        <div className="pt-2">
          <VolumeSettings size={32} />
        </div>
      )}
      {showLang && (
        <div className="pt-2">
          <LangSelector size={32} />
        </div>
      )}
      {showLogOut && <LogOut />}
    </div>
  );
}
