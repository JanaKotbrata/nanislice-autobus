import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import SlotContextProvider from "../components/providers/slot-context-provider.jsx";
import PlayerPanel from "../components/visual/game/player-panel.jsx";
import CardDragLayer from "../components/visual/game/card-drag-layer.jsx";
import GameBoard from "../components/visual/game/game-board.jsx";
import LangSelector from "../components/visual/lang-selector.jsx";
import SuccessAlert from "../components/visual/alerts/success-alert.jsx";
import InfoAlert from "../components/visual/alerts/info-alert.jsx";

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
  leavingPlayerName,
  i18n,
  gameContext,
}) {
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
              <LangSelector />
              {children}
            </div>
            <GameBoard player={myself} cardPack={gameContext.deck} />
          </div>
        </div>
        {showEndGameAlert && (
          <SuccessAlert
            message={
              i18n.translate("winner") +
              gameContext.players.find((p) => !p?.bus?.length)?.name
            }
          />
        )}
        {!!leavingPlayerName && (
          <InfoAlert
            onClose={() => {}}
            message={`${leavingPlayerName} ${i18n.translate("tryToLeave")}`}
          />
        )}
      </DndProvider>
    </SlotContextProvider>
  );
}

export default GameBase;
