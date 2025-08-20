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
  const [lang, setLang] = React.useState(() => resolveInitialLangCode());

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
