import { useRef, useState } from "react";
import SlotContext from "../../context/slot.js";

function SlotContextProvider({ children }) {
  const slotRefs = useRef({});
  const [activeSlot, setActiveSlot] = useState(null);

  function setSlotRef(lookupIndex, index, el, handler) {
    if (el) {
      slotRefs.current[lookupIndex] = {
        index,
        el,
        handler,
        rect: el.getBoundingClientRect(),
      };
    }
  }

  function unsetSlotRef(lookupIndex) {
    if (slotRefs.current[lookupIndex]) {
      delete slotRefs.current[lookupIndex];
    }
  }

  function getActiveSlot() {
    return activeSlot;
  }

  function safeSetActiveSlot(lookupIndex) {
    if (lookupIndex !== activeSlot) {
      setActiveSlot(lookupIndex);
    }
  }

  function getSlotRects() {
    return Object.entries(slotRefs.current)
      .map(([lookupIndex, slot]) => {
        if (!slot?.el) return null;
        return {
          index: slot.index,
          lookupIndex,
          handler: slot.handler,
          rect: slot.el.getBoundingClientRect(),
        };
      })
      .filter(Boolean);
  }

  return (
    <SlotContext.Provider
      value={{
        setSlotRef,
        getSlotRects,
        unsetSlotRef,
        getActiveSlot,
        setActiveSlot: safeSetActiveSlot,
      }}
    >
      {children}
    </SlotContext.Provider>
  );
}
export default SlotContextProvider;
