// ─── DISCOVERY CALL BOOKING RULES ──────────────────────────────────────────
// Shared by the booking calendar (to offer slots) and the API (to re-check them).
// Slots follow the studio's working hours in the studio's time zone and are
// shown to visitors in their own time zone.

export const BOOKING = {
  /** The studio's time zone (IANA name) */
  timeZone: "Asia/Dhaka",
  /** Working hours in studio time, 24h clock: first slot starts at startHour, last ends by endHour */
  startHour: 10,
  endHour: 19,
  /** Working days in studio time (0 = Sunday): every day */
  workingDays: [0, 1, 2, 3, 4, 5, 6],
  /** A new slot starts every slotMinutes */
  slotMinutes: 30,
  /** Length of a call */
  durationMinutes: 30,
  /** Earliest bookable start, from now */
  minNoticeHours: 3,
  /** How far ahead calls can be booked */
  daysAhead: 45,
} as const;

const WEEKDAY_INDEX: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

let studioFormatter: Intl.DateTimeFormat | null = null;

/** Weekday and minute-of-day of an instant, on the studio's clock */
function studioClock(date: Date): { weekday: number; minutes: number } {
  studioFormatter ??= new Intl.DateTimeFormat("en-US", {
    timeZone: BOOKING.timeZone,
    weekday: "short",
    hour: "numeric",
    minute: "numeric",
    hourCycle: "h23",
  });
  let weekday = 0;
  let hour = 0;
  let minute = 0;
  for (const part of studioFormatter.formatToParts(date)) {
    if (part.type === "weekday") weekday = WEEKDAY_INDEX[part.value] ?? 0;
    else if (part.type === "hour") hour = Number(part.value);
    else if (part.type === "minute") minute = Number(part.value);
  }
  return { weekday, minutes: hour * 60 + minute };
}

/** Whether a call may start at this instant */
export function isBookableStart(date: Date, now: Date = new Date()): boolean {
  const t = date.getTime();
  if (Number.isNaN(t)) return false;
  if (t < now.getTime() + BOOKING.minNoticeHours * 3_600_000) return false;
  if (t > now.getTime() + BOOKING.daysAhead * 86_400_000) return false;
  if (date.getUTCSeconds() !== 0 || date.getUTCMilliseconds() !== 0) return false;
  const { weekday, minutes } = studioClock(date);
  if (!(BOOKING.workingDays as readonly number[]).includes(weekday)) return false;
  if (minutes % BOOKING.slotMinutes !== 0) return false;
  return minutes >= BOOKING.startHour * 60 && minutes + BOOKING.durationMinutes <= BOOKING.endHour * 60;
}

/**
 * Bookable starts on a calendar day in the visitor's own time zone. Steps in
 * 15 minutes so time zones with :30 / :45 offsets still line up with the
 * studio's half-hour grid.
 */
export function slotsForLocalDay(year: number, month: number, day: number, now: Date = new Date()): Date[] {
  const slots: Date[] = [];
  for (let minute = 0; minute < 24 * 60; minute += 15) {
    const start = new Date(year, month, day, 0, minute);
    if (start.getDate() !== day) break; // ran past midnight (DST shifts)
    if (isBookableStart(start, now)) slots.push(start);
  }
  return slots;
}
