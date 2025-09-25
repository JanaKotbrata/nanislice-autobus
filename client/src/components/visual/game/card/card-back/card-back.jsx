import { useContext } from "react";
import CardStyleContext from "../../../../../context/card-style-context.js";

import Witcher from "./witcher.jsx";
import Classic from "./classic.jsx";
import HarryPotter from "./harrypotter.jsx";
import Flower from "./flower.jsx";
import Deadpool from "./deadpool.jsx";
import FlowerDark from "./flower-dark.jsx";

export default function CardBack({ card, forceStyle }) {
  const { cardStyle } = useContext(CardStyleContext);
  const style = forceStyle || cardStyle;

  const styleComponentMap = {
    witcher: Witcher,
    classic: Classic,
    harrypotter: HarryPotter,
    flower: Flower,
    flowerdark: FlowerDark,
    deadpool: Deadpool,
  };

  const CardComponent = styleComponentMap[style] || Classic;
  return (
    <CardComponent
      card={card}
      forceStyle={forceStyle}
      size={"w-11 h-16 sm:w-14 sm:h-22 md:w-16 md:h-24"}
    />
  );
}
