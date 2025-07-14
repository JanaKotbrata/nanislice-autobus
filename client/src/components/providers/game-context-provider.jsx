import React, { useEffect, useRef, useState } from "react";
import GameContext from "../../context/game";
import GameActions from "../../../../shared/constants/game-actions.json";
import { getGame, processAction, setPlayer } from "../../services/game-service";
import {
  canPlaceInBusStop,
  canPlaceOnGameBoard,
  canPlaceOnGBPack,
  getPlayerAndValid,
} from "../../services/game-validation";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth-context.jsx";

const maxHandSize = 5;

function GameContextProvider({ children }) {
  const [gameCode, setGameCode] = useState(null);
  const [game, setGame] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [showDangerAlert, setShowDangerAlert] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [leavingPlayer, setLeavingPlayer] = useState(false);
  const [ready, setReady] = useState(false);
  const code = useRef(null);
  const navigate = useNavigate();
  const players = game?.playerList || [];
  const gameDeck = game?.deck || [];
  const currentPlayer = game?.currentPlayer;
  const gameBoard = game?.gameBoard || [];
  const gameState = game?.state;
  const { token } = useAuth();

  useEffect(() => {
    const fetchGame = async () => {
      try {
        const fetchedGame = await getGame({ code: gameCode }, token);
        setContextGame(fetchedGame);
      } catch (err) {
        console.error("Nepodařilo se načíst hru:", err);
        navigate("/");
      }
    };
    if (gameCode && gameCode !== code.current) {
      fetchGame().catch((err) => console.error("Chyba při fetchGame:", err));
    }
  }, [gameCode]);

  function setContextGame(game) {
    setGame(game);
    code.current = game.code;
    setGameCode(game.code);
    const myself = game.playerList.find((player) => player.myself);
    setReady(myself?.ready || false);
  }

  function handleReady() {
    let newReady;
    if (!ready) {
      newReady = true;
      setReady(newReady);
      console.log("true", newReady);
      alterMyself({ ready: newReady });
    } else {
      newReady = false;
      setReady(newReady);
      console.log("false", newReady);
      alterMyself({ ready: newReady });
    }
    const userId = game.playerList.find((player) => player.myself)?.userId;
    console.log("ready před setPlayer", { gameCode, userId, ready: newReady });
    setPlayer(
      {
        gameCode,
        userId,
        ready: newReady,
      },
      token,
    )
      .then((updatedGame) => {
        setContextGame(updatedGame);
      })
      .catch((err) => {
        console.error("Chyba při nastavení připravenosti:", err);
        setReady(!newReady);
        console.log("ready po chybě", !newReady);
        alterMyself({ ready: !newReady });
      });
  }

  function showErrorAlert(message) {
    setErrorMessage(message);
    setShowDangerAlert(true);
  }

  function updateGameServerState(actionData, action) {
    processAction({ ...actionData, action }, token)
      .then(setGame)
      .catch((err) => {
        console.error("Chyba při updateGameServerState:", err);
      });
  }

  function alterMyself(changes) {
    setGame((prevGame) => ({
      ...prevGame,
      playerList: prevGame.playerList.map((player) =>
        player.myself ? { ...player, ...changes } : player,
      ),
    }));
  }

  function removeCardInTarget(target, targetCard) {
    let removed = false;
    const newTarget = target.map((c) => {
      if (!removed && c?.i === targetCard.i) {
        removed = true;
        return {};
      }
      return c;
    });
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
    let [newHand, removed] = removeCardInTarget(player.hand, card);
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

  function drawCard() {
    const myself = getPlayerAndValid(players, currentPlayer, showErrorAlert);
    if (!myself) return;
    if (myself.isCardDrawed) {
      return showErrorAlert("Teď si nemůžeš líznout kartu.");
    }
    const handLength = myself.hand.filter((c) => c.rank).length;
    if (handLength >= maxHandSize) return;

    const newCard = { i: -1, rank: "počkej", suit: "na mě" };
    const newHand = [...myself.hand];
    const index = newHand.findIndex((c) => !c.rank);
    if (index !== -1) newHand[index] = newCard;
    else newHand.push(newCard);

    alterMyself({ hand: newHand });
    updateGameServerState({ gameCode }, GameActions.DRAW_CARD);
  }

  function startNewPack(card) {
    const myself = getPlayerAndValid(players, currentPlayer, showErrorAlert);
    if (!myself) return;
    if (!myself.isCardDrawed) {
      showErrorAlert("Lízni si laskavě než začneš něco dělat, dík!");
      return;
    }
    if (!canPlaceOnGameBoard(card, showErrorAlert)) return;

    const { newHand, newBus, action } = getTargetAndAction(myself, card, true);
    if (action) {
      setGame((prev) => ({
        ...prev,
        gameBoard: [...prev.gameBoard, [card]],
      }));
      alterMyself({ hand: newHand, bus: newBus });
      updateGameServerState({ card, gameCode }, action);
    }
  }

  function addToPack(card, targetIndex) {
    const myself = getPlayerAndValid(players, currentPlayer, showErrorAlert);
    if (!myself) return;
    if (!myself.isCardDrawed) {
      showErrorAlert("Lízni si laskavě než začneš něco dělat, dík!");
      return;
    }
    if (!canPlaceOnGBPack(card, gameBoard, targetIndex, showErrorAlert)) return;

    const { newHand, newBus, newBusStop, action } = getTargetAndAction(
      myself,
      card,
    );
    if (action) {
      const newBoard = [...gameBoard];
      newBoard[targetIndex].push(card);
      setGame((prev) => ({ ...prev, gameBoard: newBoard }));
      alterMyself({ hand: newHand, bus: newBus, busStop: newBusStop });
      updateGameServerState({ card, targetIndex, gameCode }, action);
    }
  }

  function reorderHand(card, newIndex) {
    const myself = getPlayerAndValid(
      players,
      currentPlayer,
      showErrorAlert,
      true,
    );
    if (!myself) return;

    const oldIndex = myself.hand.findIndex((c) => c.i === card.i);
    if (oldIndex === -1 || newIndex < 0 || newIndex >= myself.hand.length) {
      showErrorAlert(
        "Tak co chceš, cheatovat nebo co? No nemůžeš si tu kartu dát do ruky, že jo...",
      );
      return;
    }

    const newHand = [...myself.hand];
    const movedCard = newHand[oldIndex];
    newHand[oldIndex] = newHand[newIndex];
    newHand[newIndex] = movedCard;

    alterMyself({ hand: newHand });
    updateGameServerState(
      { gameCode, hand: newHand },
      GameActions.REORDER_HAND,
    );
  }

  function moveCardToSlot(card, targetIndex, destination) {
    const myself = getPlayerAndValid(players, currentPlayer, showErrorAlert);
    if (!myself) return;

    if (myself.bus.some((c) => c?.i === card.i)) {
      showErrorAlert("Necheatuj! Nemůžeš si vyndatavat karty z autobusu.");
      return;
    }

    let [newHand] = removeCardInTarget(myself.hand, card);
    let newBusStop = myself.busStop;
    let newBus = myself.bus;

    if (destination === "hand") {
      showErrorAlert(
        "Tak co chceš, cheatovat nebo co? No nemůžeš si tu kartu dát do ruky, že jo...",
      );
      return;
    }

    if (destination === "busStop") {
      if (!canPlaceInBusStop(card, myself.busStop, targetIndex, showErrorAlert))
        return;
      const newStop = [...myself.busStop];
      newStop[targetIndex] = card;
      newBusStop = newStop;
      updateGameServerState(
        { targetIndex, card, gameCode },
        GameActions.MOVE_CARD_TO_BUS_STOP,
      );
    } else {
      newBus = [card, ...myself.bus];
      updateGameServerState({ card, gameCode }, GameActions.MOVE_CARD_TO_BUS);
    }

    alterMyself({ hand: newHand, busStop: newBusStop, bus: newBus });
  }

  function isLoading() {
    return (gameCode && !game) || gameCode !== game?.code;
  }

  return (
    <GameContext.Provider
      value={{
        setGameCode,
        gameCode,
        setContextGame,
        moveCardToSlot,
        drawCard,
        startNewPack,
        addToPack,
        reorderHand,
        game,
        players,
        handleReady,
        ready,
        deck: gameDeck,
        gameBoard,
        currentPlayer,
        loading: isLoading(),
        gameState,
        leavingPlayer,
        errorMessage,
        setErrorMessage,
        showAlert,
        showDangerAlert,
        setShowAlert,
        setShowDangerAlert,
        setLeavingPlayer,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export default GameContextProvider;
