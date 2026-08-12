import { sql } from "drizzle-orm";
import { sqliteTable, integer, text, real } from "drizzle-orm/sqlite-core";

const timestamp = (name: string) =>
  text(name)
    .notNull()
    .default(sql`(current_timestamp)`);

export const items = sqliteTable("items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  type: text("type", { enum: ["drink", "food"] }).notNull(),
  basis: text("basis", { enum: ["per_serving", "per_100g"] }).notNull(),
  calories: real("calories").notNull(),
  protein: real("protein").notNull(),
  sugar: real("sugar").notNull(),
  unitWeightG: real("unit_weight_g"),
  archived: integer("archived", { mode: "boolean" }).notNull().default(false),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

export const diaryEntries = sqliteTable("diary_entries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  occurredAt: text("occurred_at").notNull(),
  itemId: integer("item_id")
    .notNull()
    .references(() => items.id),
  quantity: real("quantity").notNull().default(1),
  mood: text("mood", { enum: ["unhappy", "content", "happy"] }),
  notes: text("notes"),
  createdAt: timestamp("created_at"),
});

export const medications = sqliteTable("medications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  form: text("form").notNull(),
  unitsPerDose: real("units_per_dose").notNull(),
  strength: text("strength").notNull(),
  archived: integer("archived", { mode: "boolean" }).notNull().default(false),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

export const medicationEntries = sqliteTable("medication_entries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  occurredAt: text("occurred_at").notNull(),
  medicationId: integer("medication_id")
    .notNull()
    .references(() => medications.id),
  quantity: real("quantity").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at"),
});

export const symptomEntries = sqliteTable("symptom_entries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  occurredAt: text("occurred_at").notNull(),
  bristolScale: integer("bristol_scale"),
  severity: integer("severity"),
  notes: text("notes"),
  createdAt: timestamp("created_at"),
});

export const journalEntries = sqliteTable("journal_entries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  date: text("date").notNull().unique(),
  notes: text("notes").notNull().default(""),
  activity: text("activity"),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

export const weightEntries = sqliteTable("weight_entries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  date: text("date").notNull(),
  weightKg: real("weight_kg").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at"),
});

export const settings = sqliteTable("settings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  dietStartDate: text("diet_start_date").notNull(),
});
