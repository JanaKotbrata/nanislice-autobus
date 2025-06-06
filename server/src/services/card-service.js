const {suits, RANK_CARD_ORDER:ranks, joker} = require("../utils/game-constants");
// This service provides functions to create, shuffle, and deal cards in a card game.

/** * Deals a specified number of cards from the deck.
 * @param deck - The current deck of cards.
 * @param cardNumber - The number of cards to deal.
 * @return {Array} An array containing the remaining deck and the dealt cards.
 * @example
 * const deck = getCardDeck();
 * const [remainingDeck, dealtCards] = dealCards(deck, 5);
 * @description This function modifies the original deck by removing the dealt cards.
 */
function dealCards(deck, cardNumber) {
    const newDeck = [...deck];
    const pack = newDeck.splice(-cardNumber);
    return [newDeck, pack]
}

function dealCardPerPlayer(deck, playerList, handNumber = 5, busNumber = 10) {
    let cacheDeck = [...deck];
    let game = [];
    for (let player of playerList) {
        //deal hand
        let [newDeck, hand] = dealCards(cacheDeck, handNumber);
        //deal bus
        let [finalDeck, bus] = dealCards(newDeck, busNumber);
        cacheDeck = finalDeck;
        game.push({...player, hand, bus, busStop: [[], [], [], []],isCardDrawed: true});
    }
    return [cacheDeck, game];
}

function getCardDeck(i = 0) {
    const pack = [];
    for (const suit of suits) {
        for (const rank of ranks) {
            pack.push({i, rank, suit});
            i++;
        }
    }
    pack.push({i: i + 1, rank: joker, suit: "🃏"});
    pack.push({i: i + 2, rank: joker, suit: "🃏"});
    return pack;
}

function shuffleDeck(deck) {
    let shuffledDeck = [...deck];
    for (let i = deck.length - 1; i > 0; i--) {
        const randomIndex = Math.floor(Math.random() * (i + 1));

        const temp = shuffledDeck[i];
        shuffledDeck[i] = shuffledDeck[randomIndex];
        shuffledDeck[randomIndex] = temp;
    }
    return shuffledDeck;
}
function initDeck(gamePlayers) {
    let gamePack = getCardDeck();
    const lastIndex = gamePack[gamePack.length - 1].i;
    let deck = gamePack.concat(getCardDeck(lastIndex));
    let multiplier = 1;
    const basePlayers = 5;

    // Dynamické násobení balíčku
    while (gamePlayers.length > basePlayers * multiplier) {
        const lastIndex = deck[deck.length - 1].i;
        deck = deck.concat(getCardDeck(lastIndex));
        multiplier *= 2;
    }
    return shuffleDeck(deck);
}

function getCardIndex(card, pack, error) {
  const index = pack.findIndex((c) => c.i === card.i);
  if( index === -1) {
    throw new error({card,pack});
  }else{
    return index;
  }

}

module.exports = {shuffleDeck, initDeck, dealCardPerPlayer, getCardIndex}