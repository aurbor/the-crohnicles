"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { isActiveDay, type DaySummary } from "@/lib/calendar/day-summary";
import { round1 } from "@/lib/nutrition";
import { ACTIVITY_LABELS } from "@/lib/activity/estimate";
import type { CalorieTargets } from "@/lib/calorie-targets";
import { DayDetail } from "./day-detail";

const MOOD_EMOJI: Record<string, string> = { happy: "😄", content: "😐", unhappy: "😣" };
const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function activityTitle(day: DaySummary): string {
  if (day.activities.length === 0) return day.legacyActivity ?? "Active day";
  return day.activities
    .map((a) => `${a.distanceMiles} mi ${ACTIVITY_LABELS[a.type].toLowerCase()}`)
    .join(", ");
}

export function CalendarGrid({
  weeks,
  daysData,
  currentMonth,
  todayStr,
  targets,
}: {
  weeks: string[][];
  daysData: Record<string, DaySummary>;
  currentMonth: string;
  todayStr: string;
  targets: CalorieTargets;
}) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const selectedDay = selectedDate ? daysData[selectedDate] : null;

  return (
    <Dialog.Root open={!!selectedDate} onOpenChange={(open) => !open && setSelectedDate(null)}>
      <div className="card overflow-hidden">
        <div className="grid grid-cols-7 border-b border-card-border bg-brand-violet/5 text-center text-xs font-semibold text-muted">
          {WEEKDAY_LABELS.map((d) => (
            <div key={d} className="py-2">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {weeks.flat().map((date) => {
            const inMonth = date.startsWith(currentMonth);
            const day = daysData[date];
            const dayNum = Number(date.slice(8, 10));
            const isToday = date === todayStr;
            const lastMood = day?.moods[day.moods.length - 1];

            return (
              <button
                key={date}
                type="button"
                onClick={() => setSelectedDate(date)}
                className={`flex min-h-20 flex-col items-start gap-1 border-b border-r border-card-border p-1.5 text-left transition-colors last:border-r-0 hover:bg-brand-violet/10 sm:min-h-24 sm:p-2 ${
                  inMonth ? "" : "opacity-30"
                }`}
              >
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-semibold ${
                    isToday ? "brand-gradient text-white" : "text-muted"
                  }`}
                >
                  {dayNum}
                </span>
                {day && (
                  <div className="flex w-full flex-1 flex-col gap-0.5 text-[10px] leading-tight sm:text-xs">
                    {day.diary.length > 0 && (
                      <span className="truncate">
                        🥤{day.diary.length} · {round1(day.totals.calories)}kcal
                      </span>
                    )}
                    <div className="flex items-center gap-1">
                      {lastMood && <span>{MOOD_EMOJI[lastMood]}</span>}
                      {isActiveDay(day) && (
                        <span title={activityTitle(day)}>
                          {day.activities.length > 0 ? "🏃" : "💪"}
                        </span>
                      )}
                      {day.medications.length > 0 && <span title="Medication logged">💊</span>}
                      {day.symptoms.length > 0 && <span title="Symptom logged">🚽</span>}
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content className="card fixed left-1/2 top-1/2 z-50 max-h-[85vh] w-[92vw] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto p-6">
          <Dialog.Title className="sr-only">Day details</Dialog.Title>
          {selectedDay ? (
            <DayDetail day={selectedDay} targets={targets} />
          ) : selectedDate ? (
            <DayDetail
              day={{
                date: selectedDate,
                diary: [],
                medications: [],
                symptoms: [],
                activities: [],
                journalNotes: null,
                legacyActivity: null,
                weightKg: null,
                totals: { calories: 0, protein: 0, sugar: 0 },
                caloriesBurned: 0,
                moods: [],
              }}
              targets={targets}
            />
          ) : null}
          <Dialog.Close asChild>
            <button className="btn-secondary mt-5 w-full">Close</button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
