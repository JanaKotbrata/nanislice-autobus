import React, { useLayoutEffect } from "react";
const BgColors = {
  RED: "back-card-red",
  BLUE: "back-card-blue",
};
function AnimationCard({
  x,
  y,
  startX = 0,
  startY = 0,
  duration = 1,
  bg,
  style = "",
}) {
  const [targetCoords, setTargetCoords] = React.useState({
    x: startX,
    y: startY,
  });

  useLayoutEffect(() => {
    setTargetCoords({ x: x, y: y });
  }, []);

  let backgroundColor;
  if (bg) {
    backgroundColor = bg === "red" ? BgColors.RED : BgColors.BLUE;
  } else {
    backgroundColor = Math.random() < 0.5 ? BgColors.RED : BgColors.BLUE;
  }

  return (
    <div
      className={`w-16 h-24 rounded-md shadow-md absolute z-50 border-2 ${backgroundColor} !bg-white ${style}`}
      style={{
        top: targetCoords.y,
        left: targetCoords.x,
        transition: `all ${duration}s ease-in-out`,
        position: "absolute",
      }}
    />
  );
}

export default AnimationCard;
