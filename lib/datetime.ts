/**
 * `occurredAt` fields arrive as naive "YYYY-MM-DDTHH:mm" wall-clock strings
 * from <input type="datetime-local">. We store them verbatim (never through
 * Date()/toISOString(), which would reinterpret using the server's
 * timezone) so a logged time always means "what the clock said" regardless
 * of which timezone the browser or the server happens to be running in.
 */
export function normalizeOccurredAt(value: string): string {
  return value.length === 16 ? `${value}:00` : value;
}

export function nowForDatetimeLocal(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(
    now.getHours()
  )}:${pad(now.getMinutes())}`;
}

export function todayForDateInput(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}
