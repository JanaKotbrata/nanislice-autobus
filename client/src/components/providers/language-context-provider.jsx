import React, { useEffect } from "react";
import LanguageContext from "../../context/language.js";
import translations from "../../i18n/translations.json";
import UserContext from "../../context/user.js";
import { useAuth } from "../../context/auth-context.jsx";

function detectBrowserBaseLang() {
  const list = navigator.languages?.length
    ? navigator.languages
    : [navigator.language];
  const primary = (list?.[0] ?? "").toLowerCase();
  return primary.split("-")[0];
}

function resolveInitialLangCode(user) {
  const base = detectBrowserBaseLang();
  if (user && user.language) return user.language;
  if (base === "cs") return translations.languages[0].code;
  if (base === "sk") return translations.languages[2].code;
  return translations.languages[1].code;
}

function findTranslateKey(key, i18nData) {
  if (key.includes(".")) {
    const keys = key.split(".");
    return keys.reduce((acc, key) => {
      console.log(`Resolving key: ${key} in translations`, acc);
      return acc?.[key];
    }, i18nData.translations);
  }
  return i18nData.translations[key];
}

function LanguageContextProvider({ children }) {
  const { user } = useAuth();
  const [lang, setLang] = React.useState(() => resolveInitialLangCode(user));

  useEffect(() => {
    setLang(resolveInitialLangCode(user));
  }, [user]);

  function setContextLanguage(lang) {
    setLang(lang);
  }

  function translate(key) {
    const toTranslate = findTranslateKey(key, translations);
    //console.log(`Translating key: ${key} for language: ${lang}`, toTranslate);
    return toTranslate?.[lang] || toTranslate?.["cs"] || "Tohle neznam";
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
