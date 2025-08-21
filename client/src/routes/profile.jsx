import React, { useContext, useEffect, useState } from "react";
import { getAvatar } from "../services/user-service.jsx";
import UserContext from "../context/user.js";
import { FaPencilAlt } from "react-icons/fa";
import LogOut from "../components/visual/login/log-out.jsx";
import LanguageContext from "../context/language.js";
import LangSelector from "../components/visual/lang-selector.jsx";

function Profile() {
  const i18n = useContext(LanguageContext);
  const userContext = React.useContext(UserContext);
  const [name, setName] = useState(
    userContext?.user?.name || i18n.translate("nemo"),
  );
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const level = userContext.user.level ?? 1;
  const xp = userContext.user.xp ?? 0;
  const xpPercent = Math.min((xp / 1000) * 100, 100);
  const email = userContext.user.email || "";
  const role = userContext.user.role || i18n.translate("pleb");
  const avatar = getAvatar(userContext.user.id, userContext.user.sys.rev);
  const [preferLang, setPreferLang] = useState(!!userContext?.user?.language);
  const [selectedLang, setSelectedLang] = useState(
    userContext?.user?.language || null,
  );
  const languageContext = useContext(LanguageContext);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (name && name !== userContext.user.name) {
        const formData = new FormData();
        formData.append("name", name);

        setIsSubmitting(true);
        userContext
          .update(formData)
          .then(() => {})
          .finally(() => setIsSubmitting(false));
      }
    }, 600);

    return () => clearTimeout(timeout);
  }, [name]);

  useEffect(() => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("picture", selectedFile);

    setIsSubmitting(true);
    userContext
      .update(formData)
      .then(() => {
        setSelectedFile(null);
      })
      .finally(() => setIsSubmitting(false));
  }, [selectedFile]);

  useEffect(() => {
    if (!preferLang) {
      if (userContext.user.language !== null) {
        const formData = new FormData();
        formData.append("language", null);

        setIsSubmitting(true);
        userContext.update(formData).finally(() => setIsSubmitting(false));
      }
      setSelectedLang(null);
      return;
    }

    if (selectedLang && selectedLang !== userContext.user.language) {
      const formData = new FormData();
      formData.append("language", selectedLang);

      setIsSubmitting(true);
      userContext
        .update(formData)
        .then(() => {
          setSelectedFile(null);
        })
        .finally(() => {
          setIsSubmitting(false);
          languageContext.setContextLanguage(selectedLang);
        });
    }
  }, [preferLang, selectedLang, userContext.user.language]);

  function handleAvatarChange(e) {
    const file = e.target.files[0];
    if (file) setSelectedFile(file);
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4">
      <div className="relative z-10 w-full max-w-2xl">
        <div className="flex flex-row gap-6 justify-end">
          <div className="p-2">
            <LangSelector size={32} />
          </div>
          <LogOut />
        </div>
        <div className="bg-gray-950/90 border border-black rounded-2xl shadow-xl p-8 flex flex-col items-center gap-6 text-white">
          <label className="cursor-pointer relative group">
            <img
              src={avatar}
              alt={name}
              className="w-24 h-24 rounded-full object-cover border-4 border-gray-600 shadow-md"
            />
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition">
              <FaPencilAlt className="mr-2 w-4 h-4" />{" "}
              {i18n.translate("change")}
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
                className="text-2xl font-bold text-center bg-transparent border-b border-gray-600
             focus:outline-none focus:border-white w-full
             hover:bg-gray-800 transition-colors duration-200 rounded-lg"
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

          <div className="w-full text-left">
            <p className="text-sm text-gray-300 mb-1">
              {i18n.translate("earnedXp")}
            </p>
            <div className="w-full bg-gray-700 h-4 rounded-full overflow-hidden relative">
              <div
                className="bg-green-500 h-full transition-all duration-300"
                style={{ width: `${xpPercent}%` }}
              />
              <span
                className="absolute top-1/2 -translate-y-1/2 text-sm"
                style={{ left: `calc(${xpPercent}% - 10px)` }}
              >
                🚌
              </span>
            </div>
            <p className="text-xs text-gray-400 text-right mt-1">{xp} XP</p>
          </div>

          <label className="inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={preferLang}
              onChange={(e) => setPreferLang(e.target.checked)}
            />
            <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600"></div>
            <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
              {selectedLang
                ? i18n.translate("preferredLanguage") + " " + selectedLang
                : i18n.translate("setPrefLang")}
            </span>
          </label>

          {preferLang && (
            <select
              value={selectedLang || ""}
              onChange={(e) => setSelectedLang(e.target.value)}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            >
              <option value="">🌎</option>
              {languageContext.languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          )}

          {isSubmitting && (
            <p className="text-sm text-gray-500">{i18n.translate("saving")}</p>
          )}
        </div>
      </div>
    </section>
  );
}

export default Profile;
