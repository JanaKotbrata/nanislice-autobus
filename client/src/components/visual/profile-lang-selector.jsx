import { useEffect } from "react";
import { updateUserData } from "../../services/user-service.js";

function ProfileLangSelector({
  preferLang,
  setPreferLang,
  selectedLang,
  setSelectedLang,
  languageContext,
  i18n,
  userContext,
}) {
  useEffect(() => {
    if (!preferLang) {
      if (userContext.user.language !== null) {
        updateUserData(userContext, "language", null);
      }
      setSelectedLang(null);
      return;
    }
    if (selectedLang && selectedLang !== userContext.user.language) {
      updateUserData(userContext, "language", selectedLang, () =>
        languageContext.setContextLanguage(selectedLang)
      );
    }
  }, [preferLang, selectedLang, userContext.user.language]);

  return (
  <div className="flex flex-col sm:flex-row items-center gap-3 justify-center w-full min-w-0">
  <label className="inline-flex items-center cursor-pointer w-full sm:w-auto">
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
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2 w-full max-w-xs min-w-0 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          style={{ minWidth: "120px" }}
        >
          <option value="">🌎</option>
          {languageContext.languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}

export default ProfileLangSelector;
