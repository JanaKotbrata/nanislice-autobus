const RANK_CARD_ORDER = [
    "A",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "J",
    "Q",
    "K",
];
const suits = ["♥", "♦", "♠", "♣"];

const joker = "Jr"
const States = {
    INITIAL: "initial",
    ACTIVE: "active",
    CLOSED: "closed",
}
module.exports = {
    RANK_CARD_ORDER,
    joker,
    suits,
    States
}