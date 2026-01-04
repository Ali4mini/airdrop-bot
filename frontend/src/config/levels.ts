export const LEVELS = [
  // minPoints: Threshold to reach this level
  // tapValue: How many points per tap
  // energyRegen: How much energy refills per second
  { level: 1, name: "Bronze", minPoints: 0, tapValue: 1, energyRegen: 1 },
  { level: 2, name: "Silver", minPoints: 100, tapValue: 2, energyRegen: 2 },
  { level: 3, name: "Gold", minPoints: 500, tapValue: 3, energyRegen: 3 },
  { level: 4, name: "Platinum", minPoints: 1000, tapValue: 5, energyRegen: 5 },
  { level: 5, name: "Diamond", minPoints: 5000, tapValue: 10, energyRegen: 10 },
  {
    level: 6,
    name: "Grandmaster",
    minPoints: 10000,
    tapValue: 20,
    energyRegen: 15,
  },
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
