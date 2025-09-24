import React, { useLayoutEffect, useContext } from "react";
import CardStyleContext from "../../../context/card-style-context.js";

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
  const { getCardBgClass } = useContext(CardStyleContext);
  const [targetCoords, setTargetCoords] = React.useState({
    x: startX,
    y: startY,
    rotate: 0,
  });

  useLayoutEffect(() => {
    setTargetCoords({ x: x, y: y, rotate: rotateTo });
  }, []);

  const backgroundColor = getCardBgClass(bg);

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
