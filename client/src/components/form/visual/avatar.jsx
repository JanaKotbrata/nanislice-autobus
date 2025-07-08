import { getAvatar } from "../../../services/user-service.jsx";
import { FaPencilAlt, FaSignInAlt } from "react-icons/fa";
import React from "react";

function Avatar({
  picture,
  user,
  isMyself = false,
  gameCode,
  size = "w-24 h-24",
  isInGame = false,
}) {
  const handleClick = () => {
    //navigate("/profile");
    window.open("/profile", "_blank");
  };
  const avatarUri = user ? getAvatar(user.id, gameCode) : picture;
  if (isMyself) {
    return (
      <label className="cursor-pointer relative group" onClick={handleClick}>
        <img
          src={avatarUri}
          alt={"upravit profil"}
          className={`${size} rounded-full object-cover shadow-md ${user ? "border-2 border-cyan-300/50 mb-4" : ""}`}
        />

        <div className="absolute inset-0 bg-gray-900/20 rounded-full flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition">
          {!isInGame && <>Upravit profil&nbsp;</>}
          <FaSignInAlt />
        </div>

        {!isInGame && (
          <div
            className={`absolute top-0 right-0 ${user ? "bg-cyan-300/50 p-1" : ""} rounded-sm text-xs text-white`}
          >
            <FaPencilAlt />
          </div>
        )}
      </label>
    );
  } else {
    return (
      <img
        src={avatarUri}
        alt={isMyself ? "upravit profil" : "avatar"}
        className={`${size} rounded-full object-cover shadow-md ${user && "border-2 border-cyan-300/50 mb-4"}`}
      />
    );
  }
}

export default Avatar;
