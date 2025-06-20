function CardPack({ text, onDrawCard }) {
  return (
    <button
      className={`w-16 h-24 bg-gray-800 text-white flex items-center justify-center rounded-md shadow-md transition ${
        onDrawCard ? "hover:bg-gray-700 cursor-pointer" : "cursor-default"
      }`}
      {...(onDrawCard ? { onClick: onDrawCard } : {})}
    >
      {text}
    </button>
  );
}

export default CardPack;
