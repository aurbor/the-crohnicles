import { db } from "@/lib/db/client";
import { items, diaryEntries } from "@/lib/db/schema";
import { AddItemPanel } from "@/components/items/add-item-panel";
import { ItemList, type ItemRow } from "@/components/items/item-list";

export default async function ItemsPage() {
  const [allItems, entries] = await Promise.all([
    db.select().from(items),
    db.select({ itemId: diaryEntries.itemId }).from(diaryEntries),
  ]);

  const itemIdsWithEntries = new Set(entries.map((e) => e.itemId));

  const rows: ItemRow[] = allItems
    .map((item) => ({
      id: item.id,
      name: item.name,
      type: item.type,
      calories: item.calories,
      protein: item.protein,
      sugar: item.sugar,
      unitWeightG: item.unitWeightG,
      archived: item.archived,
      hasEntries: itemIdsWithEntries.has(item.id),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Drinks &amp; Food</h1>
        <p className="text-sm text-muted">
          Your catalog of shakes and permitted contraband. Drinks use whole-serving
          values (they&apos;re always 300kcal in a can); food uses per-100g lab values
          plus a piece weight so the diary can just ask &ldquo;how many?&rdquo;
        </p>
      </div>

      <AddItemPanel />
      <ItemList items={rows} />
    </div>
  );
}
