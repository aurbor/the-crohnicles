import { desc, eq } from "drizzle-orm";
import { format, parseISO } from "date-fns";
import { db } from "@/lib/db/client";
import { diaryEntries, items } from "@/lib/db/schema";
import { deleteDiaryEntry } from "@/lib/diary/actions";
import { DeleteEntryButton } from "@/components/quick-add/delete-entry-button";
import { totalNutrition, round1 } from "@/lib/nutrition";

export async function RecentDiary() {
  const rows = await db
    .select({
      id: diaryEntries.id,
      occurredAt: diaryEntries.occurredAt,
      quantity: diaryEntries.quantity,
      mood: diaryEntries.mood,
      notes: diaryEntries.notes,
      itemName: items.name,
      itemType: items.type,
      basis: items.basis,
      calories: items.calories,
      protein: items.protein,
      sugar: items.sugar,
      unitWeightG: items.unitWeightG,
    })
    .from(diaryEntries)
    .innerJoin(items, eq(diaryEntries.itemId, items.id))
    .orderBy(desc(diaryEntries.occurredAt), desc(diaryEntries.id))
    .limit(10);

  if (rows.length === 0) {
    return <p className="text-sm text-muted">Nothing logged yet — get started!</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-bold text-muted">Recently logged</h3>
      {rows.map((row) => {
        const nutrition = totalNutrition(row, row.quantity);
        return (
          <div key={row.id} className="card flex items-start justify-between gap-2 p-3 text-sm">
            <div>
              <p className="font-medium">
                {row.quantity}× {row.itemName}
                {row.mood && (
                  <span className="ml-1.5">
                    {row.mood === "happy" ? "😄" : row.mood === "content" ? "😐" : "😣"}
                  </span>
                )}
              </p>
              <p className="text-xs text-muted">
                {format(parseISO(row.occurredAt), "EEE d MMM, HH:mm")} · {round1(nutrition.calories)} kcal
              </p>
              {row.notes && <p className="mt-0.5 text-xs italic text-muted">&ldquo;{row.notes}&rdquo;</p>}
            </div>
            <DeleteEntryButton action={deleteDiaryEntry.bind(null, row.id)} />
          </div>
        );
      })}
    </div>
  );
}
