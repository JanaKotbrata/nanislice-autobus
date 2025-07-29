import React from "react";
import LanguageContext from "../../context/language.js";
import translations from "../../i18n/translations.json";

function detectBrowserBaseLang() {
  const list = navigator.languages?.length
    ? navigator.languages
    : [navigator.language];
  const primary = (list?.[0] ?? "").toLowerCase();
  return primary.split("-")[0];
}

function resolveInitialLangCode() {
  const base = detectBrowserBaseLang();
  if (base === "cs") return translations.languages[0].code;
  if (base === "sk") return translations.languages[2].code;
  return translations.languages[1].code;
}

function LanguageContextProvider({ children }) {
  const [lang, setLang] = React.useState(() => resolveInitialLangCode());

  function setContextLanguage(lang) {
    setLang(lang);
  }

  function translate(key) {
    return (
      translations.translations[key]?.[lang] ||
      translations.translations[key]?.["cs"] ||
      "Tohle neznam"
    );
  }

  return (
    <LanguageContext.Provider
      value={{
        setContextLanguage,
        translate,
        languages: translations.languages,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export default LanguageContextProvider;
