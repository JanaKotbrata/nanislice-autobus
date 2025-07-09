import { motion } from "framer-motion";

function CardPack({
  text,
  onDrawCard,
  isDrawedCard,
  bg = "blue",
  count = 0,
  isInteractive = false,
}) {
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
      className="relative group w-fit"
      initial="rest"
      animate="rest"
      whileHover={isInteractive ? "hover" : undefined}
    >
      {/* Hlavní karta */}
      <motion.button
        className={`w-16 h-24 back-card-${bg} !bg-white flex items-center justify-center rounded-md shadow-md 
              ${onDrawCard ? "hover:bg-gray-700 cursor-pointer" : "cursor-default"} 
          ${isDrawedCard ? "animate-[pulse_2s_ease-in-out_infinite]" : ""} z-30`}
        {...(onDrawCard ? { onClick: onDrawCard } : {})}
        variants={isInteractive ? mainCardVariants : undefined}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
      >
        {text}
      </motion.button>

      {/* Padací karty (jen pokud interaktivní) */}
      {isInteractive &&
        cardOffsets.map((i) => (
          <motion.div
            key={i}
            className={`w-16 h-24 back-card-${bg} !bg-white rounded-md shadow-md absolute top-0 left-0 pointer-events-none`}
            custom={i}
            variants={shadowCardVariants}
            transition={{ delay: i * 0.03, duration: 0.3 }}
            style={{ zIndex: 20 - i }}
          />
        ))}

      {/* Počet karet – zobrazí se při hoveru */}
      <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 text-white text-sm hidden group-hover:block pointer-events-none z-40">
        {count}
      </div>
    </motion.div>
  );
}

export default CardPack;
