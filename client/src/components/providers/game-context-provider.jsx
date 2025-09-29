import { useEffect, useRef } from "react";
import GameContext from "../../context/game";
import GameActions from "../../../../shared/constants/game-actions.json";
import { getGame, setPlayer } from "../../services/game-service.js";
import { useNavigate } from "react-router-dom";
import { useGameState } from "../../hooks/use-game-state";
import { useGameActions } from "../../hooks/use-game-actions";

import { isCardInSource } from "../../utils/card-utils";
import { useAuth } from "./auth-context-provider.jsx";

import { useAlertContext } from "./alert-context-provider.jsx";
import { ClientGameRules } from "../../services/game-rules.js";
import { GameError } from "../../errors/game-error.js";
import { Routes } from "../../constants/routes.js";

function GameContextProvider({ children }) {
  const { gameCode, setGameCode, game, setGame, code, setContextGame } =
    useGameState();

  const { updateGameServerState, updateGameServerStateAnimated } =
    useGameActions(setContextGame);

  const { showErrorAlert } = useAlertContext();
  const { token, user } = useAuth();

  const navigate = useNavigate();
  const players = game?.playerList || [];
  const gameDeck = game?.deck || [];
  const currentPlayer = game?.currentPlayer;
  const gameBoard = game?.gameBoard || [];
  const gameState = game?.state;

  // keep track of temporary cards during draw animation
  const tempCardListRef = useRef([null, null, null, null, null]);

  useEffect(() => {
    const fetchGame = async () => {
      try {
        const fetchedGame = await getGame({ code: gameCode }, token);
        setContextGame(fetchedGame);
      } catch (err) {
        console.error("Failed to load game:", err);
        navigate(Routes.HOME);
      }
    };
    if (gameCode && gameCode !== code.current) {
      fetchGame().catch((err) => console.error("Chyba při fetchGame:", err));
    }
  }, [gameCode]);

  function handleToggle(field, forceValue = null) {
    const myself = game?.playerList?.find((player) => player.myself);
    const current = myself?.[field] || false;
    const newValue = forceValue !== null ? forceValue : !current;

    updateMyselfInGame({ [field]: newValue });

    setPlayer(
      {
        gameCode,
        [field]: newValue,
      },
      token,
    )
      .then((updatedGame) => {
        setContextGame(updatedGame);
      })
      .catch((err) => {
        console.error(`Error setting ${field}:`, err);
        updateMyselfInGame({ [field]: current });
      });
  }

  function handleReady() {
    handleToggle("ready");
  }

  function handleNextGame() {
    handleToggle("nextGame");
  }

  function setNextGameFalse() {
    handleToggle("nextGame", false);
  }

  function updateMyselfInGame(changes) {
    setGame((prevGame) => ({
      ...prevGame,
      playerList: prevGame.playerList.map((player) =>
        player.myself ? { ...player, ...changes } : player,
      ),
    }));
  }

  /**
   * Handles drawing a card for the current player, including validation and state update.
   */
  function drawCard(animationPromise = null) {
    const { newGame, myself } = performAction(GameActions.DRAW_CARD, {
      userId: user.id,
    });
    if (!newGame) return; // action failed

    const handLength = myself.hand.filter((c) => c.rank).length;

    // altering instance so setState in updateMyselfInGame updates the gameDeck as well to have the proper card removed
    const deckCard = gameDeck.pop();

    // the i is different per each drawn card to make them unique in the hand
    const newCard = {
      i: -1 - handLength,
      rank: "počkej",
      suit: "na mě",
      bg: deckCard.bg,
    };
    const newHand = [...myself.hand];
    const index = newHand.findIndex((c) => !c.rank);
    if (index !== -1) newHand[index] = newCard;
    else newHand.push(newCard);

    // add temporary card to preserve animation consistency (prevent removal of cards during animation)
    tempCardListRef.current[index] = newCard;

    const hasCardToDraw = newHand.some((c) => !c.rank);

    updateMyselfInGame({ hand: newHand, isCardDrawed: !hasCardToDraw });

    async function setupCardsBeforeUpdate(newGame) {
      // wait for the animation to finish before updating the game state with the new cards to prevent blinking of the cards
      await animationPromise;
      const myself = newGame.playerList.find((player) => player.myself);
      // inject temp cards into the new game state where the real cards are missing
      for (const idx in myself.hand) {
        if (!myself.hand[idx].rank && tempCardListRef.current[idx]) {
          myself.hand[idx] = tempCardListRef.current[idx];
        }
      }
      // clear temp card
      tempCardListRef.current[index] = null;

      // disable "draw card" text when all cards are scheduled
      const hasCardToDraw = myself.hand.some((c) => !c.rank);
      myself.isCardDrawed = !hasCardToDraw;
      return newGame;
    }

    updateGameServerStateAnimated(
      { gameCode },
      GameActions.DRAW_CARD,
      setupCardsBeforeUpdate,
    );
    // return a stub card for immediate UI feedback (mainly the back color of the card)
    return deckCard;
  }

  function startNewPack(card) {
    const myself = players.find((player) => player.myself);
    if (!myself) return;

    if (isCardInSource(card, myself.hand)) {
      performActionAndSave(GameActions.START_NEW_PACK, {
        card,
        userId: user.id,
      });
    } else if (isCardInSource(card, myself.bus)) {
      performActionAndSave(GameActions.START_NEW_PACK_FROM_BUS, {
        card,
        userId: user.id,
      });
    }
  }

  function performAction(action, params) {
    const gameRules = new ClientGameRules(game);
    const myself = game.playerList.find((player) => player.myself);
    let newGame;
    try {
      newGame = gameRules.performAction(action, { myself, ...params });
    } catch (e) {
      if (e instanceof GameError) {
        showErrorAlert(e.code, ...e.params);
      } else {
        console.error(e);
      }
      return {};
    }
    return { newGame, gameRules, myself };
  }

  function performActionAndSave(action, params) {
    const { newGame, gameRules } = performAction(action, params);
    if (!newGame) return; // failed to perform action
    setContextGame(newGame);
    updateGameServerState(
      {
        card: params.card,
        gameCode,
        ...{ targetIndex: params.targetIndex, hand: gameRules.hand },
      },
      action,
    );
  }

  function moveCardToBus(card) {
    performActionAndSave(GameActions.MOVE_CARD_TO_BUS, {
      card,
      userId: user.id,
    });
  }

  function moveCardToBusStop(card, targetIndex) {
    performActionAndSave(GameActions.MOVE_CARD_TO_BUS_STOP, {
      card,
      targetIndex,
      userId: user.id,
    });
  }

  /**
   * Adds a card to an existing pack on the game board.
   * @param {Object} card - The card to add.
   * @param {number} targetIndex - The index of the target pack.
   */
  function addToPack(card, targetIndex) {
    const myself = players.find((player) => player.myself);
    if (!myself) return;

    if (isCardInSource(card, myself.hand)) {
      performActionAndSave(GameActions.MOVE_CARD_TO_BOARD, {
        card,
        targetIndex,
        userId: user.id,
      });
    } else if (isCardInSource(card, myself.bus)) {
      performActionAndSave(GameActions.MOVE_CARD_TO_BOARD_FROM_BUS, {
        card,
        targetIndex,
        userId: user.id,
      });
    } else if (isCardInSource(card, myself.busStop)) {
      performActionAndSave(GameActions.MOVE_CARD_TO_BOARD_FROM_BUS_STOP, {
        card,
        targetIndex,
        userId: user.id,
      });
    }
  }

  function reorderHand(card, newIndex) {
    performActionAndSave(GameActions.REORDER_HAND, {
      card,
      targetIndex: newIndex,
    });
  }

  function viewBusBottomCard() {
    updateGameServerState({ gameCode }, GameActions.VIEW_BOTTOM_BUS_CARD);
  }

  function isLoading() {
    return (gameCode && !game) || gameCode !== game?.code;
  }

  return (
    <GameContext.Provider
      value={{
        // Actions
        setGameCode,
        setContextGame,
        drawCard,
        startNewPack,
        addToPack,
        reorderHand,
        handleReady,
        handleNextGame,
        setNextGameFalse,
        viewBusBottomCard,
        moveCardToBus,
        moveCardToBusStop,
        // Data
        gameCode,
        game,
        players,
        deck: gameDeck,
        gameBoard,
        currentPlayer,
        gameState,
        // State
        loading: isLoading(),
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export default GameContextProvider;
