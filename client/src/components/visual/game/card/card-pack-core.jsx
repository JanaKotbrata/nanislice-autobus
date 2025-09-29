import { motion } from "framer-motion";
import CardBack from "./card-back/card-back.jsx";

// Core CardPack component with shared logic
function CardPackCore({
  id = "card-pack",
  bg,
  count = 0,
  motionProps = null,
  children,
}) {
  const Container = motionProps ? motion.div : "div";
  const containerProps = motionProps ? { ...motionProps, id } : { id };

  return (
    <Container className="relative group w-fit" {...containerProps}>
      {children}
      <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 text-white text-sm hidden group-hover:block pointer-events-none z-40">
        {count}
      </div>
    </Container>
  );
}

export { CardPackCore };