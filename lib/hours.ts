/**
 * Café opening hours, used by the booking calendar. Keep in step with the footer.
 * Index = day of the week (0 Sunday … 6 Saturday); null = closed.
 */
export const OPENING: ([number, number] | null)[] = [
  [9, 14], // Sunday 09:00 – 14:00
  null, // Monday closed
  [9, 19], // Tuesday
  [9, 19],
  [9, 19],
  [9, 19],
  [9, 19], // Saturday
];

/** Appointment length in minutes; the last one starts this long before closing. */
export const SLOT_MINUTES = 30;

/** How far ahead visitors can book. */
export const BOOK_AHEAD_DAYS = 60;

export const pad = (n: number) => String(n).padStart(2, "0");
export const dayKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** Start times ("09:00", "09:30", …) for a day, leaving out any already past. */
export function slotsFor(day: Date, now: Date): string[] {
  const hours = OPENING[day.getDay()];
  if (!hours) return [];
  const out: string[] = [];
  for (let m = hours[0] * 60; m + SLOT_MINUTES <= hours[1] * 60; m += SLOT_MINUTES) {
    const at = new Date(day.getFullYear(), day.getMonth(), day.getDate(), Math.floor(m / 60), m % 60);
    if (at > now) out.push(`${pad(Math.floor(m / 60))}:${pad(m % 60)}`);
  }
  return out;
}
