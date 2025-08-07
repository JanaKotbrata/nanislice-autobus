import React, { useState, useRef, useContext, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import GameBoard from "./game/game-board.jsx";
import GameContext from "../context/game.js";
import { useNavigate } from "react-router-dom";
import { useGameSocket } from "../hooks/use-game-socket.js";
import { useAuth } from "../context/auth-context.jsx";
import SuccessAlert from "../components/alerts/success-alert.jsx";
import { closeGame } from "../services/game-service";
import Leave from "../components/form/visual/leave.jsx";
import InfoAlert from "../components/alerts/info-alert.jsx";
import LangSelector from "../components/form/visual/lang-selector.jsx";
import LanguageContext from "../context/language.js";
import SlotContextProvider from "../components/providers/slot-context-provider.jsx";
import AnimationCard from "../components/animation-card.jsx";
import PlayerPanel from "./game/player-panel.jsx";

const ANIMATION_DURATION = 1000;

function splitPlayers(players) {
  const playersWithPosition = players.map((player, idx) => ({
    ...player,
    position: idx + 1,
  }));
  const myselfIdx = playersWithPosition.findIndex((p) => p?.myself);
  if (myselfIdx === -1) return [{}, playersWithPosition];
  const myself = playersWithPosition[myselfIdx];
  const others = playersWithPosition.filter((_, idx) => idx !== myselfIdx);
  const orderedOthers = [
    ...others.slice(myselfIdx),
    ...others.slice(0, myselfIdx),
  ];
  return [myself, orderedOthers];
}

function getSlotCoordinates(slotId) {
  const slotElement = document.getElementById(slotId);
  if (!slotElement) return null;

  const slotRect = slotElement.getBoundingClientRect();
  return {
    top: slotRect.top,
    left: slotRect.left,
  };
}

function Game() {
  const navigate = useNavigate();
  const gameContext = useContext(GameContext);
  const [leftPanelWidth, setLeftPanelWidth] = useState(653);
  const [isDraggingPanel, setIsDraggingPanel] = useState(false);
  const [showEndGameAlert, setShowEndGameAlert] = useState(false);
  const [leavingPlayerName, setLeavingPlayerName] = useState("");
  const i18n = useContext(LanguageContext);
  const animationQueue = useRef([]);
  const [currentAnimation, setCurrentAnimation] = useState(null);
  const [animationTick, setAnimationTick] = useState(0);

  useEffect(() => {
    if (!currentAnimation && animationQueue.current.length > 0) {
      const next = animationQueue.current.shift();
      setCurrentAnimation(next);

      setTimeout(() => {
        if (next.animationCallback) {
          next.animationCallback();
        }
        setCurrentAnimation(null);
        setAnimationTick((tick) => tick + 1);
      }, next.duration);
    }
  }, [currentAnimation, animationTick]);

  const { user, token } = useAuth();
  const [myself, otherPlayers] = splitPlayers(gameContext.players);

  useEffect(() => {
    if (gameContext?.gameState === "initial") {
      navigate(`/lobby/${gameContext?.gameCode}`);
    } else if (gameContext?.gameState === "closed") {
      navigate(`/`);
    } else if (gameContext?.gameState === "finished") {
      setShowEndGameAlert(true);
      setTimeout(() => {
        closeGame({ gameCode: gameContext.gameCode }, token).finally(() => {
          navigate(`/`);
        });
      }, 10000);
    }
  }, [gameContext?.gameState, gameContext?.gameCode, navigate, token]);

  useGameSocket(
    user.id,
    gameContext.gameCode,
    gameContext.setContextGame,
    (playerName) => setLeavingPlayerName(playerName),
    (target, actionBy, isShuffled, animationCallback) => {
      setTimeout(() => {
        if (!target && !actionBy) {
          animationQueue.current.push({ duration: 0, animationCallback });
          setAnimationTick((tick) => tick + 1);
          return;
        }
        let duration = ANIMATION_DURATION;
        let coords, originCoords, bg;
        if (isShuffled) {
          originCoords = getSlotCoordinates("completed_cardpack_deck");
          coords = getSlotCoordinates("cardpack_deck");

          const completedList = gameContext?.game?.completedCardList || [];
          bg = completedList[completedList.length - 1]?.bg;
          duration = duration / 2;

          if (coords && originCoords) {
            const animation = {
              top: coords.top,
              left: coords.left,
              originTop: originCoords.top,
              originLeft: originCoords.left,
              bg,
            };
            animationQueue.current.push({
              animation,
              duration,
              animationCallback,
            });
          }
        }

        coords = getSlotCoordinates(
          target === "hand" ? `player_${actionBy}` : target,
        );
        originCoords = getSlotCoordinates(`player_${actionBy}`);

        if (target === "hand") {
          bg = gameContext?.deck?.[gameContext?.deck?.length - 1]?.bg;
          originCoords = getSlotCoordinates("cardpack_deck");
        }

        if (coords && originCoords) {
          const animation = {
            top: coords.top,
            left: coords.left,
            originTop: originCoords.top,
            originLeft: originCoords.left,
            bg,
          };
          animationQueue.current.push({
            animation,
            duration,
            animationCallback,
          });
          setAnimationTick((tick) => tick + 1);
        }
      }, 100);
    },
  );

  function handlePanelDragStart() {
    setIsDraggingPanel(true);
    document.body.style.cursor = "ew-resize";
  }

  function handlePanelDragMove(e) {
    if (!isDraggingPanel) return;
    setLeftPanelWidth((prevWidth) =>
      Math.max(200, (prevWidth ?? 653) + e.movementX),
    );
  }

  function handlePanelDragEnd() {
    setIsDraggingPanel(false);
    document.body.style.cursor = "default";
  }

  return (
    <SlotContextProvider>
      <DndProvider backend={HTML5Backend}>
        {currentAnimation?.animation && (
          <AnimationCard
            x={currentAnimation.animation.left}
            y={currentAnimation.animation.top}
            startY={currentAnimation.animation.originTop}
            startX={currentAnimation.animation.originLeft}
            bg={currentAnimation.animation.bg}
            duration={currentAnimation.duration / 1000}
          />
        )}

        <div
          className="flex flex-col sm:flex-row w-full h-full p-1 relative bg-gray-800 force-vertical-layout"
          onMouseMove={handlePanelDragMove}
          onMouseUp={handlePanelDragEnd}
        >
          <PlayerPanel
            otherPlayers={otherPlayers}
            myself={myself}
            leftPanelWidth={leftPanelWidth}
            handlePanelDragStart={handlePanelDragStart}
          />

          <div className="flex-grow w-full bg-gray-900 p-6 flex flex-col relative">
            <div className="flex flex-row gap-6 justify-end">
              <LangSelector />
              <Leave userId={myself.userId} />
            </div>
            <GameBoard player={myself} cardPack={gameContext.deck} />
          </div>
        </div>
        {showEndGameAlert && (
          <SuccessAlert
            message={
              i18n.translate("winner") +
              gameContext.players.find((player) => !player.bus.length)?.name
            }
          />
        )}
        {!!leavingPlayerName && (
          <InfoAlert
            onClose={() => setLeavingPlayerName("")}
            message={`${leavingPlayerName} ${i18n.translate("tryToLeave")}`}
          />
        )}
      </DndProvider>
    </SlotContextProvider>
  );
}

export default Game;
