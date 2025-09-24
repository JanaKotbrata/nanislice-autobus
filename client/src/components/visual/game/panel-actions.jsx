import { useContext } from "react";
import LanguageContext from "../../../context/language.js";

function PanelActions({
  zoomLevel,
  MIN_ZOOM,
  MAX_ZOOM,
  handleZoomIn,
  handleZoomOut,
  needsCollapse,
  allCollapsed,
  handleToggleAllCollapse,
}) {
  const i18n = useContext(LanguageContext);
  return (
    <>
      <button
        className="rounded border !border-gray-700 !bg-gray-800 hover:!bg-gray-700 disabled:opacity-50 text-[0.85rem] flex items-center justify-center"
        onClick={handleZoomOut}
        disabled={zoomLevel <= MIN_ZOOM}
        title={i18n.translate("zoomOut")}
        type="button"
        style={{ width: 22, height: 22, padding: 0, boxShadow: "none" }}
      >
        <span style={{ fontSize: "0.95rem", lineHeight: 1, fontWeight: 500 }}>
          −
        </span>
      </button>
      <button
        className="rounded border !border-gray-700 !bg-gray-800 hover:!bg-gray-700 disabled:opacity-50 text-[0.85rem] flex items-center justify-center"
        onClick={handleZoomIn}
        disabled={zoomLevel >= MAX_ZOOM}
        title={i18n.translate("zoomIn")}
        type="button"
        style={{ width: 22, height: 22, padding: 0, boxShadow: "none" }}
      >
        <span style={{ fontSize: "0.95rem", lineHeight: 1, fontWeight: 500 }}>
          +
        </span>
      </button>
      {needsCollapse && (
        <button
          className="rounded border !border-gray-700 !bg-gray-800 hover:!bg-gray-700 text-[0.85rem] flex items-center justify-center"
          onClick={handleToggleAllCollapse}
          title={
            allCollapsed
              ? i18n.translate("expandAll")
              : i18n.translate("colapseAll")
          }
          type="button"
          style={{ width: 22, height: 22, padding: 0, boxShadow: "none" }}
        >
          {allCollapsed ? (
            <span
              aria-label="expand all"
              title={i18n.translate("expandAll")}
              style={{ fontSize: "0.8rem", lineHeight: 1 }}
            >
              ▼
            </span>
          ) : (
            <span
              aria-label="collapse all"
              title={i18n.translate("colapseAll")}
              style={{ fontSize: "0.8rem", lineHeight: 1 }}
            >
              ▲
            </span>
          )}
        </button>
      )}
    </>
  );
}

export default PanelActions;
