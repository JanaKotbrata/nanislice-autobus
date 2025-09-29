import { useLayoutEffect, useState } from "react";
import CardBack from "./card-back/card-back.jsx";

function AnimationCard({
  x,
  y,
  startX = 0,
  startY = 0,
  duration = 1,
  rotateTo = 0,
  bg,
}) {
  const [targetCoords, setTargetCoords] = useState({
    x: startX,
    y: startY,
    rotate: 0,
  });

  useLayoutEffect(() => {
    setTargetCoords({ x: x, y: y, rotate: rotateTo });
  }, []);

  return (
    <div
      className={`absolute z-50`}
      style={{
        top: targetCoords.y,
        left: targetCoords.x,
        transform: `rotate(${targetCoords.rotate}deg)`,
        transition: `all ${duration}s ease-in-out`,
        position: "absolute",
        zIndex: 50,
      }}
    >
      <CardBack card={{ bg }} />
    </div>
  );
}

export default AnimationCard;
