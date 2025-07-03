const RANK_CARD_ORDER = require("../../../shared/constants/rank-card-order.json");
const suits = ["♥", "♦", "♠", "♣"];

const joker = "Jr"
const States = {
    INITIAL: "initial",
    ACTIVE: "active",
    FINISHED: "finished",
    CLOSED: "closed",
}
module.exports = {
    RANK_CARD_ORDER,
    joker,
    suits,
    States
}