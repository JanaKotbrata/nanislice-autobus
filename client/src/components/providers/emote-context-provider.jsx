import { useState, useCallback } from "react";
import EmoteContext from "../../context/emote.js";
import { socket } from "../../services/create-socket.js";
import Events from "../../../../shared/constants/websocket-events.json";
import { useAuth } from "./auth-context-provider.jsx";
import { useGameSocket } from "../../hooks/use-game-socket.js";

export default function EmoteContextProvider({ children }) {
  const [disabled, setDisabled] = useState(false);
  const [playerEmotes, setPlayerEmotes] = useState({});
  const { user } = useAuth();

  const handleEmote = useCallback(({ userId, emote }) => {
    setPlayerEmotes((prev) => ({ ...prev, [userId]: emote }));
    setTimeout(() => {
      setPlayerEmotes((prev) => ({ ...prev, [userId]: null }));
    }, 2500);
  }, []);

  const sendEmote = useCallback(({ userId, gameCode, playerName, emote }) => {
    setDisabled(true);
    setPlayerEmotes((prev) => ({ ...prev, [userId]: emote }));
    setTimeout(() => {
      setPlayerEmotes((prev) => ({ ...prev, [userId]: null }));
      setDisabled(false);
    }, 2500);
    socket.emit(Events.PLAYER_SENT_EMOTE, {
      userId,
      gameCode,
      playerName,
      emote,
    });
  }, []);

  useGameSocket(
    user?.id,
    () => {},
    () => {},
    handleEmote,
  );

  return (
    <EmoteContext.Provider
      value={{ playerEmotes, setPlayerEmotes, sendEmote, disabled }}
    >
      {children}
    </EmoteContext.Provider>
  );
}
