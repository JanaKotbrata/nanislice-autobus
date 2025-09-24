import { useContext } from "react";
import { Navigate } from "react-router-dom";
import GameContext from "../context/game.js";
import CardAnimationContext from "../context/card-animation.js";
import LanguageContext from "../context/language.js";
import AlertContext from "../context/alert.js";
import { useAuth } from "../components/providers/auth-context-provider.jsx";
import { useGameSocket } from "../hooks/use-game-socket.js";
import { useResizablePanel } from "../hooks/use-game-layout.js";
import { useGameFlow } from "../hooks/use-game-flow.js";
import { handleSocketAnimation } from "../utils/animation-utils.js";
import GameBase from "./game-base.jsx";
import Leave from "../components/visual/game/leave.jsx";
import { useAudio } from "../components/providers/audio-context-provider.jsx";

function splitPlayers(players) {
  const playersWithPosition = players.map((p, idx) => ({
    ...p,
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

function Game() {
  const gameContext = useContext(GameContext);
  const cardAnimationContext = useContext(CardAnimationContext);
  const i18n = useContext(LanguageContext);
  const { user } = useAuth();
  const { playSound } = useAudio();
  const {
    leftPanelWidth,
    canResizePanel,
    handlePanelDragStart,
    handlePanelDragMove,
    handlePanelDragEnd,
  } = useResizablePanel();
  const { showEndGameAlert } = useGameFlow();

  const [myself, otherPlayers] = splitPlayers(gameContext.players);
  const { setInfoMessage } = useContext(AlertContext);

  useGameSocket(
    user.id,
    (playerName) => {
      setInfoMessage(`${playerName} ${i18n.translate("tryToLeave")}`);
    },
    ({ target, actionBy, isShuffled, finishedPackIndex, animationCallBack }) =>
      handleSocketAnimation(
        cardAnimationContext,
        gameContext,
        target,
        actionBy,
        isShuffled,
        finishedPackIndex,
        animationCallBack,
        playSound,
      ),
  );

  if (!myself.userId) {
    return <Navigate to={`/spectate/${gameContext.gameCode}`} />;
  }

  return (
    <GameBase
      otherPlayers={otherPlayers}
      myself={myself}
      leftPanelWidth={leftPanelWidth}
      canResizePanel={canResizePanel}
      handlePanelDragStart={handlePanelDragStart}
      handlePanelDragMove={handlePanelDragMove}
      handlePanelDragEnd={handlePanelDragEnd}
      showEndGameAlert={showEndGameAlert}
      i18n={i18n}
      gameContext={gameContext}
    >
      <Leave userId={myself.userId} />
    </GameBase>
  );
}

export default Game;
