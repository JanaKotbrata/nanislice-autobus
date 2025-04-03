import React, { useState } from "react";
import GameContext from "../../context/game";
import card from "../../routes/game/card.jsx";

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
  const [gameBoard, setGameBoard] = useState([]);
  const [errorMessage, setErrorMessage] = React.useState(null);
  const [showAlert, setShowAlert] = useState(false);

  function getMyself(currentPlayers) {
    return currentPlayers.find((player) => player.myself);
  }

  function getCardPack(i = 0) {
    //TODO tady se bude volat API?
    const pack = [];
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
      const noCardIndex = myself.hand.findIndex((c) => !c.rank);
      const newHand = [...myself.hand];
      if (noCardIndex !== -1) {
        newHand[noCardIndex] = newCard;
      }
      return alterMyself(currentPlayers, {
        hand: newHand,
      });
    });
  }

  function drawCard() {
    const myself = getMyself(gamePlayers);
    const handLength = myself.hand.filter((c) => c.rank).length;
    if (handLength === maxHandSize) return;
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
    showErrorAlert("Tak hele, sem můžeš dát pouze eso nebo žolíka!");
    return false;
  }

  const removeCardFromHandOrBusStop = (player, card) => {
    function replaceCard(c) {
      if (c.i === card.i) {
        return {};
      }
      return c;
    }

    const newHand = player.hand.map(replaceCard);
    const newBusStop = player.busStop.map(replaceCard);

    return { newHand, newBusStop };
  };

  const placeCardOnGameBoard = (gameBoard, card) => {
    setGameBoard([...gameBoard, [card]]);
  };

  function canPlaceInBusStop(card, busStop, targetIndex, setErrorMessage) {
    if (["Jr", "A"].includes(card.rank)) {
      showErrorAlert(`Nelze odložit kartu s rankem: ${card.rank}`);
      return false;
    }

    if (
      busStop[targetIndex] &&
      Object.keys(busStop[targetIndex]).length !== 0
    ) {
      showErrorAlert(
        `Ti jebe? Tady je plno! Sem nemůžeš dát kartu s hodnotou: ${card.rank}. Hoď sem stejnou, co tu leží, najdi volné místo, anebo si nastup!`,
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

  function showErrorAlert(message) {
    //Udělat provider pro error(alert)? a tam dávat metody k němu? a nějak to jakoby zavalit
    setErrorMessage(message);
    setShowAlert(true);
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
              showErrorAlert(
                `Tak co chceš, cheatovat nebo co? No nemůžeš si tu kartu dát zpátky, že jo...`,
              );
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

        moveCardToGameBoard: (card, destination) => {
          setPlayers((currentPlayers) => {
            const myself = getMyself(currentPlayers);

            // Zkontroluje zda je karta v ruce nebo zastávce
            const isInHand = myself.hand.some((c) => c.i === card.i);
            const isInBusStop = myself.busStop.some((c) => c?.i === card.i);

            if (!isInHand && !isInBusStop) {
              showErrorAlert("O co se teď snažíš jako? To fakt ne...");
              return currentPlayers;
            }

            if (!canPlaceOnGameBoard(card, gameBoard)) {
              return currentPlayers;
            }

            const { newHand, newBusStop } = removeCardFromHandOrBusStop(
              myself,
              card,
            );

            placeCardOnGameBoard(gameBoard, card);

            return alterMyself(currentPlayers, {
              hand: newHand,
              busStop: newBusStop,
            });
          });
        },
        reorderHand: (oldIndex, newIndex) => {
          setPlayers((currentPlayers) => {
            const myself = getMyself(currentPlayers);
            console.log(
              "Player hand BEFORE reorder:",
              JSON.stringify(myself.hand),
            );

            if (oldIndex === -1) {
              showErrorAlert(
                `Tak co chceš, cheatovat nebo co? No nemůžeš si tu kartu dát zpátky, že jo...`,
              );
              return currentPlayers;
            }

            if (
              oldIndex < 0 ||
              newIndex < 0 ||
              oldIndex >= myself.hand.length ||
              newIndex >= myself.hand.length
            ) {
              console.error(
                "reorderHand: Invalid indexes",
                oldIndex,
                newIndex,
              );
              return currentPlayers;
            }

            const newHand = [...myself.hand];
            const movedCard = newHand[oldIndex]; // Uložíme kartu, kterou přesouváme

            // SWAP dvou karet
            newHand[oldIndex] = newHand[newIndex];
            newHand[newIndex] = movedCard;

            console.log(
              "Player hand AFTER reorder:",
              JSON.stringify(newHand),
            );

            return alterMyself(currentPlayers, { hand: newHand });
          });
        },
        deck: gameDeck,
        initDeck: () => {
          let gamePack = getCardPack();
          const lastIndex = gamePack[gamePack.length - 1].i;
          let deck = gamePack.concat(getCardPack(lastIndex));
          let multiplier = 1;
          const basePlayers = 5;

          // Dynamické násobení balíčku
          while (gamePlayers.length > basePlayers * multiplier) {
            const lastIndex = deck[deck.length - 1].i;
            deck = deck.concat(getCardPack(lastIndex));
            multiplier *= 2;
          }
          setGameDeck(shuffleDeck(deck));
        },
        gameBoard,
        errorMessage,
        setErrorMessage,
        showAlert,
        setShowAlert,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export default GameContextProvider;
