import { useEffect, useRef } from "react";

/**
 * useTickingSound - spustí/zastaví zvuk podle booleanu
 * @param {boolean} active - má zvuk hrát?
 * @param {function} playSound - funkce na přehrání zvuku, vrací audio objekt
 * @param {string} src - cesta ke zvuku
 * @param {boolean} loop - má zvuk loopovat?
 */
export function useTickingSound(active, playSound, src, loop = true) {
  const audioRef = useRef(null);

  useEffect(() => {
    if (active) {
      audioRef.current = playSound(src, loop);
    } else if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }
    };
  }, [active, playSound, src, loop]);
}
