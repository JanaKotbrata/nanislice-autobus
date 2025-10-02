import { useContext, useEffect, useState } from "react";
import ProgressBar from "../components/visual/user/profile-progress-bar.jsx";
import ProfileLangSelector from "../components/visual/profile-lang-selector.jsx";
import { updateUserData } from "../services/user-service.js";
import { getAvatar } from "../services/user-service.js";
import UserContext from "../context/user.js";
import { FaPencilAlt } from "react-icons/fa";
import LanguageContext from "../context/language.js";
import PageContainer from "../components/visual/page-container.jsx";
import CardStyleSelector from "../components/visual/user/card-style-selector.jsx";
import GameboardColorPicker from "../components/visual/user/gameboard-color-picker.jsx";
import {
  Roles,
  DEFAULT_NAME,
} from "../../../shared/constants/game-constants.json";

function Profile() {
  const i18n = useContext(LanguageContext);
  const userContext = useContext(UserContext);
  const [name, setName] = useState(
    userContext?.user?.name || i18n.translate(DEFAULT_NAME),
  );
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const level = userContext.user.level ?? 1;
  const xp = userContext.user.xp ?? 0;

  const [preferLang, setPreferLang] = useState(!!userContext?.user?.language);
  const [selectedLang, setSelectedLang] = useState(
    userContext?.user?.language || "",
  );
  const languageContext = useContext(LanguageContext);
  const email = userContext.user.email || "";
  const role = userContext.user.role || i18n.translate(Roles.PLEB);
  const avatar = getAvatar(userContext.user.id, userContext.user.sys.rev);

  // avatar
  useEffect(() => {
    if (!selectedFile) return;
    setIsSubmitting(true);
    updateUserData(userContext, "picture", selectedFile, () =>
      setSelectedFile(null),
    ).finally(() => setIsSubmitting(false));
  }, [selectedFile]);

  // Handler for avatar change
  function handleAvatarChange(e) {
    const file = e.target.files[0];
    if (file) setSelectedFile(file);
  }

  return (
    <PageContainer header={i18n.translate("profileTitle")}>
      <div className="w-full flex flex-col items-center gap-6 px-10 pt-8">
        <label className="cursor-pointer relative group">
          <img
            src={avatar}
            alt={name}
            className="w-24 h-24 rounded-full object-cover border-4 border-gray-600 shadow-md"
          />
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition">
            <FaPencilAlt className="mr-2 w-4 h-4" /> {i18n.translate("change")}
          </div>
          <div className="absolute top-0 right-0 bg-black/70 p-1 rounded-bl-lg text-xs text-white">
            <FaPencilAlt className="w-3 h-3" />
          </div>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </label>
        <div className="text-center space-y-1 w-full relative">
          <div className="relative">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-2xl font-bold text-center bg-transparent border-b border-gray-600 focus:outline-none focus:border-white w-full hover:bg-gray-800 transition-colors duration-200 rounded-lg"
            />
            <span className="absolute right-0 top-1/2 -translate-y-1/2 text-sm text-gray-400">
              <FaPencilAlt className="w-4 h-4" />
            </span>
          </div>
          <p className="text-sm text-gray-400">{email}</p>
          <div className="flex justify-center gap-6 text-sm text-gray-400">
            <div className="w-24 text-right">
              <span>{i18n.translate("role")}</span>
            </div>
            <div className="font-semibold text-white w-24 text-left">
              <span>{role}</span>
            </div>
          </div>
          <div className="flex justify-center gap-6 text-sm text-gray-400">
            <div className="w-24 text-right">
              <span>{i18n.translate("level")}</span>
            </div>
            <div className="font-semibold text-white w-24 text-left">
              <span>{level}</span>
            </div>
          </div>
        </div>
        <ProgressBar level={level} xp={xp} i18n={i18n} />
        <div className="flex flex-col items-center justify-center gap-3 mb-2 w-full max-w-2xl mx-auto">
          <ProfileLangSelector
            preferLang={preferLang}
            setPreferLang={setPreferLang}
            selectedLang={selectedLang}
            setSelectedLang={setSelectedLang}
            languageContext={languageContext}
            i18n={i18n}
            userContext={userContext}
            isSubmitting={isSubmitting}
            setIsSubmitting={setIsSubmitting}
          />
          <CardStyleSelector />
          <GameboardColorPicker />
        </div>
        {isSubmitting && (
          <p className="text-sm text-gray-500">{i18n.translate("saving")}</p>
        )}
      </div>
    </PageContainer>
  );
}
export default Profile;
