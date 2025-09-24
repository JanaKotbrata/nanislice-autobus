import { getAvatar } from "../../../services/user-service.js";
import { FaPencilAlt, FaSignInAlt } from "react-icons/fa";
import { useContext } from "react";
import LanguageContext from "../../../context/language.js";

function Avatar({
  picture,
  user,
  isMyself = false,
  gameCode,
  size = "w-24 h-24",
  isInGame = false,
}) {
  const i18n = useContext(LanguageContext);
  const avatarUri = user ? getAvatar(user.id, gameCode) : picture;
  function handleClick() {
    window.open("/profile", "_blank");
  }
  if (isMyself) {
    return (
      <label className="cursor-pointer relative group" onClick={handleClick}>
        <img
          src={avatarUri}
          alt={i18n.translate("editProfile")}
          className={`${size} rounded-full object-cover shadow-md ${user ? "border-2 border-cyan-300/50 mb-4" : ""}`}
        />

        <div className="absolute inset-0 bg-gray-900/20 rounded-full flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition">
          {!isInGame && <>{i18n.translate("editProfile")}&nbsp;</>}
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
        alt={"avatar"}
        className={`${size} rounded-full object-cover shadow-md ${user && "border-2 border-cyan-300/50 mb-4"}`}
      />
    );
  }
}

export default Avatar;
