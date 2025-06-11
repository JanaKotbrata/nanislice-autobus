import React, { useEffect, useState } from "react";
import GameContext from "../../context/game";
import GameActions from "../../../../shared/constants/game-actions.json";
import { processAction } from "../../services/game-service";
const maxHandSize = 5;

function GameContextProvider({ children, game }) {
  const [gamePlayers, setPlayers] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [gameDeck, setGameDeck] = useState([]);
  const [gameBoard, setGameBoard] = useState([]);
  const [errorMessage, setErrorMessage] = React.useState(null);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    if (!game) return;
    setPlayers(game.playerList);
    setGameDeck(game.deck);
    setCurrentPlayer(game.currentPlayer);
  }, [game]);

  function getMyself(currentPlayers) {
    return currentPlayers.find((player) => player.myself);
  }

  async function updateGameServerState(actionData) {
    const newGameState = await processAction(actionData);
    // TODO poresit chybu z volani
    const game = newGameState.newGame;
    console.log("Game state updated from server:", game);

    setPlayers(game.playerList);
    setGameDeck(game.deck);
    setCurrentPlayer(game.currentPlayer);
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
    const isSameCard = busStop[targetIndex]?.rank === card.rank;
    if (
      busStop[targetIndex] &&
      Object.keys(busStop[targetIndex]).length !== 0 &&
      !isSameCard
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
    //TODO Udělat provider pro error(alert)? a tam dávat metody k němu? a nějak to jakoby zavalit
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

            updateGameServerState({
              action: GameActions.MOVE_CARD_TO_BUS_STOP,
              targetIndex,
              card,
              gameCode: game.code,
            });

            return alterMyself(currentPlayers, {
              hand: newHand,
              busStop: updatedBusStop,
            });
          });
        },

        moveCardToGameBoard: (card, destination) => {
          // TODO prejmenovat na startNewPack
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

            // TODO volat akci na server

            return alterMyself(currentPlayers, {
              hand: newHand,
              busStop: newBusStop,
            });
          });
        },
        // TODO vyrobit addToPack
        reorderHand: (oldIndex, newIndex) => {
          setPlayers((currentPlayers) => {
            const myself = getMyself(currentPlayers);
            console.log(
              "🔹 Player hand BEFORE reorder:",
              JSON.stringify(myself.hand),
            );

            if (oldIndex === -1) {
              showErrorAlert(
                `Tak co chceš, cheatovat nebo co? No nemůžeš si tu kartu dát zpátky, že jo...`,
              );
              return currentPlayers;
            }

            // Ochrana před špatnými indexy
            if (
              oldIndex < 0 ||
              newIndex < 0 ||
              oldIndex >= myself.hand.length ||
              newIndex >= myself.hand.length
            ) {
              console.error(
                "❌ reorderHand: Invalid indexes",
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
              "🔹 Player hand AFTER reorder:",
              JSON.stringify(newHand),
            );

            return alterMyself(currentPlayers, { hand: newHand });
          });
        },
        deck: gameDeck,
        gameBoard,
        currentPlayer,
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
