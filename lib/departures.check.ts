/** Jalankan: node lib/departures.check.ts */
import assert from "node:assert/strict";
import { businessToday, isOpenForRegistration, openDepartures, unavailableReason } from "./departures.ts";

// WIB = UTC+7: 16:59:59 UTC is still the same Jakarta day, 17:00 UTC is the next day.
assert.equal(businessToday(new Date("2026-11-10T16:59:59Z")), "2026-11-10");
assert.equal(businessToday(new Date("2026-11-10T17:00:00Z")), "2026-11-11");
assert.equal(businessToday(new Date("2026-12-31T17:30:00Z")), "2027-01-01");

// The departure day itself is closed; only later dates are open.
assert.equal(isOpenForRegistration("2026-11-11", "2026-11-11"), false);
assert.equal(isOpenForRegistration("2026-11-12", "2026-11-11"), true);
assert.equal(isOpenForRegistration("2026-11-10", "2026-11-11"), false);

const deps = [{ date: "2027-01-06" }, { date: "2026-10-07" }, { date: "2026-11-11" }];
assert.deepEqual(openDepartures(deps, "2026-11-11").map((d) => d.date), ["2027-01-06"]);
assert.equal(unavailableReason("2026-10-07", deps, "2026-11-11"), "past");
assert.equal(unavailableReason("2025-01-01", deps, "2026-11-11"), "unknown");
assert.equal(unavailableReason("2027-01-06", deps, "2026-11-11"), null);

console.log("departures.ts OK");
