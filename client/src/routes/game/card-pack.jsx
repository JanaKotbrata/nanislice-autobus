function CardPack({ text, onDrawCard, isDrawedCard }) {
  return (
    <button
      className={`w-16 h-24 !bg-gray-900 text-white flex items-center justify-center rounded-md shadow-md transition  ${
        onDrawCard ? "hover:bg-gray-700 cursor-pointer" : "cursor-default"
      } ${isDrawedCard ? "animate-[pulse_2s_ease-in-out_infinite]" : ""}`}
      {...(onDrawCard ? { onClick: onDrawCard } : {})}
    >
      {text}
    </button>
  );
}

export default CardPack;
