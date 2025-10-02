import Player from "./player.jsx";
import { useContext, useRef, useState, useEffect } from "react";
import PanelActions from "./panel-actions.jsx";
import LanguageContext from "../../../context/language.js";
import GameContext from "../../../context/game.js";
import EmoteContext from "../../../context/emote.js";
import {
  SlotTargets,
  JOKER,
  MIN_ZOOM,
  MAX_ZOOM,
  ZOOM_STEP,
} from "../../../../../shared/constants/game-constants.json";

function PlayerPanel({
  otherPlayers,
  myself,
  leftPanelWidth,
  canResizePanel,
  handlePanelDragStart,
}) {
  const { playerEmotes } = useContext(EmoteContext);
  const dragBarRef = useRef(null);
  const containerRef = useRef(null);
  const playersWrapperRef = useRef(null);
  const gameContext = useContext(GameContext);
  const [needsCollapse, setNeedsCollapse] = useState(false);
  const [allCollapsed, setAllCollapsed] = useState(true); // true = collapsed, false = expanded
  const [zoomLevel, setZoomLevel] = useState(1); // 1 = 100%, min 0.5
  // Zoom handlers
  function handleZoomIn() {
    setZoomLevel((z) => Math.min(MAX_ZOOM, +(z + ZOOM_STEP).toFixed(2)));
  }

  function handleZoomOut() {
    setZoomLevel((z) => Math.max(MIN_ZOOM, +(z - ZOOM_STEP).toFixed(2)));
  }

  const isMyselfJrInBus = myself?.bus[0]?.rank === JOKER;
  const i18n = useContext(LanguageContext);

  useEffect(() => {
    function checkOverflowByContentHeight() {
      if (playersWrapperRef.current && containerRef.current) {
        const contentHeight =
          playersWrapperRef.current.getBoundingClientRect().height;
        const containerHeight = containerRef.current.clientHeight;
        const fits = contentHeight <= containerHeight + 2;
        setNeedsCollapse(!fits);
        setHideScrollbar(fits);
      }
    }

    checkOverflowByContentHeight();
    window.addEventListener("resize", checkOverflowByContentHeight);
    return () =>
      window.removeEventListener("resize", checkOverflowByContentHeight);
  }, [otherPlayers.length, zoomLevel]);

  const [hideScrollbar, setHideScrollbar] = useState(false);

  // Handler for toggling all collapses
  function handleToggleAllCollapse() {
    setAllCollapsed((prev) => !prev);
  }

  const [playersMaxWidth, setPlayersMaxWidth] = useState();
  useEffect(() => {
    if (containerRef.current) {
      const panelWidth = containerRef.current.clientWidth;

      setPlayersMaxWidth(panelWidth / zoomLevel);
    }
  }, [leftPanelWidth, zoomLevel]);

  return (
    <>
      <div
        className="bg-gray-800 text-white p-4 flex flex-col left-bar"
        style={{ width: leftPanelWidth }}
      >
        <div className="flex items-center mb-2 gap-2">
          <h2 className="text-xl font-bold flex-1">
            {i18n.translate("busTitle")}
          </h2>
          <PanelActions
            zoomLevel={zoomLevel}
            MIN_ZOOM={MIN_ZOOM}
            MAX_ZOOM={MAX_ZOOM}
            handleZoomIn={handleZoomIn}
            handleZoomOut={handleZoomOut}
            needsCollapse={needsCollapse}
            allCollapsed={allCollapsed}
            handleToggleAllCollapse={handleToggleAllCollapse}
          />
        </div>
        <div
          ref={containerRef}
          className={`flex-grow overflow-x-hidden sm:max-h-full max-h-[20vh] scrollbar-thin pr-2 -mr-2 ${hideScrollbar ? "overflow-y-hidden" : "overflow-y-auto"}`}
        >
          <div
            ref={playersWrapperRef}
            style={{
              transform: `scale(${zoomLevel})`,
              transformOrigin: "top left",
              width: zoomLevel < 1 ? `${100 / zoomLevel}%` : undefined,
              maxWidth: playersMaxWidth ? `${playersMaxWidth}px` : undefined,
              transition: "transform 0.2s, width 0.2s, max-width 0.2s",
            }}
          >
            {otherPlayers.map((player, index) => (
              <Player
                key={SlotTargets.PLAYER + index}
                player={player}
                isActivePlayer={
                  gameContext.players?.[gameContext.currentPlayer]?.userId ===
                  player?.userId
                }
                isDraggable={false}
                expandable={needsCollapse}
                defaultCollapsed={allCollapsed && needsCollapse}
                emote={playerEmotes[player.userId] || ""}
                visible={!!playerEmotes[player.userId]}
              />
            ))}
          </div>
        </div>
        {myself && (
          <Player
            key={SlotTargets.MYSELF + (gameContext.players.length - 1)}
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
            emote={playerEmotes[myself.userId] || ""}
            visible={!!playerEmotes[myself.userId]}
          />
        )}
      </div>
      <div
        ref={dragBarRef}
        className={`hidden sm:block w-2 ${
          canResizePanel ? "cursor-ew-resize" : ""
        } bg-gray-500`}
        onMouseDown={handlePanelDragStart}
      />
    </>
  );
}

export default PlayerPanel;
