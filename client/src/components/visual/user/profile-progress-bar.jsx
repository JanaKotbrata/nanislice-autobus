function xpForLevel(lvl) {
  return 50 * lvl * (lvl - 1);
}

function ProgressBar({ level, xp, i18n }) {
  const currentLevelXp = xpForLevel(level);
  const nextLevelXp = xpForLevel(level + 1);
  const xpPercent = Math.max(
    0,
    Math.min(
      ((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100,
      100,
    ),
  );
  return (
    <div className="w-full text-left">
      <p className="text-sm text-gray-300 mb-1">{i18n.translate("earnedXp")}</p>
      <div className="w-full bg-gray-700 h-4 rounded-full overflow-hidden relative">
        <div
          className="bg-green-500 h-full transition-all duration-300"
          style={{ width: `${xpPercent}%` }}
        />
        <span
          className="absolute top-1/2 -translate-y-1/2 text-sm"
          style={{ left: `calc(${xpPercent}% - 10px)` }}
        >
          🚌
        </span>
      </div>
      <p className="text-xs text-gray-400 text-right mt-1">{xp} XP</p>
    </div>
  );
}

export default ProgressBar;
