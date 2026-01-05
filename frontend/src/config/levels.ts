import type { LevelInfo } from "../types";

export const LEVELS: Omit<LevelInfo, "nextLevelPoints" | "progress">[] = [
  // tapValue here is the BASE value provided by the League
  // energyRegen is the BASE regen provided by the League
  { level: 1, name: "Bronze", minPoints: 0, tapValue: 1, energyRegen: 1 },
  { level: 2, name: "Silver", minPoints: 100, tapValue: 2, energyRegen: 1 },
  { level: 3, name: "Gold", minPoints: 500, tapValue: 3, energyRegen: 1 },
  { level: 4, name: "Platinum", minPoints: 1000, tapValue: 4, energyRegen: 1 },
  { level: 5, name: "Diamond", minPoints: 5000, tapValue: 5, energyRegen: 1 },
  {
    level: 6,
    name: "Grandmaster",
    minPoints: 10000,
    tapValue: 10,
    energyRegen: 1,
  },
];

export const getLevelInfo = (points: number): LevelInfo => {
  // 1. Find the highest level where points >= minPoints
  // We reverse the array to find the last matching level (e.g. if 600, find Gold before Silver)
  const currentLevel =
    LEVELS.slice()
      .reverse()
      .find((l) => points >= l.minPoints) || LEVELS[0];

  // 2. Find the next level to calculate progress
  const nextLevel = LEVELS.find((l) => l.level === currentLevel.level + 1);

  // 3. Calculate progress percentage (0 to 100)
  let progress = 100;
  if (nextLevel) {
    const range = nextLevel.minPoints - currentLevel.minPoints;
    const gained = points - currentLevel.minPoints;
    progress = Math.min(100, Math.max(0, (gained / range) * 100));
  }

  return {
    ...currentLevel,
    nextLevelPoints: nextLevel ? nextLevel.minPoints : null,
    progress,
  };
};
