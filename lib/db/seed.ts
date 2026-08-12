import { db } from "./client";
import { items, settings } from "./schema";

const SEED_ITEMS: (typeof items.$inferInsert)[] = [
  { name: "Ensure Plus - Vanilla", type: "drink", basis: "per_serving", calories: 300, protein: 12.5, sugar: 6.5 },
  { name: "Ensure Plus - Strawberry", type: "drink", basis: "per_serving", calories: 300, protein: 12.5, sugar: 6.5 },
  { name: "Ensure Plus - Banana", type: "drink", basis: "per_serving", calories: 300, protein: 12.5, sugar: 6.5 },
  { name: "Ensure Plus - Peach", type: "drink", basis: "per_serving", calories: 300, protein: 12.5, sugar: 6.5 },
  { name: "Aymes - Juicy Apple", type: "drink", basis: "per_serving", calories: 300, protein: 10, sugar: 27 },
  { name: "Aymes - Juicy Peach", type: "drink", basis: "per_serving", calories: 300, protein: 10, sugar: 27 },
  { name: "Aymes - Exotic Fruit", type: "drink", basis: "per_serving", calories: 300, protein: 10, sugar: 27 },
  { name: "Aymes - Berry Medley", type: "drink", basis: "per_serving", calories: 300, protein: 10, sugar: 27 },
  { name: "Winegums", type: "food", basis: "per_100g", calories: 318, protein: 4.9, sugar: 54, unitWeightG: 5.9 },
];

const DIET_START_DATE = "2026-08-12";

export async function runSeed(): Promise<void> {
  const existingItems = await db.select().from(items).limit(1);
  if (existingItems.length === 0) {
    await db.insert(items).values(SEED_ITEMS);
    console.log(`Seeded ${SEED_ITEMS.length} catalog items.`);
  }

  const existingSettings = await db.select().from(settings).limit(1);
  if (existingSettings.length === 0) {
    await db.insert(settings).values({ dietStartDate: DIET_START_DATE });
    console.log(`Seeded diet start date: ${DIET_START_DATE}`);
  }
}
