import React, { useEffect, useRef, useState } from "react";
import GameContext from "../../context/game";
import GameActions from "../../../../shared/constants/game-actions.json";
import { getGame, processAction } from "../../services/game-service";
import {
  canPlaceInBusStop,
  canPlaceOnGameBoard,
  canPlaceOnGBPack,
  getPlayerIndexAndValid,
} from "../../services/game-validation";

const maxHandSize = 5;

function GameContextProvider({ children }) {
  const [gameCode, setGameCode] = useState(null);
  const code = useRef(null);
  const [game, setGame] = useState(null);
  const [gamePlayers, setPlayers] = useState([]);
  const [gameState, setGameState] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [gameDeck, setGameDeck] = useState([]);
  const [gameBoard, setGameBoard] = useState([]);
  const [errorMessage, setErrorMessage] = React.useState(null);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const game = await getGame({ code: gameCode });
        setContextGame(game);
      } catch (err) {
        console.error("Nepodařilo se načíst hráče:", err);
      }
    };
    if (gameCode && gameCode !== code.current) {
      fetchPlayers();
    }
  }, [gameCode]);

  function setContextGame(game) {
    setPlayers(game.playerList); //TODO stačí setGame a používat jen tu game
    setGameDeck(game.deck);
    setGameState(game.state);
    setCurrentPlayer(game.currentPlayer);
    setGameBoard(game.gameBoard);
    code.current = game.code;
    setGameCode(game.code);
  }

  function getMyself(isCurrentPlayerAction = true, action = null) {
    if (isCurrentPlayerAction) {
      const myselfIndex = getPlayerIndexAndValid(
        gamePlayers,
        currentPlayer,
        action,
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
    processAction({ ...actionData, action }).then((newGameData) => {
      console.log("Game state updated from server");
      setPlayers(newGameData.playerList);
      console.log("Players updated");
      setGameDeck(newGameData.deck);
      console.log("Deck updated");
      setCurrentPlayer(newGameData.currentPlayer);
      console.log("Current player updated");
    });
  }

  function alterMyself(currentPlayers, changes, action) {
    const myself = getMyself(true, action);

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
    console.warn(
      "Tady se dějou nějký divný věci..." +
        JSON.stringify({
          newHand: player.hand,
          newBus: player.bus,
          newBusStop: player.busStop,
          action: null,
        }),
    );
    showErrorAlert(
      "Tady se dějou nějký divný věci..." +
        JSON.stringify({
          newHand: player.hand,
          newBus: player.bus,
          newBusStop: player.busStop,
          action: null,
        }),
    );
    return {};
  }

  //game logic
  function startNewPack(card) {
    const myself = getMyself();
    if (myself && myself.isCardDrawed) {
      let isInBus;
      let isInHand;
      if (myself.bus[0]?.i === card.i) {
        isInBus = true;
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
      if (action) {
        placeCardOnGameBoard(gameBoard, card);
        updateGameServerState({ card, gameCode }, action);

        setPlayers(
          alterMyself(gamePlayers, {
            hand: newHand,
            bus: newBus,
          }),
        );
      }
    } else {
      if (!myself.isCardDrawed) {
        showErrorAlert("Lízni si laskavě než začneš něco dělat, dík!");
      }
    }
  }

  function addToPack(card, targetIndex) {
    const myself = getMyself();
    if (
      myself &&
      myself.isCardDrawed &&
      canPlaceOnGBPack(card, gameBoard, targetIndex, showErrorAlert)
    ) {
      const { newHand, newBus, newBusStop, action } = getTargetAndAction(
        myself,
        card,
      );
      if (action) {
        gameBoard[targetIndex].push(card);
        setGameBoard(gameBoard);

        updateGameServerState({ card, targetIndex, gameCode }, action);

        setPlayers(
          alterMyself(gamePlayers, {
            hand: newHand,
            bus: newBus,
            busStop: newBusStop,
          }),
        );
      }
    } else {
      if (!myself.isCardDrawed) {
        showErrorAlert("Lízni si laskavě než začneš něco dělat, dík!");
      }
    }
  }

  function reorderHand(card, newIndex) {
    const myself = getMyself(true, GameActions.REORDER_HAND);
    if (myself) {
      const oldIndex = myself.hand.findIndex((c) => c.i === card.i);
      if (oldIndex === -1) {
        showErrorAlert(
          `Tak co chceš, cheatovat nebo co? No nemůžeš si tu kartu dát zpátky, že jo...`,
        );
        return;
      }

      // Ochrana před špatnými indexy
      if (
        oldIndex < 0 ||
        newIndex < 0 ||
        oldIndex >= myself.hand.length ||
        newIndex >= myself.hand.length
      ) {
        console.error("❌ reorderHand: Invalid indexes", oldIndex, newIndex);
        return;
      }

      const newHand = [...myself.hand];
      const movedCard = newHand[oldIndex];

      // SWAP dvou karet
      newHand[oldIndex] = newHand[newIndex];
      newHand[newIndex] = movedCard;

      updateGameServerState(
        {
          gameCode,
          hand: newHand,
        },
        GameActions.REORDER_HAND,
      );

      alterMyself(gamePlayers, { hand: newHand }, GameActions.REORDER_HAND);
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

        updateGameServerState({ gameCode }, GameActions.DRAW_CARD);
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
            gameCode,
          },
          GameActions.MOVE_CARD_TO_BUS_STOP,
        );
      } else {
        newBus = myself.bus.unshift(card);

        updateGameServerState(
          {
            card,
            gameCode,
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
        setGameCode,
        gameCode,
        setContextGame,
        setPlayers,
        moveCardToSlot,
        drawCard,
        startNewPack,
        addToPack,
        reorderHand,
        setGame,
        game,
        players: gamePlayers,
        deck: gameDeck,
        gameBoard,
        currentPlayer,
        gameState,
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
