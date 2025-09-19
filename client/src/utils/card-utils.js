export function isCardInSource(card, source) {
  return (source || []).flat().some((c) => c?.i === card.i);
}
