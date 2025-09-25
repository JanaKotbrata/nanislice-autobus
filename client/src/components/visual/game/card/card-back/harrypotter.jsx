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
      <svg
        className="harrypotter-window-svg"
        width="52.04311mm"
        height="162.30765mm"
        viewBox="0 0 52.04311 162.30765"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"
        xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd"
        xmlns:svg="http://www.w3.org/2000/svg"
      >
        <g
          inkscape:label="Vrstva 1"
          inkscape:groupmode="layer"
          id="layer1"
          transform="translate(-331.22037,-119.51381)"
        >
          <rect
            style={{ fill: "#554400", fillOpacity: 1, strokeWidth: 0.104586 }}
            id="rect127"
            width="2.590133"
            height="109.75691"
            x="355.12271"
            y="172.06456"
            ry="1.5000944"
          />
          <ellipse
            style={{
              fill: "none",
              fillOpacity: 1,
              stroke: "#554400",
              strokeWidth: 2.59504,
              strokeDasharray: "none",
              strokeOpacity: 1,
            }}
            id="path127"
            cx="357.24194"
            cy="147.06299"
            rx="24.724035"
            ry="26.251652"
          />
        </g>
      </svg>
      <div className="harrypotter-frame">
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
