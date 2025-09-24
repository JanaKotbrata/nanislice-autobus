import { useContext } from "react";
import Avatar from "../user/avatar.jsx";
import LanguageContext from "../../../context/language.js";
import {
  Roles,
  CREATOR,
} from "../../../../../shared/constants/game-constants.json";

function Member({ children, picture, isCreator, isMyself, role }) {
  const i18n = useContext(LanguageContext);
  const label =
    role || (isCreator ? i18n.translate(CREATOR) : i18n.translate(Roles.PLEB));
  return (
    <div className="flex justify-between items-center h-16 p-4 my-6  rounded-lg border border-gray-100 shadow-md flex-grow">
      <div className="flex items-center">
        <Avatar picture={picture} isMyself={isMyself} size={"h-12 w-12"} />
        <div className="sm:ml-2">
          <div className="text-sm font-semibold text-gray-600">{children}</div>
          <div className="text-sm font-light text-gray-500">{label}</div>
        </div>
      </div>
    </div>
  );
}

export default Member;
