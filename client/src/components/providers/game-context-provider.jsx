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
const suits = ["♥", "♦", "♠", "♣"]; //TOHLE bude potřeba dělat na serveru
const maxHandSize = 5;
function GameContextProvider({ children, players }) {
  const [gamePlayers, setPlayers] = useState(players);
  const [gameDeck, setGameDeck] = useState([]);
  const [errorMessage, setErrorMessage] = React.useState(null);

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
        moveCardToSlot: (card, targetIndex, destination) => {
          setPlayers((currentPlayers) => {
            const myself = getMyself(currentPlayers);

            console.log("Původní data:", {
              hand: myself.hand,
              busStop: myself.busStop,
            });

            // Zabránění přesunu karty zpět do ruky
            if (destination === "hand") {
              console.warn("Nelze přesouvat kartu zpět do ruky!");
              return currentPlayers; // Vrátíme beze změny
            }

            //Joker a eso se nesmí odkládat
            if (["Jr", "A"].includes(card.rank)) {
              console.warn("Nelze odložit kartu s rankem:", card.rank);
              return currentPlayers;
            }

            const newBusStop = [...myself.busStop];

            const currentIndex = newBusStop.findIndex((c) => c?.i === card.i);
            console.log(
              "Aktuální index v zastávce:",
              currentIndex,
              "Nový index:",
              targetIndex,
            );

            // Pokud karta existuje v zastávce, vymaže se
            if (currentIndex !== -1) {
              newBusStop[currentIndex] = {};
            }

            // Přesun karty na nový slot (pokud je volný)
            if (
              !newBusStop[targetIndex] ||
              Object.keys(newBusStop[targetIndex]).length === 0
            ) {
              newBusStop[targetIndex] = card;
            } else {
              console.warn("Cílový slot je už obsazen!", targetIndex);
              setErrorMessage(
                  `Tady je plno! Nebo sem hoď kartu s hodnotou: ${card.rank}`,
              );
              return currentPlayers;
            }
            // Kopie ruky a zastávky
            const newHand = myself.hand.filter((c) => c.i !== card.i);

            console.log("Aktualizované data:", {
              hand: newHand,
              busStop: newBusStop,
            });

            return alterMyself(currentPlayers, {
              hand: newHand,
              busStop: newBusStop,
            });
          });
        },
        moveCardToGameBoard: (card, targetIndex, destination) => {
          //TODO
          setPlayers((currentPlayers) => {
            const myself = getMyself(currentPlayers);

            console.log("🔄 Původní data:", {
              hand: myself.hand,
              busStop: myself.busStop,
              gameBoard: myself.gameBoard,
            });

            // Zabrání přesunu karty zpět do ruky
            if (destination === "hand") {
              console.warn("Nelze přesouvat kartu zpět do ruky!");
              return currentPlayers;
            }

            // Joker a eso se nesmí odkládat na herní pole
            if (["Jr", "A"].includes(card.rank)) {
              console.warn("Nelze odložit kartu s rankem:", card.rank);
            } else {
              const cardOrder = [
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
              const currentCardIndex = cardOrder.indexOf(card.rank);

              if (currentCardIndex === -1) {
                console.warn("Neplatný rank karty!");
                return currentPlayers;
              }

              const gameBoard = myself.gameBoard || [];
              const previousCard = gameBoard[targetIndex - 1];

              if (
                previousCard &&
                cardOrder.indexOf(previousCard.rank) !== currentCardIndex - 1
              ) {
                console.warn(
                  "Nelze přesunout kartu na herní pole, protože předchozí karta není v pořádku!",
                );
                return currentPlayers;
              }
            }

            const newBusStop = [...myself.busStop];
            const newHand = myself.hand.filter((c) => c.i !== card.i);
            const newGameBoard = [...myself.gameBoard];

            const currentIndex = newBusStop.findIndex((c) => c?.i === card.i);

            if (currentIndex !== -1) {
              newBusStop[currentIndex] = {};
            }

            // Pokud karta existuje v ruce, vymaže se
            const currentHandIndex = myself.hand.findIndex(
              (c) => c.i === card.i,
            );
            if (currentHandIndex !== -1) {
              newHand.splice(currentHandIndex, 1);
            }

            // na nový slot (pokud je volný)
            if (
              !newGameBoard[targetIndex] ||
              Object.keys(newGameBoard[targetIndex]).length === 0
            ) {
              newGameBoard[targetIndex] = card;
            } else {
              console.warn(
                "Cílový slot na herním poli je už obsazen!",
                targetIndex,
              );
              return currentPlayers;
            }

            console.log("Aktualizované data:", {
              hand: newHand,
              busStop: newBusStop,
              gameBoard: newGameBoard,
            });

            return alterMyself(currentPlayers, {
              hand: newHand,
              busStop: newBusStop,
              gameBoard: newGameBoard,
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
        errorMessage,
        setErrorMessage,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export default GameContextProvider;
