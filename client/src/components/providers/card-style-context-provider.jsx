import React, { useEffect } from "react";
import CardStyleContext from "../../context/card-style-context.js";
import { CardBgClassMap } from "../../constants/game.js";
import { useAuth } from "./auth-context-provider.jsx";

const LOCAL_STORAGE_KEY = "cardStyle";
const DEFAULT_CARD_STYLE = "classic";

function detectInitialCardStyle(user) {
  if (user?.cardStyle) return user.cardStyle;
  const stored =
    typeof window !== "undefined"
      ? localStorage.getItem(LOCAL_STORAGE_KEY)
      : null;
  if (stored) return stored;
  return DEFAULT_CARD_STYLE;
}

export default function CardStyleContextProvider({ children }) {
  const { user } = useAuth();

  const [cardStyle, setCardStyleState] = React.useState(() =>
    detectInitialCardStyle(user),
  );

  useEffect(() => {
    setCardStyleState(detectInitialCardStyle(user));
  }, [user]);

  useEffect(() => {
    if (cardStyle) {
      localStorage.setItem(LOCAL_STORAGE_KEY, cardStyle);
    }
  }, [cardStyle]);

  function setCardStyle(newStyle) {
    setCardStyleState(newStyle);
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
        availableStyles: [
          { code: DEFAULT_CARD_STYLE },
          { code: "deadpool" },
          { code: "flower" },
          { code: "witcher" },
          { code: "flowerdark" },
          { code: "harrypotter" },
          { code: "starwars" },
        ],
        getCardBgClass,
      }}
    >
      {children}
    </CardStyleContext.Provider>
  );
}
