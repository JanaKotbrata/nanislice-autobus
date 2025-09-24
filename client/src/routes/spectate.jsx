import { useContext } from "react";
import GameContext from "../context/game.js";
import CardAnimationContext from "../context/card-animation.js";
import LanguageContext from "../context/language.js";
import AlertContext from "../context/alert.js";
import { useGameSocket } from "../hooks/use-game-socket.js";
import { useResizablePanel } from "../hooks/use-game-layout.js";
import { useGameFlow } from "../hooks/use-game-flow.js";
import { handleSocketAnimation } from "../utils/animation-utils.js";
import GameBase from "./game-base.jsx";
import { useAudio } from "../components/providers/audio-context-provider.jsx";

function Spectate() {
  const gameContext = useContext(GameContext);
  const cardAnimationContext = useContext(CardAnimationContext);
  const { playSound } = useAudio();
  const i18n = useContext(LanguageContext);
  const {
    leftPanelWidth,
    canResizePanel,
    handlePanelDragStart,
    handlePanelDragMove,
    handlePanelDragEnd,
  } = useResizablePanel();
  const { showEndGameAlert } = useGameFlow();
  const { setInfoMessage } = useContext(AlertContext);

  const otherPlayers = gameContext.players || [];

  useGameSocket(
    -1,
    (playerName) => {
      setInfoMessage(`${playerName} ${i18n.translate("tryToLeave")}`);
    },
    (target, actionBy, isShuffled, finishedPackIndex, animationCallBack) =>
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
      i18n={i18n}
      gameContext={gameContext}
    ></GameBase>
  );
}

export default Spectate;
