import "../../../../../styles/starwars.css";
import { useContext } from "react";
import CardStyleContext from "../../../../../context/card-style-context.js";

import { FaEmpire, FaRebel } from "react-icons/fa";

export default function StarWars({
  card,
  forceStyle,
  size = "w-11 h-16 sm:w-14 sm:h-22 md:w-16 md:h-24",
  animated = false,
}) {
  const { getCardBgClass } = useContext(CardStyleContext);
  const bg = card?.bg;
  const bgClass = getCardBgClass(bg, forceStyle);

  const isRed = bgClass.includes("red");
  const isBlue = bgClass.includes("blue");

  return (
    <div
      className={`${size} ${bgClass} rounded-xl shadow-lg starwars-card-back`}
    >
      <div className="starwars-content flex items-center justify-center w-full h-full relative">
        <span className={`starwars-logo`}>
          {isRed ? (
            <FaEmpire className="starwars-icon" title="Imperiálové" />
          ) : isBlue ? (
            <FaRebel className="starwars-icon" title="Rebelové" />
          ) : (
            <FaEmpire className="starwars-icon" title="StarWars" />
          )}
        </span>
        <span className={`lightsaber`}></span>
      </div>
    </div>
  );
}
