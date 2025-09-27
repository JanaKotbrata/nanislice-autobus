import "../../../../../styles/harrypotter.css";
import { useContext } from "react";
import CardStyleContext from "../../../../../context/card-style-context.js";

function HarryPotter({
  card,
  forceStyle,
  size = "w-11 h-16 sm:w-14 sm:h-22 md:w-16 md:h-24 ",
}) {
  const { getCardBgClass } = useContext(CardStyleContext);
  const bg = card?.bg;
  const bgClass = getCardBgClass(bg, forceStyle);
  return (
    <div
      className={`${size} ${bgClass} flex items-center justify-center rounded-lg shadow-lg harrypotter-card-back`}
      style={{ position: "relative" }}
    >
      {/* Quidditch goals as background */}
      <div
        className="absolute left-0 right-0 flex flex-row items-end justify-center gap-2"
        style={{ top: "11%", zIndex: 1, pointerEvents: "none", left: "-9px" }}
      >
        {/* Left goal - shorter */}
        <svg
          className="harrypotter-window-svg"
          width="52"
          height="80"
          viewBox="0 0 52.04311 162.30765"
          style={{ minWidth: 52, height: 80 }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <g transform="translate(-300.22037,-75.51381)">
            <rect style={{ fill: "#554400", fillOpacity: 1, strokeWidth: 0.104586 }} width="2.590133" height="70" x="355.12271" y="165.06456" ry="1.5" />
            <ellipse style={{ fill: "none", stroke: "#554400", strokeWidth: 2.59504 }} cx="357.24194" cy="147.06299" rx="18" ry="18" />
          </g>
        </svg>
        {/* Center goal - tallest */}
        <svg
          className="harrypotter-window-svg"
          width="52"
          height="80"
          viewBox="0 0 52.04311 162.30765"
          style={{ minWidth: 52, height: 80 }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <g transform="translate(-331.22037,-119.51381)">
            <rect style={{ fill: "#554400", fillOpacity: 1, strokeWidth: 0.104586 }} width="2.590133" height="109.75691" x="355.12271" y="172.06456" ry="1.5" />
            <ellipse style={{ fill: "none", stroke: "#554400", strokeWidth: 2.59504 }} cx="357.24194" cy="147.06299" rx="24.724035" ry="26.251652" />
          </g>
        </svg>
        {/* Right goal - shorter */}
        <svg
          className="harrypotter-window-svg"
          width="52"
          height="80"
          viewBox="0 0 52.04311 162.30765"
          style={{ minWidth: 52, height: 80 }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <g transform="translate(-362.22037,-55.51381)">
            <rect style={{ fill: "#554400", fillOpacity: 1, strokeWidth: 0.104586 }} width="2.590133" height="70" x="355.12271" y="165.06456" ry="1.5" />
            <ellipse style={{ fill: "none", stroke: "#554400", strokeWidth: 2.59504 }} cx="357.24194" cy="147.06299" rx="18" ry="18" />
          </g>
        </svg>
      </div>
      {/* Foreground: snitch */}
      <div className="harrypotter-frame" style={{ position: "relative", zIndex: 2 }}>
        <div className="snitch">
          <div className="obj animate-always">
            <div className="snitch-body">
              <div className="flourish"></div>
              <div className="flourish"></div>
              <div className="flourish"></div>
              <div className="flourish">
                <div className="line"></div>
                <div className="line"></div>
                <div className="line"></div>
              </div>
              <div className="flourish">
                <div className="line"></div>
                <div className="line"></div>
                <div className="line"></div>
              </div>
              <div className="shadow animate-always-shadow"></div>
            </div>
            <div className="l joint"></div>
            <div className="l wing">
              <div className="feather"></div>
              <div className="feather"></div>
              <div className="feather"></div>
              <div className="feather"></div>
              <div className="feather"></div>
              <div className="feather"></div>
              <div className="feather"></div>
              <div className="feather"></div>
              <div className="feather"></div>
            </div>
            <div className="r joint"></div>
            <div className="r wing">
              <div className="feather"></div>
              <div className="feather"></div>
              <div className="feather"></div>
              <div className="feather"></div>
              <div className="feather"></div>
              <div className="feather"></div>
              <div className="feather"></div>
              <div className="feather"></div>
              <div className="feather"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default HarryPotter;
