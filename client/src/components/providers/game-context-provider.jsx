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
    //TODO tady se bude volat API?
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

  function canPlaceOnGameBoard(card, gameBoard, targetIndex) {
    if (["Jr", "A"].includes(card.rank)) {
      return true;
    }

    const currentCardIndex = cardOrder.indexOf(card.rank);
    if (currentCardIndex === -1) {
      console.warn("Neplatný rank karty!");
      return false;
    }

    const previousCard = gameBoard[targetIndex - 1];
    if (
      !previousCard ||
      cardOrder.indexOf(previousCard.rank) === currentCardIndex - 1
    ) {
      return true;
    }

    console.warn(
      "Nelze přesunout kartu na herní pole, protože předchozí karta není v pořádku!",
    );
    return false;
  }

  const removeCardFromHandOrBusStop = (player, card) => {
    const newHand = player.hand.filter((c) => c.i !== card.i);
    const newBusStop = [...player.busStop];
    const busStopIndex = newBusStop.findIndex((c) => c?.i === card.i);

    if (busStopIndex !== -1) {
      newBusStop[busStopIndex] = {}; // Vyprázdní původní slot
    }

    return { newHand, newBusStop };
  };

  const placeCardOnGameBoard = (gameBoard, card, targetIndex) => {
    const newGameBoard = [...gameBoard];

    if (
      !newGameBoard[targetIndex] ||
      Object.keys(newGameBoard[targetIndex]).length === 0
    ) {
      newGameBoard[targetIndex] = card;
      return newGameBoard;
    }

    console.warn("Cílový slot na herním poli je už obsazen!", targetIndex);
    return gameBoard;
  };

  function canPlaceInBusStop(card, busStop, targetIndex, setErrorMessage) {
    if (["Jr", "A"].includes(card.rank)) {
      console.warn("Nelze odložit kartu s rankem:", card.rank);
      setErrorMessage(`Nelze odložit kartu s rankem: ${card.rank}`);
      return false;
    }

    if (
      busStop[targetIndex] &&
      Object.keys(busStop[targetIndex]).length !== 0
    ) {
      console.warn("Cílový slot je už obsazen!", targetIndex);
      setErrorMessage(
        `Tady je plno! Nebo sem hoď kartu s hodnotou: ${card.rank}`,
      );
      return false;
    }

    return true;
  }

  function placeCardInBusStop(busStop, card, targetIndex) {
    const newBusStop = [...busStop];
    newBusStop[targetIndex] = card;
    return newBusStop;
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

            if (destination === "hand") {
              console.warn("Nelze přesouvat kartu zpět do ruky!");
              setErrorMessage(
                `Tak co chceš, cheatovat nebo co? No nemůžeš si tu kartu dát zpátky, že jo...`,
              );
              alert("ajhoh");
              return currentPlayers;
            }

            if (
              !canPlaceInBusStop(
                card,
                myself.busStop,
                targetIndex,
                setErrorMessage,
              )
            ) {
              return currentPlayers;
            }

            const { newHand, newBusStop } = removeCardFromHandOrBusStop(
              myself,
              card,
            );

            const updatedBusStop = placeCardInBusStop(
              newBusStop,
              card,
              targetIndex,
            );

            return alterMyself(currentPlayers, {
              hand: newHand,
              busStop: updatedBusStop,
            });
          });
        },

        moveCardToGameBoard: (card, targetIndex, destination) => {
          setPlayers((currentPlayers) => {
            const myself = getMyself(currentPlayers);

            console.log("Původní data:", {
              hand: myself.hand,
              busStop: myself.busStop,
              gameBoard: myself.gameBoard,
            });

            // Zabrání přesunu karty zpět do ruky
            if (destination === "hand") {
              console.warn("Nelze přesouvat kartu zpět do ruky!");
              return currentPlayers;
            }

            // Ověření, zda karta může být položena na herní pole
            if (!canPlaceOnGameBoard(card, myself.gameBoard, targetIndex)) {
              return currentPlayers;
            }

            const { newHand, newBusStop } = removeCardFromHandOrBusStop(
              myself,
              card,
            );

            const newGameBoard = placeCardOnGameBoard(
              myself.gameBoard,
              card,
              targetIndex,
            );

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
