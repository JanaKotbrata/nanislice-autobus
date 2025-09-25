function CardCount({ count, show, style = {} }) {
  if (typeof count !== "number") return null;
  return (
    <div
      className={`absolute top-1 left-1 text-xs py-0.5 bg-red-500 text-white px-1 rounded transition-opacity duration-200 z-30 ${
        show
          ? "opacity-100 visible"
          : "opacity-0 invisible group-hover:opacity-100 group-hover:visible"
      }`}
      style={style}
    >
      {count}
    </div>
  );
}

export default CardCount;
