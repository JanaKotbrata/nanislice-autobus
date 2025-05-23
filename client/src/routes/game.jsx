import React, { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Player from "./game/player.jsx";
import GameBoard from "./game/game-board.jsx";
import GameContextProvider from "../components/providers/game-context-provider.jsx";
import GameContext from "../context/game.js";
import axios from "axios";
import Routes from "../../../shared/constants/routes.json";

function Game() {
  const { code } = useParams();
  const [players, setPlayers] = useState([]);
  const [game, setGame] = useState(null);
  const [leftWidth, setLeftWidth] = useState(350);
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef(null);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const res = await getGame(code);
        setPlayers(res.data.playerList);
        setGame(res.data); //FIXME - dřív fungoval gameContext a teď hovno - potřebuju to zpět - protože teď se mi sice vykresluje ruka a playeři, ale zbytek ne..
      } catch (err) {
        console.error("Nepodařilo se načíst hráče:", err);
      }
    };

    fetchPlayers();
  }, [code]);

  const handleMouseDown = () => {
    setDragging(true);
    document.body.style.cursor = "ew-resize";
  };

  const handleMouseMove = (e) => {
    if (!dragging) return;
    const newWidth = Math.max(200, leftWidth + e.movementX);
    setLeftWidth(newWidth); // aktualizace šířky levé sekce
  };

  const handleMouseUp = () => {
    setDragging(false);
    document.body.style.cursor = "default"; // obnovení výchozího kurzoru
  };
  const getGame = async (code) => {
    //FIXME - mělo by fungovat toto - await axios.get(Routes.Game.GET, {
    //           params: {
    //             id: error.response.data.gameId,
    //           },
    //         });
    return await axios.get(Routes.Game.GET + `?code=${code}`);
  };
  const getPlayers = (players) => {
    let newPlayers = [...players];
    let index = newPlayers.findIndex((player) => player?.myself);
    let myself = newPlayers.splice(index, 1)[0];
    return [myself, newPlayers];
  };
  if (!players)
    return (
      <div className="flex items-center justify-center h-full w-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );

  return (
    <GameContextProvider game={game}>
      <DndProvider backend={HTML5Backend}>
        <GameContext.Consumer>
          {(gameContext) => {
            const [myself, players] = getPlayers(gameContext?.players);
            return (
              <div
                className="flex flex-col sm:flex-row w-full h-full p-1 bg-gray-800"
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
              >
                {/* Levá sekce - Hráči */}
                <div
                  className="bg-gray-800 text-white p-4 flex flex-col"
                  style={{ width: leftWidth }}
                >
                  <h2 className="text-xl font-bold mb-4">Autobusácí</h2>
                  <div className="flex-grow">
                    {players.map((player, index) => (
                      <Player
                        key={index}
                        player={player}
                        isActivePlayer={
                          gameContext.players?.[gameContext.currentPlayer]
                            ?.userId === player?.userId
                        }
                      />
                    ))}
                  </div>
                  {myself && (
                    <Player
                      key={gameContext.players.length - 1}
                      player={myself}
                      isActivePlayer={
                        gameContext.players?.[gameContext.currentPlayer]
                          ?.userId === myself?.userId
                      }
                    />
                  )}
                </div>
                {/* Resize lišta */}
                <div
                  ref={dragRef}
                  className="w-2 cursor-ew-resize bg-gray-500"
                  onMouseDown={handleMouseDown}
                />

                {/* Pravá sekce - Hrací pole */}
                <div className="flex-grow bg-gray-200 p-6">
                  <GameBoard
                    player={gameContext.players.find((p) => p.myself)}
                    cardPack={gameContext.deck}
                  />
                </div>
              </div>
            );
          }}
        </GameContext.Consumer>
      </DndProvider>
    </GameContextProvider>
  );
}

export default Game;
