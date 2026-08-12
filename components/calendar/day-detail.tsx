import { format, parseISO } from "date-fns";
import type { DaySummary } from "@/lib/calendar/month-data";
import { round1 } from "@/lib/nutrition";

const MOOD_EMOJI: Record<string, string> = { happy: "😄", content: "😐", unhappy: "😣" };
const SEVERITY_LABELS = ["None", "Mild", "Noticeable", "Uncomfortable", "Bad", "Severe"];

export function DayDetail({ day }: { day: DaySummary }) {
  const hasAnything =
    day.diary.length > 0 ||
    day.medications.length > 0 ||
    day.symptoms.length > 0 ||
    day.journalNotes ||
    day.activity ||
    day.weightKg;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-xl font-extrabold">{format(parseISO(day.date), "EEEE d MMMM yyyy")}</h2>
        {day.diary.length > 0 && (
          <p className="text-sm text-muted">
            {round1(day.totals.calories)} kcal · {round1(day.totals.protein)}g protein ·{" "}
            {round1(day.totals.sugar)}g sugar
          </p>
        )}
      </div>

      {!hasAnything && <p className="text-sm text-muted">Nothing logged this day.</p>}

      {day.diary.length > 0 && (
        <section>
          <h3 className="mb-2 text-sm font-bold text-muted">🥤 Food &amp; drink</h3>
          <div className="flex flex-col gap-1.5">
            {day.diary.map((line) => (
              <div key={line.id} className="flex items-center justify-between text-sm">
                <span>
                  <span className="text-muted">{line.time}</span> · {line.quantity}× {line.itemName}
                  {line.mood && <span className="ml-1.5">{MOOD_EMOJI[line.mood]}</span>}
                  {line.notes && <span className="ml-1.5 italic text-muted">&ldquo;{line.notes}&rdquo;</span>}
                </span>
                <span className="shrink-0 text-muted">{round1(line.calories)} kcal</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {day.medications.length > 0 && (
        <section>
          <h3 className="mb-2 text-sm font-bold text-muted">💊 Medication</h3>
          <div className="flex flex-col gap-1.5">
            {day.medications.map((line) => (
              <div key={line.id} className="text-sm">
                <span className="text-muted">{line.time}</span> · {line.quantity}× {line.name} (
                {line.strength} {line.form})
                {line.notes && <span className="ml-1.5 italic text-muted">&ldquo;{line.notes}&rdquo;</span>}
              </div>
            ))}
          </div>
        </section>
      )}

      {day.symptoms.length > 0 && (
        <section>
          <h3 className="mb-2 text-sm font-bold text-muted">🚽 Symptoms</h3>
          <div className="flex flex-col gap-1.5">
            {day.symptoms.map((line) => (
              <div key={line.id} className="text-sm">
                <span className="text-muted">{line.time}</span> ·{" "}
                {line.bristolScale && `Type ${line.bristolScale}`}
                {line.bristolScale && line.severity !== null ? " · " : ""}
                {line.severity !== null && SEVERITY_LABELS[line.severity]}
                {line.notes && <span className="ml-1.5 italic text-muted">&ldquo;{line.notes}&rdquo;</span>}
              </div>
            ))}
          </div>
        </section>
      )}

      {(day.journalNotes || day.activity) && (
        <section>
          <h3 className="mb-2 text-sm font-bold text-muted">📓 Journal</h3>
          {day.activity && (
            <p className="mb-1 text-sm">
              <span className="rounded-full bg-brand-teal/15 px-2 py-0.5 text-xs font-semibold text-brand-teal">
                💪 {day.activity}
              </span>
            </p>
          )}
          {day.journalNotes && <p className="text-sm">{day.journalNotes}</p>}
        </section>
      )}

      {day.weightKg && (
        <section>
          <h3 className="mb-1 text-sm font-bold text-muted">⚖️ Weight</h3>
          <p className="text-sm">{day.weightKg} kg</p>
        </section>
      )}
    </div>
  );
}
