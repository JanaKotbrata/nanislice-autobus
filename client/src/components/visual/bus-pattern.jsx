import React, { useState, useEffect } from "react";

function BusPattern() {
  const cardWidth = 20;
  const cardHeight = 40;
  const gapX = 4; // mezera mezi sloupci
  const gapY = 6; // mezera mezi řádky

  const cellWidth = cardWidth + gapX;
  const cellHeight = cardHeight + gapY;

  const logoWidth = 44.831985;
  const logoHeight = 41.93;
  const scale = (cardWidth * 0.6) / logoWidth;
  const translateX = cardWidth / 2 - (76 + logoWidth / 2) * scale;
  const translateY = cardHeight / 2 - (98 + logoHeight / 2) * scale;

  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const cols = Math.ceil(windowSize.width / cellWidth) + 1;
  const rows = Math.ceil(windowSize.height / cellHeight) + 1;

  function renderBus(x, y, key) {
    const busScale = 0.17; // upraveno experimentálně tak, aby měl výšku cca 40

    return (
      <g key={key} transform={`translate(${x}, ${y}) scale(${busScale})`}>
        <g transform="translate(11.822678,-24.361882)">
          <g transform="matrix(4.4097222,0,0,4.4097222,-6.2364483,99.09314)">
            <circle
              cx="15.7778"
              cy="28.4965"
              r="4.1111"
              style={{ fill: "none", stroke: "gray", strokeOpacity: 0.6 }}
            />
            <circle
              cx="32.2222"
              cy="28.4965"
              r="4.1111"
              style={{ fill: "none", stroke: "gray", strokeOpacity: 0.6 }}
            />
            <circle
              cx="15.7778"
              cy="28.4965"
              r="1.5417"
              style={{ fill: "none", stroke: "gray", strokeOpacity: 0.6 }}
            />
            <circle
              cx="32.2222"
              cy="28.4965"
              r="1.5417"
              style={{ fill: "none", stroke: "gray", strokeOpacity: 0.6 }}
            />
          </g>
          <g transform="matrix(4.4097222,0,0,4.4097222,-6.2364483,99.09314)">
            <path
              d="m 19.8889,28.4965 h 8.2222"
              style={{ fill: "none", stroke: "gray", strokeOpacity: 0.6 }}
            />
            <path
              d="M 11.6667,28.4965 H 7.5556 C 6.5278,28.4965 5.5,27.4687 5.5,26.4409 V 9.9965 C 5.5,8.9687 6.5278,7.9409 7.5556,7.9409 h 32.8889 c 1.0278,0 2.0556,1.0278 2.0556,2.0556 v 16.4444 c 0,1.0278 -1.0278,2.0556 -2.0556,2.0556 h -4.1111"
              style={{ fill: "none", stroke: "gray", strokeOpacity: 0.6 }}
            />
            <path
              d="m 5.5,20.2743 8.2222,-2.5694 H 38.3889 V 11.0243 H 5.5"
              style={{ fill: "none", stroke: "gray", strokeOpacity: 0.6 }}
            />
            <path
              d="m 13.7222,11.0243 v 6.6806"
              style={{ fill: "none", stroke: "gray", strokeOpacity: 0.6 }}
            />
            <path
              d="M 22.9722,17.7049 V 11.0243"
              style={{ fill: "none", stroke: "gray", strokeOpacity: 0.6 }}
            />
            <path
              d="M 32.2222,17.7049 V 11.0243"
              style={{ fill: "none", stroke: "gray", strokeOpacity: 0.6 }}
            />
          </g>
        </g>
      </g>
    );
  }

  function renderCard(x, y, key) {
    return (
      <g key={key} transform={`translate(${x}, ${y})`}>
        <rect
          x="1"
          y="1"
          width={cardWidth}
          height={cardHeight}
          rx="5"
          ry="5"
          stroke="gray"
          strokeOpacity="0.6"
          strokeWidth="1"
          fill="none"
        />
        <g
          transform={`translate(${translateX}, ${translateY}) scale(${scale})`}
        >
          <path
            d="m 80.497209,114.46946 22.044881,-15.6829 21.88712,15.61413 -8.46397,25.41587 H 89.229869 Z"
            fill="#02f3e9"
            fillOpacity={0.4}
            stroke="#261546"
            strokeWidth="0.9"
            strokeOpacity="0.9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="m 115.89593,138.62682 0.25232,-3.87828 0.25232,-3.87827 -0.6009,-0.81276 c -1.07663,-1.30465 0.83906,-2.7237 2.2081,-2.80932 3.39294,-0.21221 10.53624,-0.47801 8.26285,3.44113 v 4.23333 4.23333 l -4.92381,0.0718 -4.92381,0.0719 c -0.51299,-0.007 -0.54098,0.0998 -0.52707,-0.67286 z m 11.31756,-7.67292 c 2.03815,-4.01892 -2.70488,-4.4748 -5.38679,-4.57881 l -2.85643,-0.11077 0.0974,-0.30104 c 2.13349,-1.78443 4.75831,-1.77913 7.20533,-1.55616 2.31942,0.36223 4.2745,1.61953 3.88021,2.70407 l -0.61534,0.83276 c 0.2012,2.78707 0.30549,6.00897 0.24807,8.43391 h -1.1277 -1.1277 c -0.10327,-2.27433 -0.3236,-3.5364 -0.31701,-5.42396 z m 3.42258,-2.86875 0.36558,-0.41771 c 1.82778,-2.81982 -3.83963,-4.06116 -5.78954,-4.1526 l -2.91042,-0.10386 c 0.81996,-1.77294 4.42653,-2.07294 6.73505,-1.80387 1.74552,0.20345 5.58578,0.90126 4.64232,2.49859 l -0.50356,0.76278 0.0775,4.29948 0.0775,4.29948 h -1.18029 -1.18029 c -0.35182,-1.80703 -0.33241,-3.87928 -0.33385,-5.38229 z"
            fill="#261546"
            strokeOpacity="0.1"
            strokeWidth={2}
            transform="translate(-21, -9)"
          />
        </g>
      </g>
    );
  }

  const buses = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      buses.push({ x: x * cellWidth, y: y * cellHeight });
    }
  }

  return (
    <svg
      className="absolute inset-0 overflow-hidden"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMinYMin meet"
      fill="none"
      stroke="gray"
      strokeOpacity="0.1"
      strokeWidth={1}
      viewBox={`0 0 ${windowSize.width} ${windowSize.height}`}
    >
      {buses.map(({ x, y }, i) => {
        if (Math.random() < 0.75) return null;

        return Math.random() > 0.3 ? renderBus(x, y, i) : renderCard(x, y, i);
      })}
    </svg>
  );
}

export default BusPattern;
