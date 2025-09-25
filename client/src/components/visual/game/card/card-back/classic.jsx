import { useContext } from "react";
import CardStyleContext from "../../../../../context/card-style-context.js";

function Classic({ card, forceStyle }) {
  const { getCardBgClass } = useContext(CardStyleContext);
  const bg = card?.bg;

  const bgClass = getCardBgClass(bg, forceStyle);

  return (
    <div
      className={`w-11 h-16 sm:w-14 sm:h-22 md:w-16 md:h-24 ${bgClass} flex items-center justify-center rounded-md shadow-md`}
    ></div>
  );
}
export default Classic;
