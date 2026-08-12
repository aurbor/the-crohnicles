export interface NutritionBasisItem {
  basis: "per_serving" | "per_100g";
  calories: number;
  protein: number;
  sugar: number;
  unitWeightG: number | null;
}

export interface NutritionTotals {
  calories: number;
  protein: number;
  sugar: number;
}

/**
 * Per-serving items store flat totals (a 300kcal drink is 300kcal, full stop).
 * Per-100g items store lab values per 100g; unitWeightG scales that down to
 * "per piece" (e.g. one 5.9g Winegum) before the diary quantity is applied.
 */
export function perUnitNutrition(item: NutritionBasisItem): NutritionTotals {
  if (item.basis === "per_serving") {
    return { calories: item.calories, protein: item.protein, sugar: item.sugar };
  }
  const factor = (item.unitWeightG ?? 0) / 100;
  return {
    calories: item.calories * factor,
    protein: item.protein * factor,
    sugar: item.sugar * factor,
  };
}

export function totalNutrition(
  item: NutritionBasisItem,
  quantity: number
): NutritionTotals {
  const perUnit = perUnitNutrition(item);
  return {
    calories: perUnit.calories * quantity,
    protein: perUnit.protein * quantity,
    sugar: perUnit.sugar * quantity,
  };
}

export function sumNutrition(totals: NutritionTotals[]): NutritionTotals {
  return totals.reduce(
    (acc, t) => ({
      calories: acc.calories + t.calories,
      protein: acc.protein + t.protein,
      sugar: acc.sugar + t.sugar,
    }),
    { calories: 0, protein: 0, sugar: 0 }
  );
}

export function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
