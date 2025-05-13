function CardPack({ onDrawCard }) {
  return (
    <button
      className="w-16 h-24 bg-gray-800 text-white flex items-center justify-center rounded-md shadow-md hover:bg-gray-700 transition"
      onClick={onDrawCard}
    >
      Lízni kartu
    </button>
  );
}

export default CardPack;
