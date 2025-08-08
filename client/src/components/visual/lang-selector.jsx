import React, { useState, useContext, useRef } from "react";
import { FaFlag } from "react-icons/fa";
import LanguageContext from "../../context/language.js";

function LangSelector({ size }) {
  const i18n = useContext(LanguageContext);
  const languageContext = useContext(LanguageContext);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  function handleLanguageChange(langCode) {
    languageContext.setContextLanguage(langCode);
    setShowMenu(false);
  }

  return (
    <div className="relative flex justify-end mb-3" ref={menuRef}>
      <FaFlag
        className="hover:!bg-green-700 cursor-pointer"
        title={i18n.translate("changeLanguage")}
        onClick={() => setShowMenu((prev) => !prev)}
        size={size || 19}
      />
      {showMenu && (
        <ul className="absolute top-7 right-0 !bg-gray-700 border !border-gray-300 rounded shadow-md z-10 text-sm">
          {languageContext.languages.map((lang) => (
            <li
              key={lang.code}
              className={`px-4 py-2 cursor-pointer hover:!bg-green-100 hover:!text-gray-900 ${
                languageContext.language === lang.code ? "font-bold" : ""
              }`}
              onClick={() => handleLanguageChange(lang.code)}
            >
              {lang.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default LangSelector;
