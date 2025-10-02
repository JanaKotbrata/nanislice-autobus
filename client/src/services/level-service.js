function getUnlockedStyleIfAny(myXpObj, availableStyles) {
  let unlockedStyle = null;
  if (isLevelUnlockingNewStyle(myXpObj)) {
    for (let i = 1; i < availableStyles.length; i++) {
      if (getUnlockLevel(i) === myXpObj.level) {
        unlockedStyle = availableStyles[i];
        break;
      }
    }
  }
  return unlockedStyle;
}
function isLevelUnlockingNewStyle(myXpObj) {
  if (!myXpObj?.level) return false;
  const prevLevel = myXpObj.level - 1;
  const levelForUnlock = getUnlockLevel(prevLevel);
  return levelForUnlock === myXpObj.level;
}

// Classic is always unlocked. Other styles unlock at increasing levels.
function getUnlockLevel(index) {
  if (index === 0) return 0; // classic
  // Progressive unlock: first unlock at 5, then +4, +5, +6, ... (no max step)
  let level = 2;
  for (let i = 1; i < index; i++) {
    level += 3 + i; // increases by 4, 5, 6, 7, ...
  }
  return level;
}
export { getUnlockLevel, isLevelUnlockingNewStyle, getUnlockedStyleIfAny };
