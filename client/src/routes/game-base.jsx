import { useContext } from "react";
import { useCountdown } from "../hooks/use-countdown.js";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import SlotContextProvider from "../components/providers/slot-context-provider.jsx";
import PlayerPanel from "../components/visual/game/player-panel.jsx";
import CardDragLayer from "../components/visual/game/card-drag-layer.jsx";
import GameBoard from "../components/visual/game/game-board.jsx";
import LangSelector from "../components/visual/lang-selector.jsx";
import EndGameAlert from "../components/visual/alerts/end-game-alert.jsx";
import InfoAlert from "../components/visual/alerts/info-alert.jsx";
import { useAudio } from "../components/providers/audio-context-provider.jsx";
import { useTickingSound } from "../hooks/use-ticking-sound.js";
import VolumeSettings from "../components/visual/volume-settings.jsx";
import AlertContext from "../context/alert.js";

function GameBase({
  otherPlayers,
  myself,
  leftPanelWidth,
  canResizePanel,
  handlePanelDragStart,
  handlePanelDragMove,
  handlePanelDragEnd,
  children,
  showEndGameAlert,
  i18n,
  gameContext,
}) {
  const { playSound } = useAudio();
  const { infoMessage, setInfoMessage } = useContext(AlertContext);
  useTickingSound(showEndGameAlert, playSound, "/sounds/ticking.mp3", true);

  const [counter] = useCountdown(showEndGameAlert, 30);

  return (
    <SlotContextProvider>
      <DndProvider backend={HTML5Backend}>
        <CardDragLayer />
        <div
          className="flex flex-col sm:flex-row w-full h-full p-1 relative bg-gray-800 force-vertical-layout game"
          onMouseMove={handlePanelDragMove}
          onMouseUp={handlePanelDragEnd}
        >
          <PlayerPanel
            otherPlayers={otherPlayers}
            myself={myself}
            leftPanelWidth={leftPanelWidth}
            canResizePanel={canResizePanel}
            handlePanelDragStart={handlePanelDragStart}
          />

          <div className="flex-grow w-full bg-gray-900 p-6 flex flex-col relative">
            <div className="flex flex-row gap-6 justify-end">
              <VolumeSettings size={22} />
              <LangSelector />
              {children}
            </div>
            <GameBoard player={myself} cardPack={gameContext.deck} />
          </div>
        </div>
        {showEndGameAlert && (
          <EndGameAlert
            message={
              i18n.translate("winner") +
              gameContext.players.find((p) => !p?.bus?.length)?.name +
              ". " +
              i18n.translate("newGame") +
              counter +
              "s"
            }
          />
        )}
        {infoMessage && (
          <InfoAlert onClose={() => setInfoMessage("")} message={infoMessage} />
        )}
      </DndProvider>
    </SlotContextProvider>
  );
}

export default GameBase;
