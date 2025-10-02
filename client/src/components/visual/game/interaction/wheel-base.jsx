import { useEffect, useState } from "react";

function getSegmentPath(cx, cy, r, startAngle, endAngle) {
  const start = {
    x: cx + r * Math.cos(startAngle),
    y: cy + r * Math.sin(startAngle),
  };
  const end = {
    x: cx + r * Math.cos(endAngle),
    y: cy + r * Math.sin(endAngle),
  };
  const largeArcFlag = endAngle - startAngle <= Math.PI ? 0 : 1;
  return [
    `M ${cx} ${cy}`,
    `L ${start.x} ${start.y}`,
    `A ${r} ${r} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`,
    "Z",
  ].join(" ");
}

function WheelBase({
  open,
  items,
  onCenterClick,
  centerIcon,
  size: propSize,
  minSize = 140,
  maxSize = 340,
  buttonSizeRatio = 0.18,
}) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [size, setSize] = useState(propSize || 320);
  useEffect(() => {
    if (propSize) return;
    function handleResize() {
      setSize(
        Math.max(
          minSize,
          Math.min(maxSize, Math.round(window.innerWidth * 0.5)),
        ),
      );
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [propSize, minSize, maxSize]);
  if (!open) return null;
  const count = items.length;
  const radius = size / 2 - 20;
  const center = size / 2;

  const gapAngle = 0.06;
  const segmentAngle = (2 * Math.PI) / count;
  const segmentFillAngle = segmentAngle - gapAngle;
  const buttonSize = Math.max(32, Math.min(56, size * buttonSizeRatio));
  return (
    <div
      className="z-50 fixed emote-wheel-base emote-wheel-pos"
      style={{
        "--emote-wheel-size": `${size}px`,
        width: size,
        height: size,
      }}
    >
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="absolute left-0 top-0 pointer-events-none select-none"
        >
          <defs>
            <filter
              id="glass-blur"
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
            >
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feColorMatrix
                in="blur"
                type="matrix"
                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.18 0"
                result="glass"
              />
              <feBlend in="SourceGraphic" in2="glass" mode="normal" />
            </filter>
            <filter
              id="wheel-shadow"
              x="-30%"
              y="-30%"
              width="160%"
              height="160%"
            >
              <feDropShadow
                dx="0"
                dy="4"
                stdDeviation="12"
                floodColor="#283c78"
                floodOpacity="0.22"
              />
            </filter>
          </defs>
          <circle
            cx={center}
            cy={center}
            r={radius + 18}
            fill="rgba(255,255,255,0.15)"
            filter="url(#glass-blur) url(#wheel-shadow)"
          />
          {items.map((_, i) => {
            const startAngle = -Math.PI / 2 + i * segmentAngle + gapAngle / 2;
            const endAngle = startAngle + segmentFillAngle;
            return (
              <path
                key={i}
                d={getSegmentPath(center, center, radius, startAngle, endAngle)}
                fill="rgba(255,255,255,0.32)"
                stroke="#f3f3f331"
                strokeWidth={1.4}
              />
            );
          })}
        </svg>
        <svg
          width={size}
          height={size}
          className="absolute left-0 top-0 pointer-events-auto select-none z-10"
          style={{ pointerEvents: "auto" }}
        >
          {items.map((item, i) => {
            const startAngle = -Math.PI / 2 + i * segmentAngle + gapAngle / 2;
            const endAngle = startAngle + segmentFillAngle;
            const midAngle = (startAngle + endAngle) / 2;
            const iconRadius = (radius + 40) / 2;
            const iconX = center + iconRadius * Math.cos(midAngle);
            const iconY = center + iconRadius * Math.sin(midAngle);
            const isHovered = hoveredIndex === i;
            return (
              <g
                key={item.label}
                style={{
                  cursor: item.disabled ? "not-allowed" : "pointer",
                  opacity: item.disabled ? 0.5 : 1,
                }}
              >
                <path
                  d={getSegmentPath(
                    center,
                    center,
                    radius,
                    startAngle,
                    endAngle,
                  )}
                  fill={isHovered ? "rgba(255,255,255,0.40)" : "#fff"}
                  fillOpacity={isHovered ? 0.4 : 0.18}
                  stroke={isHovered ? "#fff" : "transparent"}
                  strokeWidth={1.2}
                  onClick={item.disabled ? undefined : item.onClick}
                  aria-label={item.label}
                  tabIndex={item.disabled ? -1 : 0}
                  style={{
                    transition: "fill 0.15s, stroke 0.15s",
                    pointerEvents: item.disabled ? "none" : "auto",
                  }}
                  onKeyDown={(e) => {
                    if (!item.disabled && (e.key === "Enter" || e.key === " "))
                      item.onClick();
                  }}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onFocus={() => setHoveredIndex(i)}
                  onBlur={() => setHoveredIndex(null)}
                />
                {item.icon ? (
                  <foreignObject
                    x={iconX - buttonSize / 2}
                    y={iconY - buttonSize / 2}
                    width={buttonSize}
                    height={buttonSize}
                    pointerEvents="none"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <div
                      style={{
                        width: buttonSize,
                        height: buttonSize,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: buttonSize * 0.7,
                      }}
                      className={item.className || ""}
                    >
                      {item.icon}
                    </div>
                  </foreignObject>
                ) : (
                  (() => {
                    const maxCharsPerLine = Math.max(
                      7,
                      Math.floor((segmentFillAngle * radius * 0.55) / 10),
                    );
                    const words = item.label.split(" ");
                    const lines = [];
                    let currentLine = "";
                    for (let w = 0; w < words.length; w++) {
                      if (
                        (currentLine + " " + words[w]).trim().length <=
                        maxCharsPerLine
                      ) {
                        currentLine = (currentLine + " " + words[w]).trim();
                      } else {
                        if (currentLine) lines.push(currentLine);
                        currentLine = words[w];
                      }
                    }
                    if (currentLine) lines.push(currentLine);
                    let fontSize = buttonSize * 0.34;
                    if (
                      typeof window !== "undefined" &&
                      window.innerWidth <= 662
                    ) {
                      fontSize *= 0.78;
                    }
                    if (lines.length > 2) fontSize *= 0.92;
                    if (lines.length > 3) fontSize *= 0.85;
                    const lineHeight = fontSize * 1.18;
                    const totalHeight = lineHeight * lines.length;
                    const yStart = iconY - totalHeight / 2 + lineHeight / 2;
                    return (
                      <text
                        x={iconX}
                        y={yStart}
                        textAnchor="middle"
                        fontSize={fontSize}
                        fill="#222"
                        stroke="#fff"
                        strokeWidth={fontSize * 0.18}
                        paintOrder="stroke fill"
                        style={{
                          pointerEvents: "none",
                          fontWeight: 600,
                          userSelect: "none",
                          fontFamily: "inherit",
                        }}
                      >
                        {lines.map((line, idx) => (
                          <tspan
                            x={iconX}
                            dy={idx === 0 ? 0 : lineHeight}
                            key={idx}
                          >
                            {line}
                          </tspan>
                        ))}
                      </text>
                    );
                  })()
                )}
              </g>
            );
          })}
        </svg>
        {centerIcon && (
          <button
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center !p-0 !rounded-full !bg-gray-900/70 !backdrop-blur-md !border !border-white/30 !shadow-lg hover:!bg-gray-800/90 hover:!border-white/60 !text-purple-500 text-2xl"
            onClick={onCenterClick}
            type="button"
            style={{ width: buttonSize + 8, height: buttonSize + 8 }}
          >
            {centerIcon}
          </button>
        )}
      </div>
    </div>
  );
}

export default WheelBase;
