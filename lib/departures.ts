/**
 * Business date for the public catalogue (PUBLIC-01).
 *
 * Departures are dated in Indonesian business days, so "today" is always computed in
 * Asia/Jakarta (WIB) — never the server's or visitor's local zone. A departure is open for
 * registration only while its date is AFTER today: on the departure day itself the group is
 * leaving and registration is closed. Fixture dates are never shifted.
 */
export const BUSINESS_TIMEZONE = "Asia/Jakarta";

const formatter = new Intl.DateTimeFormat("en-CA", { timeZone: BUSINESS_TIMEZONE, year: "numeric", month: "2-digit", day: "2-digit" });

/** "YYYY-MM-DD" in Asia/Jakarta for the given instant. */
export function businessToday(now: Date = new Date()): string {
  return formatter.format(now);
}

export function isOpenForRegistration(date: string, today: string): boolean {
  return date > today;
}

/** Departures still open for registration, earliest first. */
export function openDepartures<T extends { date: string }>(departures: readonly T[], today: string): T[] {
  return departures.filter((d) => isOpenForRegistration(d.date, today)).sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Why a requested `?d=` date cannot be selected:
 * "past" = it existed but is no longer open; "unknown" = no such departure for this package.
 */
export function unavailableReason(requested: string, all: readonly { date: string }[], today: string): "past" | "unknown" | null {
  const match = all.find((d) => d.date === requested);
  if (!match) return "unknown";
  return isOpenForRegistration(match.date, today) ? null : "past";
}
