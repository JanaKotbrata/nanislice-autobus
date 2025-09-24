import "../../../styles/witcher.css";
import { useContext } from "react";
import CardStyleContext from "../../../context/card-style-context.js";

// TODO - vytvorit specificke card back pro typy karet. Witcher card v sobe bude mit znameni, klasicka karta nebude mit nic
export default function CardBack({ card, forceStyle }) {
  const { getCardBgClass } = useContext(CardStyleContext);
  const bg = card?.bg;

  const bgClass = getCardBgClass(bg, forceStyle);

  return (
    <div
      className={`w-11 h-16 sm:w-14 sm:h-22 md:w-16 md:h-24 ${bgClass} flex items-center justify-center rounded-md shadow-md`}
    >
      <div
        className={"p-4"}
        style={{ width: "100%", height: "100%", position: "relative" }}
      >
        <span className="card-sign-icon aard-sign" />
        <span className="card-sign-icon igni-sign" />
        <span className="card-sign-icon quen-sign" />
        <span className="card-sign-icon axie-sign" />
      </div>
    </div>
  );
}
