import { useState, useRef, useCallback } from "react";

/**
 * Hook pro dočasné zobrazení počtu (např. karet) na určitou dobu.
 * @param {number} timeoutMs - Doba zobrazení v ms (default 2000)
 * @returns [showCounts, triggerShowCounts]
 */
export function useShowCounts(timeoutMs = 2000) {
  const [showCounts, setShowCounts] = useState(false);
  const timeoutRef = useRef(null);

  const triggerShowCounts = useCallback(() => {
    setShowCounts(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setShowCounts(false), timeoutMs);
  }, [timeoutMs]);

  // Vyčisti timeout při unmountu
  useCallback(() => () => clearTimeout(timeoutRef.current), []);

  return [showCounts, triggerShowCounts];
}
