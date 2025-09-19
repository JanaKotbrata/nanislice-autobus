import React from "react";
import { CardBgClasses } from "../../../constants/game.js"

export default function CardBack({ card }) {
  const bg = card?.bg;
  const bgClass = CardBgClasses[bg?.toUpperCase()] || CardBgClasses.RED;
  return (
    <div className={`w-11 h-16 sm:w-14 sm:h-22 md:w-16 md:h-24 ${bgClass} !bg-white flex items-center justify-center rounded-md shadow-md`} />
  );
}