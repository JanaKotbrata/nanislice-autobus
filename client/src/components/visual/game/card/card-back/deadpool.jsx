import "../../../../../styles/deadpool.css";
import { useContext } from "react";
import CardStyleContext from "../../../../../context/card-style-context.js";

function Deadpool({
  card,
  forceStyle,
  size = "w-11 h-16 sm:w-14 sm:h-22 md:w-16 md:h-24 ",
  animated = false,
}) {
  const { getCardBgClass } = useContext(CardStyleContext);
  const bg = card?.bg;
  const bgClass = getCardBgClass(bg, forceStyle);
  return (
    <div
      className={`${size} ${bgClass} flex items-center justify-center rounded-md shadow-lg deadpool-root`}
    >
      <div className="dp-scale">
        <div className="circle">
          <div className="dp">
            <div className="head">
              <div className="eye">
                <div className="shade"></div>
              </div>
              <div className="eye">
                <div className="shade"></div>
              </div>
            </div>
            <div className="neck">
              <div className="band"></div>
              <div className="stripes">
                <div className="stripeLeft"></div>
                <div className="stripeRight"></div>
              </div>
            </div>
            <div className="body"></div>
            <div className="bodyLower">
              <div className="strap"></div>
            </div>
          </div>
        </div>
        <div className="swordContainer">
          <div className="swordLeft sword"></div>
          <div className="swordRight sword"></div>
        </div>
      </div>
    </div>
  );
}

export default Deadpool;
