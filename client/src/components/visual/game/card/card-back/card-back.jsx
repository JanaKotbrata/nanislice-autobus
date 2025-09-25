import "../../../../../styles/witcher.css";
import { useContext } from "react";
import CardStyleContext from "../../../../../context/card-style-context.js";
import Witcher from "./witcher.jsx";
import Classic from "./classic.jsx";

export default function CardBack({ card, forceStyle }) {
  const { cardStyle } = useContext(CardStyleContext);
  const style = forceStyle || cardStyle;

  const styleComponentMap = {
    witcher: Witcher,
    classic: Classic,
  };

  const CardComponent = styleComponentMap[style] || Classic;
  return <CardComponent card={card} forceStyle={forceStyle} />;
}
