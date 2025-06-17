import React, { useEffect, useState } from "react";
import GameContext from "../../context/game";
import GameActions from "../../../../shared/constants/game-actions.json";
import { processAction } from "../../services/game-service";
import {
  canPlaceInBusStop,
  canPlaceOnGameBoard,
  canPlaceOnGBPack,
  getPlayerIndexAndValid,
} from "../../services/game-validation";

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
    setGameBoard(game.gameBoard);
  }, [game]);

  function getMyself(isCurrentPlayerAction = true) {
    if (isCurrentPlayerAction) {
      const myselfIndex = getPlayerIndexAndValid(
        gamePlayers,
        currentPlayer,
        showErrorAlert,
      );
      if (myselfIndex !== false) {
        return gamePlayers[myselfIndex];
      } else {
        return false;
      }
    } else {
      return gamePlayers.find((player) => player.myself);
    }
  }

  function showErrorAlert(message) {
    //TODO Udělat provider pro error(alert)? a tam dávat metody k němu? a nějak to jakoby zavalit
    setErrorMessage(message);
    setShowAlert(true);
  }

  //helpers
  function updateGameServerState(actionData, action) {
    console.log("Do " + JSON.stringify(actionData) + " ac:" + action);
    processAction({ ...actionData, action }).then((newGameData) => {
      console.log("Game state updated from server:", newGameData);
      setPlayers(newGameData.playerList);
      console.log("Players updated:", newGameData.playerList);
      setGameDeck(newGameData.deck);
      console.log("Deck updated:", newGameData.deck);
      setCurrentPlayer(newGameData.currentPlayer);
      console.log("Current player updated:", newGameData.currentPlayer);
    });
  }

  function alterMyself(currentPlayers, changes) {
    const myself = getMyself();

    const newSelf = {
      ...myself,
      ...changes,
    };

    return currentPlayers.map((player) => {
      if (player.myself) return newSelf;
      return { ...player };
    });
  }

  function placeCardInBusStop(busStop, card, targetIndex) {
    const newBusStop = [...busStop];
    newBusStop[targetIndex] = card;
    return newBusStop;
  }

  function placeCardOnGameBoard(gameBoard, card) {
    setGameBoard([...gameBoard, [card]]);
  }

  function addCardToHand(newCard) {
    setPlayers((currentPlayers) => {
      const myself = getMyself();
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

  function removeCardInTarget(target, targetCard, isHand = false) {
    let removed = false;
    let newTarget;
    if (isHand) {
      newTarget = target.map((c) => {
        if (!removed && c.i === targetCard.i) {
          removed = true;
          return {};
        }
        return c;
      });
    } else {
      newTarget = target.filter((c) => {
        if (!removed && c?.i === targetCard.i) {
          removed = true;
          return false;
        }
        return true;
      });
    }
    return [newTarget, removed];
  }

  function removeCardInNestedTargets(nestedTargets, targetCard) {
    let removed = false;
    const newTargets = nestedTargets.map((subArray) => {
      if (removed) return subArray;
      const [newSubArray, wasRemoved] = removeCardInTarget(
        subArray,
        targetCard,
      );
      if (wasRemoved) {
        removed = true;
        return newSubArray;
      }
      return subArray;
    });
    return [newTargets, removed];
  }

  function getTargetAndAction(player, card, isStart = false) {
    let [newHand, removed] = removeCardInTarget(player.hand, card, true);
    if (removed) {
      return {
        newHand,
        newBus: player.bus,
        newBusStop: player.busStop,
        action: isStart
          ? GameActions.START_NEW_PACK
          : GameActions.MOVE_CARD_TO_BOARD,
      };
    }

    let [newBus, removedFromBus] = removeCardInTarget(player.bus, card);
    if (removedFromBus) {
      return {
        newHand: player.hand,
        newBus,
        newBusStop: player.busStop,
        action: isStart
          ? GameActions.START_NEW_PACK_FROM_BUS
          : GameActions.MOVE_CARD_TO_BOARD_FROM_BUS,
      };
    }

    if (!isStart) {
      let [newBusStop, removedFromBusStop] = removeCardInNestedTargets(
        player.busStop,
        card,
      );
      if (removedFromBusStop) {
        return {
          newHand: player.hand,
          newBus: player.bus,
          newBusStop,
          action: GameActions.MOVE_CARD_TO_BOARD_FROM_BUS_STOP,
        };
      }
    }

    return {
      newHand: player.hand,
      newBus: player.bus,
      newBusStop: player.busStop,
      action: null,
    };
  }

  //game logic
  function startNewPack(card) {
    const myself = getMyself();
    if (myself) {
      let isInBus;
      let isInHand;
      console.log("Tak co?", card);
      if (myself.bus[0]?.i === card.i) {
        isInBus = true;
        console.log("Card is in bus:", card);
      }
      if (!isInBus) {
        isInHand = myself.hand.some((c) => c?.i === card.i);
      }

      if (!isInHand && !isInBus) {
        showErrorAlert("O co se teď snažíš jako? To fakt ne...");
        return;
      }

      if (!canPlaceOnGameBoard(card, showErrorAlert)) {
        return;
      }

      const { newHand, newBus, action } = getTargetAndAction(
        myself,
        card,
        true,
      );

      placeCardOnGameBoard(gameBoard, card);
      updateGameServerState({ card, gameCode: game.code }, action);

      setPlayers(
        alterMyself(gamePlayers, {
          hand: newHand,
          bus: newBus,
        }),
      );
    }
  }

  function addToPack(card, targetIndex) {
    const myself = getMyself();
    console.log("Adding card to pack:", card, "at index:", targetIndex);
    if (
      myself &&
      canPlaceOnGBPack(card, gameBoard, targetIndex, showErrorAlert)
    ) {
      const { newHand, newBus, newBusStop, action } = getTargetAndAction(
        myself,
        card,
      );
      console.log("Target and action:", {
        newHand,
        newBus,
        newBusStop,
        action,
      });

      gameBoard[targetIndex].push(card);
      setGameBoard(gameBoard);

      updateGameServerState({ card, targetIndex, gameCode: game.code }, action);

      setPlayers(
        alterMyself(gamePlayers, {
          hand: newHand,
          bus: newBus,
          busStop: newBusStop,
        }),
      );
    }
  }

  function reorderHand(card, newIndex) {
    const myself = getMyself();
    if (myself) {
      const oldIndex = myself.hand.findIndex((c) => c.i === card.i);
      if (oldIndex === -1) {
        showErrorAlert(
          `Tak co chceš, cheatovat nebo co? No nemůžeš si tu kartu dát zpátky, že jo...`,
        );
        return;
      }

      if (
        oldIndex < 0 ||
        newIndex < 0 ||
        oldIndex >= myself.hand.length ||
        newIndex >= myself.hand.length
      ) {
        console.error("reorderHand: Invalid indexes", oldIndex, newIndex);
        return;
      }

      const newHand = [...myself.hand];
      const movedCard = newHand[oldIndex];

      // SWAP dvou karet
      newHand[oldIndex] = newHand[newIndex];
      newHand[newIndex] = movedCard;

      updateGameServerState(
        {
          gameCode: game.code,
          hand: newHand,
        },
        GameActions.REORDER_HAND,
      );

      alterMyself(gamePlayers, { hand: newHand });
      setPlayers(gamePlayers);
    }
  }

  function drawCard() {
    const myself = getMyself();
    if (myself) {
      if (!myself.isCardDrawed) {
        const handLength = myself.hand.filter((c) => c.rank).length;
        if (handLength === maxHandSize) return;
        gameDeck.pop();
        const newCard = { i: -1, rank: "počkej", suit: "na mě" };
        addCardToHand(newCard);
        setGameDeck(gameDeck);

        updateGameServerState({ gameCode: game.code }, GameActions.DRAW_CARD);
      } else {
        showErrorAlert("Teď si nemůžeš líznout kartu.");
      }
    }
  }

  function moveCardToSlot(card, targetIndex, destination) {
    const myself = getMyself();
    if (myself) {
      let newBus = myself.bus;
      let newHand = myself.hand;
      let newBusStop = myself.busStop;
      if (destination === "hand") {
        showErrorAlert(
          `Tak co chceš, cheatovat nebo co? No nemůžeš si tu kartu dát zpátky, že jo...`,
        );
        return;
      }
      [newHand] = removeCardInTarget(myself.hand, card);
      if (destination === "busStop") {
        if (
          !canPlaceInBusStop(card, myself.busStop, targetIndex, showErrorAlert)
        ) {
          return;
        }

        newBusStop = placeCardInBusStop(newBusStop, card, targetIndex);

        updateGameServerState(
          {
            targetIndex,
            card,
            gameCode: game.code,
          },
          GameActions.MOVE_CARD_TO_BUS_STOP,
        );
      } else {
        newBus = myself.bus.unshift(card);

        updateGameServerState(
          {
            card,
            gameCode: game.code,
          },
          GameActions.MOVE_CARD_TO_BUS,
        );
      }
      setPlayers(
        alterMyself(gamePlayers, {
          hand: newHand,
          busStop: newBusStop,
          bus: newBus,
        }),
      );
    }
  }

  return (
    <GameContext.Provider
      value={{
        players: gamePlayers,
        moveCardToSlot,
        drawCard,
        startNewPack,
        addToPack,
        reorderHand,
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
