import CardFront from "./card-front.jsx";

function BottomCard({ card, packLength }) {
  return <CardFront card={card} packLength={packLength} isBottomCard={true} />;
}

export default BottomCard;