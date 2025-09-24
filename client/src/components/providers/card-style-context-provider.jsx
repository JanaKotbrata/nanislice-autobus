import React, { useEffect } from "react";
import CardStyleContext from "../../context/card-style-context.js";
import { CardBgClassMap } from "../../constants/game.js";
import { useAuth } from "./auth-context-provider.jsx";

const LOCAL_STORAGE_KEY = "cardStyle";
const DEFAULT_CARD_STYLE = "classic";

function detectInitialCardStyle(user) {
  // 1. User preference from DB
  if (user?.cardStyle) return user.cardStyle;
  // 2. Browser localStorage
  const stored =
    typeof window !== "undefined"
      ? localStorage.getItem(LOCAL_STORAGE_KEY)
      : null;
  if (stored) return stored;
  // 3. Default value
  return DEFAULT_CARD_STYLE;
}

export default function CardStyleContextProvider({ children }) {
  const { user } = useAuth();

  const [cardStyle, setCardStyleState] = React.useState(() =>
    detectInitialCardStyle(user),
  );

  // Update card style when user changes (priority: user, localStorage, default)
  useEffect(() => {
    setCardStyleState(detectInitialCardStyle(user));
  }, [user]);

  // Save card style to localStorage on change
  useEffect(() => {
    if (cardStyle) {
      localStorage.setItem(LOCAL_STORAGE_KEY, cardStyle);
    }
  }, [cardStyle]);

  function setCardStyle(newStyle) {
    setCardStyleState(newStyle);
    // localStorage is set in useEffect
  }

  function getCardBgClass(background, forceStyle) {
    const cardBgClassMap =
      CardBgClassMap[forceStyle ?? cardStyle] ||
      CardBgClassMap[DEFAULT_CARD_STYLE];
    const bgKey = background?.toUpperCase();
    if (bgKey in cardBgClassMap) {
      return cardBgClassMap[bgKey];
    } else {
      return Math.random() < 0.5 ? cardBgClassMap.RED : cardBgClassMap.BLUE;
    }
  }

  return (
    <CardStyleContext.Provider
      value={{
        cardStyle,
        setCardStyle,
        availableStyles: [{ code: DEFAULT_CARD_STYLE }, { code: "witcher" }],
        getCardBgClass,
      }}
    >
      {children}
    </CardStyleContext.Provider>
  );
}
