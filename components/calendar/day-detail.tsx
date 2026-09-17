import { format, parseISO } from "date-fns";
import type { DaySummary } from "@/lib/calendar/day-summary";
import { round1 } from "@/lib/nutrition";
import { ACTIVITY_EMOJI, ACTIVITY_LABELS } from "@/lib/activity/estimate";
import {
  computeDayEnergy,
  suggestedStatus,
  SUGGESTED_STATUS_STYLES,
  type CalorieTargets,
} from "@/lib/calorie-targets";

const MOOD_EMOJI: Record<string, string> = { happy: "😄", content: "😐", unhappy: "😣" };
const SEVERITY_LABELS = ["None", "Mild", "Noticeable", "Uncomfortable", "Bad", "Severe"];

export function DayDetail({ day, targets }: { day: DaySummary; targets: CalorieTargets }) {
  const hasAnything =
    day.diary.length > 0 ||
    day.medications.length > 0 ||
    day.symptoms.length > 0 ||
    day.activities.length > 0 ||
    day.journalNotes ||
    day.legacyActivity ||
    day.weightKg;

  const energy = computeDayEnergy(day.totals.calories, day.caloriesBurned, targets);
  const status = suggestedStatus(energy.intake, targets.suggestedCalories);
  const showEnergy = day.diary.length > 0 || day.activities.length > 0;

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

      {showEnergy && (
        <section className="rounded-xl border border-card-border bg-brand-violet/5 p-3">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-bold text-muted">⚡ Energy balance</h3>
            {status !== "none" && (
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${SUGGESTED_STATUS_STYLES[status].className}`}
              >
                {SUGGESTED_STATUS_STYLES[status].label}
              </span>
            )}
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-xs text-muted">Eaten</p>
              <p className="text-lg font-extrabold">{Math.round(energy.intake)}</p>
            </div>
            <div>
              <p className="text-xs text-muted">Burned</p>
              <p className="text-lg font-extrabold text-brand-teal">
                {energy.burned > 0 ? `−${Math.round(energy.burned)}` : "0"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted">Net</p>
              <p className="text-lg font-extrabold">{Math.round(energy.net)}</p>
            </div>
          </div>
          {(targets.suggestedCalories !== null || energy.deficit !== null) && (
            <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 border-t border-card-border pt-2 text-xs text-muted">
              {targets.suggestedCalories !== null && energy.vsSuggested !== null && (
                <span>
                  Target {targets.suggestedCalories} kcal ·{" "}
                  <span className="font-semibold">
                    {energy.vsSuggested > 0
                      ? `${Math.round(energy.vsSuggested)} over`
                      : `${Math.round(-energy.vsSuggested)} left`}
                  </span>
                </span>
              )}
              {energy.deficit !== null && (
                <span>
                  vs BMR {targets.bmr} ·{" "}
                  <span
                    className={`font-semibold ${
                      energy.deficit >= 0 ? "text-brand-teal" : "text-brand-rose"
                    }`}
                  >
                    {energy.deficit >= 0
                      ? `${Math.round(energy.deficit)} kcal deficit`
                      : `${Math.round(-energy.deficit)} kcal surplus`}
                  </span>
                </span>
              )}
            </div>
          )}
        </section>
      )}

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

      {day.activities.length > 0 && (
        <section>
          <h3 className="mb-2 text-sm font-bold text-muted">🏃 Activity</h3>
          <div className="flex flex-col gap-1.5">
            {day.activities.map((line) => (
              <div key={line.id} className="flex items-center justify-between text-sm">
                <span>
                  <span className="text-muted">{line.time}</span> · {ACTIVITY_EMOJI[line.type]}{" "}
                  {line.distanceMiles} mi {ACTIVITY_LABELS[line.type].toLowerCase()}
                  {line.notes && <span className="ml-1.5 italic text-muted">&ldquo;{line.notes}&rdquo;</span>}
                </span>
                <span className="shrink-0 font-medium text-brand-teal">
                  −{Math.round(line.caloriesBurned)} kcal
                </span>
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

      {(day.journalNotes || day.legacyActivity) && (
        <section>
          <h3 className="mb-2 text-sm font-bold text-muted">📓 Journal</h3>
          {day.legacyActivity && (
            <p className="mb-1 text-sm">
              <span className="rounded-full bg-brand-teal/15 px-2 py-0.5 text-xs font-semibold text-brand-teal">
                💪 {day.legacyActivity}
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
