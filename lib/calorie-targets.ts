export interface CalorieTargets {
  suggestedCalories: number | null;
  bmr: number | null;
}

export interface DayEnergy {
  /** kcal eaten/drunk */
  intake: number;
  /** kcal burned through logged activity */
  burned: number;
  /** intake minus activity burn */
  net: number;
  /** (BMR + activity burn) - intake. Positive means a deficit. Null if no BMR set. */
  deficit: number | null;
  /** intake - suggested. Positive means over target. Null if no target set. */
  vsSuggested: number | null;
}

export type SuggestedStatus = "under" | "close" | "over" | "none";

export function computeDayEnergy(
  intake: number,
  burned: number,
  targets: CalorieTargets
): DayEnergy {
  return {
    intake,
    burned,
    net: intake - burned,
    deficit: targets.bmr === null ? null : targets.bmr + burned - intake,
    vsSuggested: targets.suggestedCalories === null ? null : intake - targets.suggestedCalories,
  };
}

/**
 * "Close" is within 10% below the suggested intake — the point at which it's
 * worth knowing you've nearly used up the day's allowance.
 */
export function suggestedStatus(
  intake: number,
  suggestedCalories: number | null
): SuggestedStatus {
  if (suggestedCalories === null || suggestedCalories <= 0) return "none";
  if (intake > suggestedCalories) return "over";
  if (intake >= suggestedCalories * 0.9) return "close";
  return "under";
}

export const SUGGESTED_STATUS_STYLES: Record<
  Exclude<SuggestedStatus, "none">,
  { label: string; className: string }
> = {
  under: { label: "on track", className: "bg-brand-teal/15 text-brand-teal" },
  close: { label: "nearly there", className: "bg-brand-amber/15 text-brand-amber" },
  over: { label: "over target", className: "bg-brand-rose/15 text-brand-rose" },
};
