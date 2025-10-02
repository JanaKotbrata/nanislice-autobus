import { useState, useRef, useCallback } from "react";

/**
 * Hook for temporarily showing a count (e.g., of cards) for a certain period.
 * @param {number} timeoutMs - Display duration in ms (default 2000)
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

  useCallback(() => () => clearTimeout(timeoutRef.current), []);

  return [showCounts, triggerShowCounts];
}
