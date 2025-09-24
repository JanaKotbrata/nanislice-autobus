import { useEffect, useRef, useCallback, useState } from "react";

/**
 * useCountdown - univerzální hook pro odpočítávání
 * @param {boolean} active - jestli má odpočítávání běžet
 * @param {number} start - počáteční hodnota
 * @param {function} [onStart] - callback při spuštění
 * @param {function} [onEnd] - callback při skončení
 * @param {function} [onTick] - callback při každém tiknutí
 * @returns [counter, reset]
 */
export function useCountdown(active, start = 30, onStart, onEnd, onTick) {
  const [counter, setCounter] = useState(start);
  const intervalRef = useRef();

  const reset = useCallback(() => setCounter(start), [start]);

  useEffect(() => {
    if (active) {
      setCounter(start);
      if (onStart) onStart();
      intervalRef.current = setInterval(() => {
        setCounter((prev) => {
          if (prev > 1) {
            if (onTick) onTick(prev - 1);
            return prev - 1;
          } else {
            if (onEnd) onEnd();
            clearInterval(intervalRef.current);
            return 0;
          }
        });
      }, 1000);
    } else {
      setCounter(start);
    }
    return () => clearInterval(intervalRef.current);
  }, [active, start]);

  return [counter, reset];
}
