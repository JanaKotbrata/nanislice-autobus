import { useState, useContext, useRef, useEffect } from "react";
import LanguageContext from "../../context/language.js";
import { FaLanguage } from "react-icons/fa6";

function LangSelector({ size }) {
  const i18n = useContext(LanguageContext);
  const languageContext = useContext(LanguageContext);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleLanguageChange(langCode) {
    languageContext.setContextLanguage(langCode);
    setShowMenu(false);
  }

  return (
    <div className="relative flex justify-end mb-3" ref={menuRef}>
      <FaLanguage
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
