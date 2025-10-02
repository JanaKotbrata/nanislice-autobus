import CardBack from "./card/card-back/card-back.jsx";
import { FaLock, FaLockOpen } from "react-icons/fa";
import { useContext, useEffect, useState } from "react";
import LanguageContext from "../../../context/language.js";
import { getUnlockedStyleIfAny } from "../../../services/level-service.js";
import CardStyleContext from "../../../context/card-style-context.js";
import { Bg } from "../../../../../shared/constants/game-constants.json";

function LevelUnlock({ xpObj }) {
  const i18n = useContext(LanguageContext);
  const { availableStyles } = useContext(CardStyleContext);

  const [showLock, setShowLock] = useState(true);
  const [showUnlockedLock, setShowUnlockedLock] = useState(false);
  const [showCard, setShowCard] = useState(true);

  const unlockedStyle = getUnlockedStyleIfAny(xpObj, availableStyles);

  useEffect(() => {
    if (unlockedStyle) {
      setShowLock(true);
      setShowUnlockedLock(false);
      setShowCard(true);
      const t1 = setTimeout(() => {
        setShowLock(false);
        setShowUnlockedLock(true);
      }, 700);
      const t2 = setTimeout(() => setShowUnlockedLock(false), 2700);
      const t3 = setTimeout(() => setShowCard(false), 10000);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, [unlockedStyle]);

  if (!(unlockedStyle && showCard)) {
    return null;
  }
  return (
    <div className="flex flex-col items-center my-4 relative shake">
      <div className="relative" style={{ minWidth: 64, minHeight: 96 }}>
        <CardBack
          card={{ bg: Bg.RED }}
          forceStyle={unlockedStyle.code}
          animated={true}
        />
        {(showLock || showUnlockedLock) && (
          <span
            className="absolute inset-0 flex items-center justify-center z-10"
            style={{ pointerEvents: "none" }}
          >
            <span className={"locking " + (showLock ? "animate" : undefined)}>
              {showLock ? (
                <FaLock style={{ fontSize: 36, color: "#555" }} />
              ) : (
                <FaLockOpen style={{ fontSize: 36, color: "#555" }} />
              )}
            </span>
          </span>
        )}
      </div>
      <div className="text-white text-base mt-2">
        {i18n.translate(`cardStyle.${unlockedStyle.code}`) +
          " - " +
          i18n.translate("newStyleUnlocked")}
      </div>
    </div>
  );
}
export default LevelUnlock;
