import React, { useEffect, useRef, useState } from "react";
import CardAnimationContext from "../../context/card-animation.js";
import AnimationCard from "../visual/game/animation-card.jsx";

function SlotContextProvider({ children }) {
  const animationQueue = useRef([]);
  const [currentAnimation, setCurrentAnimation] = useState(null);
  const [animationTick, setAnimationTick] = useState(0);

  useEffect(() => {
    if (!currentAnimation && animationQueue.current.length > 0) {
      const next = animationQueue.current.shift();
      setCurrentAnimation(next);
      if (next.animationSoundCallback) {
        next.animationSoundCallback();
      }

      setTimeout(() => {
        if (next.animationCallback) {
          next.animationCallback();
        }
        setCurrentAnimation(null);
        setAnimationTick((tick) => tick + 1);
      }, next.duration);
    }
  }, [currentAnimation, animationTick]);

  function addAnimation(
    animation,
    duration,
    animationCallback,
    animationSoundCallback,
  ) {
    animationQueue.current.push({
      animation,
      duration,
      animationCallback,
      animationSoundCallback,
    });
  }

  function runAnimation() {
    setAnimationTick((tick) => tick + 1);
  }

  function addAndRunAnimation(
    animation,
    duration,
    animationCallback,
    animationSoundCallback,
  ) {
    addAnimation(
      animation,
      duration,
      animationCallback,
      animationSoundCallback,
    );
    runAnimation();
  }

  return (
    <CardAnimationContext.Provider
      value={{ addAnimation, runAnimation, addAndRunAnimation }}
    >
      {currentAnimation?.animation && (
        <AnimationCard
          x={currentAnimation.animation.left}
          y={currentAnimation.animation.top}
          startY={currentAnimation.animation.originTop}
          startX={currentAnimation.animation.originLeft}
          bg={currentAnimation.animation.bg}
          duration={currentAnimation.duration / 1000}
          rotateTo={currentAnimation.animation.rotateTo ?? 0}
        />
      )}
      {children}
    </CardAnimationContext.Provider>
  );
}
export default SlotContextProvider;
