const {
  EMPTY_BUS_STOP,
  SUITS,
  RANK_CARD_ORDER: ranks,
  JOKER,
  MIN_PACK_IN_DECK,
  COUNT_OF_PLAYERS_FOR_EXTRA_PACK,
  PLAYERS_PER_EXTRA_PACK,
  Bg,
  JOKER_SUIT,
} = require("../../../shared/constants/game-constants");

/**
 * Card deck generator with unique index counter.
 * @class
 */
class CardDeckGenerator {
  constructor(startIndex = 0) {
    this.i = startIndex;
  }

  // Generates one deck with unique indices and background color
  generateCardDeck(bg = Bg.RED) {
    const pack = [];
    for (const suit of SUITS) {
      for (const rank of ranks) {
        pack.push({ i: this.i, rank, suit, bg });
        this.i++;
      }
    }
    pack.push({ i: this.i, rank: JOKER, suit: JOKER_SUIT, bg });
    this.i++;
    pack.push({ i: this.i, rank: JOKER, suit: JOKER_SUIT, bg });
    this.i++;
    return pack;
  }

  // Generates multiple decks with unique indices and alternating background color
  getDeckOfPacks(numberOfPacks) {
    const deck = [];
    for (let d = 0; d < numberOfPacks; d++) {
      const bg = d % 2 === 0 ? Bg.BLUE : Bg.RED;
      deck.push(...this.generateCardDeck(bg));
    }
    return deck;
  }
}

// Deals cardNumber cards from the deck, returns [remainingDeck, dealtCards]
/**
 * Deals a number of cards from the deck.
 * @param {Array} deck - The deck of cards
 * @param {number} cardNumber - Number of cards to deal
 * @returns {[Array, Array]} Remaining deck and dealt cards
 */
function dealCards(deck, cardNumber) {
  const newDeck = [...deck];
  const pack = newDeck.splice(-cardNumber);
  return [newDeck, pack];
}

// Deals hand and bus cards to each player, returns [remainingDeck, updatedPlayers]
/**
 * Deals hand and bus cards to each player.
 * @param {Array} deck - The deck of cards
 * @param {Array} playerList - List of player objects
 * @param {number} [handNumber=5] - Number of hand cards per player
 * @param {number} [busNumber=10] - Number of bus cards per player
 * @returns {[Array, Array]} Remaining deck and updated players
 */
function dealCardPerPlayer(deck, playerList, handNumber = 5, busNumber = 10) {
  let cacheDeck = [...deck];
  let game = [];
  for (let player of playerList) {
    let [newDeck, hand] = dealCards(cacheDeck, handNumber);
    let [finalDeck, bus] = dealCards(newDeck, busNumber);
    cacheDeck = finalDeck;
    game.push({
      ...player,
      hand,
      bus,
      busStop: EMPTY_BUS_STOP,
      isCardDrawed: true,
    });
  }
  return [cacheDeck, game];
}

// Shuffles the deck using Fisher-Yates algorithm
/**
 * Shuffles the deck using the Fisher-Yates algorithm.
 * @param {Array} deck - The deck of cards
 * @returns {Array} Shuffled deck
 */
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

// Initializes and shuffles the deck based on player count
/**
 * Initializes and shuffles the deck based on player count.
 * @param {Array} gamePlayers - List of player objects
 * @returns {Array} Shuffled deck
 */
function initDeck(gamePlayers) {
  const playerCount = gamePlayers.length;
  let totalDecks = MIN_PACK_IN_DECK;
  if (playerCount > COUNT_OF_PLAYERS_FOR_EXTRA_PACK) {
    totalDecks =
      MIN_PACK_IN_DECK +
      Math.ceil(
        (playerCount - COUNT_OF_PLAYERS_FOR_EXTRA_PACK) /
          PLAYERS_PER_EXTRA_PACK,
      );
  }
  const generator = new CardDeckGenerator();
  const deck = generator.getDeckOfPacks(totalDecks);
  return shuffleDeck(deck);
}

// Returns index of card in pack, throws if not found
/**
 * Returns index of card in pack, throws if not found.
 * @param {object} card - Card object to find
 * @param {Array} pack - Array of card objects
 * @param {Function} error - Error constructor to throw if not found
 * @returns {number} Index of the card in the pack
 * @throws {Error} If card is not found
 */
function getCardIndex(card, pack, error) {
  const index = pack.findIndex((c) => c.i === card.i);
  if (index === -1) {
    throw new error({ card, pack });
  } else {
    return index;
  }
}

module.exports = {
  shuffleDeck,
  initDeck,
  dealCardPerPlayer,
  getCardIndex,
  CardDeckGenerator,
};
