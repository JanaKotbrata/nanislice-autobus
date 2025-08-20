import Player from "./player.jsx";
import React, { useContext, useRef } from "react";
import LanguageContext from "../../../context/language.js";
import GameContext from "../../../context/game.js";

function PlayerPanel({
  otherPlayers,
  myself,
  leftPanelWidth,
  canResizePanel,
  handlePanelDragStart,
}) {
  const dragBarRef = useRef(null);
  const gameContext = useContext(GameContext);
  const tooManyPlayers = otherPlayers.length > 3;
  const isMyselfJrInBus = myself.bus[0]?.rank === "Jr";
  const i18n = useContext(LanguageContext);
  return (
    <>
      <div
        className="bg-gray-800 text-white p-4 flex flex-col left-bar"
        style={{ width: leftPanelWidth }}
      >
        <h2 className="text-xl font-bold mb-4">{i18n.translate("busTitle")}</h2>
        <div className="flex-grow overflow-y-auto sm:max-h-full max-h-[20vh] scrollbar-thin pr-2 -mr-2">
          {otherPlayers.map((player, index) => (
            <Player
              key={"player_" + index}
              player={player}
              isActivePlayer={
                gameContext.players?.[gameContext.currentPlayer]?.userId ===
                player?.userId
              }
              isDraggable={false}
              expandable={tooManyPlayers}
            />
          ))}
        </div>
        {myself && (
          <Player
            key={"myself_" + (gameContext.players.length - 1)}
            player={myself}
            isActivePlayer={
              gameContext.players?.[gameContext.currentPlayer]?.userId ===
              myself?.userId
            }
            isDraggable={
              gameContext.players?.[gameContext.currentPlayer]?.userId ===
              myself?.userId
            }
            isMyself={true}
            isMyselfJrInBus={isMyselfJrInBus}
          />
        )}
      </div>
      <div
        ref={dragBarRef}
        className={`hidden sm:block w-2 ${canResizePanel ? "cursor-ew-resize" : ""} bg-gray-500`}
        onMouseDown={handlePanelDragStart}
      />
    </>
  );
}

export default PlayerPanel;
