export const ACTIVITY_TYPES = ["running", "walking"] as const;
export type ActivityType = (typeof ACTIVITY_TYPES)[number];

export const ACTIVITY_LABELS: Record<ActivityType, string> = {
  running: "Running",
  walking: "Walking",
};

export const ACTIVITY_EMOJI: Record<ActivityType, string> = {
  running: "🏃",
  walking: "🚶",
};

/**
 * Burn rates in kcal per mile per pound of bodyweight.
 *
 * These are the *net* figures (energy spent above resting metabolism), not the
 * gross ones (0.75 / 0.53). Net is the right choice here because the daily
 * deficit adds this on top of BMR — using gross would count the calories you'd
 * have burned sitting still twice over and overstate the deficit.
 *
 * Sanity check against Runkeeper exports: 0.63 x 190lb = 120 kcal/mile, which
 * matches samples of 3.11mi/352kcal, 2.39mi/288kcal and 4.81mi/573kcal.
 */
const KCAL_PER_MILE_PER_LB: Record<ActivityType, number> = {
  running: 0.63,
  walking: 0.3,
};

const LB_PER_KG = 2.20462;

/** Used only when there is no weigh-in to work from yet. */
export const FALLBACK_WEIGHT_KG = 75;

export function estimateCaloriesBurned(
  type: ActivityType,
  distanceMiles: number,
  bodyWeightKg: number | null
): number {
  const weightLb = (bodyWeightKg ?? FALLBACK_WEIGHT_KG) * LB_PER_KG;
  return Math.round(KCAL_PER_MILE_PER_LB[type] * weightLb * distanceMiles);
}
