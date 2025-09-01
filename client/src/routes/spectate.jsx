import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import GameContext from "../context/game.js";
import CardAnimationContext from "../context/card-animation.js";
import LanguageContext from "../context/language.js";
import { useGameSocket } from "../hooks/use-game-socket.js";
import { useResizablePanel } from "../hooks/use-game-layout.js";
import { useGameFlow } from "../hooks/use-game-flow.js";
import { handleSocketAnimation } from "../utils/animation-utils.js";
import GameBase from "./game-base.jsx";

function Spectate() {
  const navigate = useNavigate();
  const gameContext = useContext(GameContext);
  const cardAnimationContext = useContext(CardAnimationContext);
  const i18n = useContext(LanguageContext);
  const {
    leftPanelWidth,
    canResizePanel,
    handlePanelDragStart,
    handlePanelDragMove,
    handlePanelDragEnd,
  } = useResizablePanel();
  const { showEndGameAlert } = useGameFlow(gameContext, navigate);
  const [leavingPlayerName, setLeavingPlayerName] = useState("");

  const otherPlayers = gameContext.players || [];

  useGameSocket(
    -1,
    gameContext.gameCode,
    gameContext.setContextGame,
    setLeavingPlayerName,
    (...args) =>
      handleSocketAnimation(cardAnimationContext, gameContext, ...args),
  );

  return (
    <GameBase
      otherPlayers={otherPlayers}
      myself={null}
      leftPanelWidth={leftPanelWidth}
      canResizePanel={canResizePanel}
      handlePanelDragStart={handlePanelDragStart}
      handlePanelDragMove={handlePanelDragMove}
      handlePanelDragEnd={handlePanelDragEnd}
      showEndGameAlert={showEndGameAlert}
      leavingPlayerName={leavingPlayerName}
      i18n={i18n}
      gameContext={gameContext}
    ></GameBase>
  );
}

export default Spectate;
