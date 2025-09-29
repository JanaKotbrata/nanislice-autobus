import { useEffect, useRef } from "react";

/**
 * useTickingSound - starts/stops sound based on boolean
 * @param {boolean} active - should the sound play?
 * @param {function} playSound - function to play sound, returns audio object
 * @param {string} src - path to sound
 * @param {boolean} loop - should the sound loop?
 */
export function useTickingSound(active, playSound, src, loop = true) {
  const audioRef = useRef(null);

  useEffect(() => {
    if (active) {
      audioRef.current = playSound(src, loop);
    } else if (audioRef.current) {
      audioRef.current.stopAndRemove();
      audioRef.current = null;
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.stopAndRemove();
        audioRef.current = null;
      }
    };
  }, [active, playSound, src, loop]);
}
