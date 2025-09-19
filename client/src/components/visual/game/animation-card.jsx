import React, { useLayoutEffect } from "react";
import { CardBgClasses } from "../../../constants/game.js";
import { Bg } from "../../../../../shared/constants/game-constants.json";
function AnimationCard({
  x,
  y,
  startX = 0,
  startY = 0,
  duration = 1,
  rotateTo = 0,
  bg,
  style = "",
}) {
  const [targetCoords, setTargetCoords] = React.useState({
    x: startX,
    y: startY,
    rotate: 0,
  });

  useLayoutEffect(() => {
    setTargetCoords({ x: x, y: y, rotate: rotateTo });
  }, []);

  let backgroundColor;
  if (bg) {
    backgroundColor = bg === Bg.RED ? CardBgClasses.RED : CardBgClasses.BLUE;
  } else {
    backgroundColor =
      Math.random() < 0.5 ? CardBgClasses.RED : CardBgClasses.BLUE;
  }

  return (
    <div
      className={`w-11 h-16 sm:w-14 sm:h-22 md:w-16 md:h-24 rounded-md shadow-md absolute z-50 border-2 ${backgroundColor} !bg-white ${style}`}
      style={{
        top: targetCoords.y,
        left: targetCoords.x,
        transform: `rotate(${targetCoords.rotate}deg)`,
        transition: `all ${duration}s ease-in-out`,
        position: "absolute",
        zIndex: 50,
      }}
    />
  );
}

export default AnimationCard;
