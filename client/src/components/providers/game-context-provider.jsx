import React, { useState } from "react";
import GameContext from "../../context/game";

const ranks = [
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
  "A",
];
const suits = ["♥", "♦", "♠", "♣"];
const maxHandSize = 5;
function GameContextProvider({ children, players }) {
  const [gamePlayers, setPlayers] = useState(players);
  const [gameDeck, setGameDeck] = useState([]);

  function getMyself(currentPlayers) {
    return currentPlayers.find((player) => player.myself);
  }

  function getCardPack() {
    const pack = [];
    let i = 0;
    for (const suit of suits) {
      for (const rank of ranks) {
        pack.push({ i, rank, suit });
        i++;
      }
    }
    pack.push({ i: i + 1, rank: "Jr", suit: "🃏" });
    pack.push({ i: i + 2, rank: "Jr", suit: "🃏" });
    return pack;
  }

  // function setHand(hand) {
  //   setPlayers((currentPlayers) => {
  //     const myself = getMyself(currentPlayers);
  //     myself.hand = hand;
  //     return currentPlayers.map((player) => ({ ...player }));
  //   });
  // }

  function alterMyself(currentPlayers, changes) {
    const myself = getMyself(currentPlayers);

    const newSelf = {
      ...myself,
      ...changes,
    };

    return currentPlayers.map((player) => {
      if (player.myself) return newSelf;
      return { ...player };
    });
  }

  function addCardToHand(newCard) {
    setPlayers((currentPlayers) => {
      const myself = getMyself(currentPlayers);
      return alterMyself(currentPlayers, {
        hand: [...myself.hand, newCard],
      });
    });
  }

  function drawCard() {
    console.log("drawCard call");
    const myself = getMyself(gamePlayers);
    if (myself.hand.length === maxHandSize) return;
    const newCard = [...gameDeck].pop();
    addCardToHand(newCard);
    setGameDeck((currentDeck) =>
      currentDeck.filter((card) => card.i !== newCard.i),
    );
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

  return (
    <GameContext.Provider
      value={{
        players: gamePlayers,
        //setHand,
        drawCard,
        removeCard: (card) => {
          setPlayers((currentPlayers) => {
            const myself = getMyself(currentPlayers);
            return alterMyself(currentPlayers, {
              hand: myself.hand.filter((c) => c.i !== card.i),
            });
          });
        },
        deck: gameDeck,
        initDeck: () => {
          let gamePack = getCardPack();
          let deck = gamePack.concat(gamePack);
          let multiplier = 1;
          const basePlayers = 5;

          // Dynamické násobení balíčku
          while (gamePlayers.length > basePlayers * multiplier) {
            deck = deck.concat(deck);
            multiplier *= 2;
          }
          setGameDeck(shuffleDeck(deck));
        },
        setDeck: () => {},
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export default GameContextProvider;
