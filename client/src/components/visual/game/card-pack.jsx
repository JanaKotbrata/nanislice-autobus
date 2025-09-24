import { motion } from "framer-motion";
import { useContext } from "react";
import {
  Bg,
  SlotTargets,
} from "../../../../../shared/constants/game-constants.json";
import CardStyleContext from "../../../context/card-style-context.js";

function CardPack({
  id = SlotTargets.CARDPACK_DECK,
  text,
  onDrawCard,
  isDrawedCard,
  bg = Bg.BLUE,
  count = 0,
  isInteractive = false,
}) {
  const { getCardBgClass } = useContext(CardStyleContext);
  const bgClass = getCardBgClass(bg);

  const cardOffsets = Array.from({ length: count }, (_, i) => i);

  const mainCardVariants = {
    rest: { y: 0, rotate: 0 },
    hover: { y: -10, rotate: -2 },
  };

  const shadowCardVariants = {
    rest: { y: 0, opacity: 0, scale: 0.95, rotate: 0 },
    hover: (i) => ({
      y: (i + 1) * 6,
      opacity: 1,
      scale: 0.98,
      rotate: (i + 1) * 1.5,
    }),
  };

  return (
    <motion.div
      id={id}
      className="relative group w-fit"
      initial="rest"
      animate="rest"
      whileHover={isInteractive ? "hover" : undefined}
    >
      {/* Main card */}
      <motion.button
        className={`w-11 h-16 sm:w-14 sm:h-22 md:w-16 md:h-24 ${bgClass} !bg-white flex items-center justify-center rounded-md shadow-md 
              ${onDrawCard ? "hover:bg-gray-700 cursor-pointer" : "cursor-default"} 
          ${isDrawedCard ? "animate-[pulse_2s_ease-in-out_infinite]" : ""} z-30`}
        {...(onDrawCard ? { onClick: onDrawCard } : {})}
        variants={isInteractive ? mainCardVariants : undefined}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        style={{ position: "relative" }}
      >
        <span className="card-sign-icon aard-sign" />
        <span className="card-sign-icon igni-sign" />
        <span className="card-sign-icon quen-sign" />
        <span className="card-sign-icon axie-sign" />
        {text && (
          <p className={`!bg-gray-600/50 rounded-md border-1`}>{text}</p>
        )}
      </motion.button>

      {isInteractive &&
        cardOffsets.map((i) => (
          <motion.div
            key={i}
            className={`w-11 h-16 sm:w-14 sm:h-22 md:w-16 md:h-24 ${bgClass} !bg-white rounded-md shadow-md absolute top-0 left-0 pointer-events-none`}
            custom={i}
            variants={shadowCardVariants}
            transition={{ delay: i * 0.03, duration: 0.3 }}
            style={{ zIndex: 20 - i }}
          />
        ))}
      <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 text-white text-sm hidden group-hover:block pointer-events-none z-40">
        {count}
      </div>
    </motion.div>
  );
}

export default CardPack;
