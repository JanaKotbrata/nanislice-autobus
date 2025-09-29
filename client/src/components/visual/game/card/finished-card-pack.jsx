import { motion } from "framer-motion";
import { CardPackCore } from "./card-pack-core.jsx";
import CardBack from "./card-back/card-back.jsx";
import {
  SlotTargets,
  Bg,
} from "../../../../../../shared/constants/game-constants.json";

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

function FinishedCardPack({
  id = SlotTargets.COMPLETED_CARD_LIST,
  bg = Bg.BLUE,
  count = 0,
}) {
  const cardOffsets = Array.from({ length: count }, (_, i) => i);

  return (
    <CardPackCore
      id={id}
      bg={bg}
      count={count}
      motionProps={{
        initial: "rest",
        animate: "rest",
        whileHover: "hover",
      }}
    >
      <motion.button
        className="hover:bg-gray-700 cursor-pointer z-30"
        variants={mainCardVariants}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        style={{ position: "relative", padding: 0 }}
      >
        <CardBack card={{ bg }} />
      </motion.button>

      {/* Shadow cards for animation */}
      {cardOffsets.map((i) => (
        <motion.div
          key={i}
          className="absolute top-0 left-0 pointer-events-none"
          custom={i}
          variants={shadowCardVariants}
          transition={{ delay: i * 0.03, duration: 0.3 }}
          style={{ zIndex: 20 - i }}
        >
          <CardBack card={{ bg }} animated={false} />
        </motion.div>
      ))}
    </CardPackCore>
  );
}

export default FinishedCardPack;
