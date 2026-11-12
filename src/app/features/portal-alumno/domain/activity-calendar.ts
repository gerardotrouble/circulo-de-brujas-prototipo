import type { Activity, MonthlyActivity } from "./student.models";

const localDate = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "America/Mexico_City",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});
const monthName = new Intl.DateTimeFormat("es-MX", {
  month: "long",
  timeZone: "UTC",
});

export function portalDate(now: Date): string {
  return localDate.format(now);
}

export function calendarMonth(key: string) {
  const [year, month] = key.split("-").map(Number);
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 0));
  const nextKey = new Date(Date.UTC(year, month, 1)).toISOString().slice(0, 7);
  const name = monthName.format(start);
  const label = name[0].toLocaleUpperCase("es-MX") + name.slice(1);
  const offset = (start.getUTCDay() + 6) % 7;
  const lastDay = end.getUTCDate();
  const days = Array.from({ length: Math.ceil((offset + lastDay) / 7) * 7 }, (_, index) => {
    const day = index - offset + 1;
    return day >= 1 && day <= lastDay ? day : null;
  });
  return { key, name, label, year, nextKey, days };
}

function scheduledDate(scheduledFor: string): string | null {
  const date = new Date(scheduledFor);
  if (Number.isNaN(date.getTime())) return null;
  return scheduledFor.length === 10 ? scheduledFor : localDate.format(date);
}

export function isPublishedMonthlyActivity(activity: MonthlyActivity): boolean {
  // Existing portal feeds contain published entries and omit the status.
  return activity.publicationStatus === undefined || activity.publicationStatus === "published";
}

export function belongsToCalendarMonth(
  activity: MonthlyActivity,
  month: ReturnType<typeof calendarMonth>,
  currentMonthKey: string,
): boolean {
  if (activity.scheduledFor) {
    return scheduledDate(activity.scheduledFor)?.slice(0, 7) === month.key;
  }
  if (activity.agendaMonth) return activity.agendaMonth === month.key;
  // Legacy undated entries have only a display label and no year.
  return month.key === currentMonthKey && activity.month.toLocaleLowerCase("es-MX") === month.name;
}

export function activityCalendarDay(activity: Activity): number {
  if (!activity.scheduledFor) return Number(activity.day);
  return Number(scheduledDate(activity.scheduledFor)?.slice(-2));
}
