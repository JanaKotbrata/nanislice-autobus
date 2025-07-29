import React, { useContext } from "react";
import Avatar from "./avatar.jsx";
import LanguageContext from "../../../context/language.js";

function Member({ children, picture, isCreator, isMyself, role }) {
  const i18n = useContext(LanguageContext);
  const label =
    role || (isCreator ? i18n.translate("creator") : i18n.translate("pleb"));

  return (
    <div className="flex justify-between items-center h-16 p-4 my-6  rounded-lg border border-gray-100 shadow-md flex-grow">
      <div className="flex items-center">
        <Avatar picture={picture} isMyself={isMyself} size={"h-12 w-12"} />
        <div className="ml-2">
          <div className="text-sm font-semibold text-gray-600">{children}</div>
          <div className="text-sm font-light text-gray-500">{label}</div>
        </div>
      </div>
    </div>
  );
}

export default Member;
