export const LEVELS = [
  // Low thresholds for testing
  { level: 1, name: "Bronze", minPoints: 0, tapValue: 1 },
  { level: 2, name: "Silver", minPoints: 100, tapValue: 2 },
  { level: 3, name: "Gold", minPoints: 500, tapValue: 3 },
  { level: 4, name: "Platinum", minPoints: 1000, tapValue: 5 },
  { level: 5, name: "Diamond", minPoints: 5000, tapValue: 10 },
  { level: 6, name: "Grandmaster", minPoints: 10000, tapValue: 20 },
];

export const getLevelInfo = (points: number) => {
  const currentLevel =
    LEVELS.slice()
      .reverse()
      .find((l) => points >= l.minPoints) || LEVELS[0];
  const nextLevel = LEVELS.find((l) => l.level === currentLevel.level + 1);

  return {
    ...currentLevel,
    nextLevelPoints: nextLevel ? nextLevel.minPoints : null,
    progress: nextLevel
      ? Math.min(100, (points / nextLevel.minPoints) * 100)
      : 100,
  };
};
