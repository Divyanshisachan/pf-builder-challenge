// Scout trust score (pure, testable). Start at 100, apply weighted page-visible signals.
// Production would extract signals with an LLM from each listing; the prototype uses the audit's hand-extracted signals.
import type { Listing } from "./scout";

export type Group = "genuine" | "checking" | "misleading";
export type SignalPts = { label: string; points: number; plainReason: string };
export type Trust = { score: number; group: Group; signals: SignalPts[]; top: string };

export const MEDIAN: Record<string, number> = { "Business Bay": 16.4, "Dubai Marina": 16.7 };
export const GROUP_NAME: Record<Group, string> = { genuine: "🟢 Looks genuine", checking: "🟡 Needs checking", misleading: "🔴 Likely misleading" };

// Extra page facts captured in the audit (12 Nov 2026)
const NOTED_PRICE: Record<number, number> = { 3: 5500, 8: 6499 }; // price the user saw earlier vs live price now
const SUPERAGENT = new Set([10, 18, 25]);
const BUILDING_REVIEW: Record<number, number> = { 22: 3.3, 23: 3.5, 15: 4.2, 16: 4.4, 17: 4.4, 19: 4.6 }; // PF building ratings seen in audit
const HOLIDAY_HOME = (l: Listing) => /holiday|vacation|homes|getaway|stay/i.test(l.agency) && !/hotel/i.test(l.agency);

const BIG_GAP = new Set([11, 12]); // card price far below the real price for a normal stay
const days = (a: string, b: string) => Math.round((+new Date(b) - +new Date(a)) / 86400000);

export function trustCheck(l: Listing, today = "2026-11-12"): Trust {
  const sig: SignalPts[] = [];
  const add = (label: string, points: number, plainReason: string) => points && sig.push({ label, points, plainReason });

  // 1. Price per sqft vs area median
  const dev = l.price / l.sqft / MEDIAN[l.area] - 1;
  if (dev <= -0.3) add("Price vs area", -30, `${Math.round(-dev * 100)}% cheaper per sqft than ${l.area}: bait price, or the size is inflated`);
  else if (dev >= 0.4) add("Price vs area", -20, `${Math.round(dev * 100)}% pricier per sqft than ${l.area}: often a hotel room sold as a studio`);
  else if (dev >= 0.2) add("Price vs area", -10, `${Math.round(dev * 100)}% pricier per sqft than ${l.area}`);
  else if (dev <= -0.2) add("Price vs area", -15, `${Math.round(-dev * 100)}% cheaper per sqft than ${l.area}: check the size and price`);

  // 2. Freshness
  const age = days(l.listed, today); const hh = HOLIDAY_HOME(l);
  if (age <= 30) add("Freshness", 5, `Listed ${age} days ago`);
  else if (age <= 90) add("Freshness", hh ? -5 : -10, `Listed ${age} days ago${hh ? " (holiday-home operator: units re-rent often, so a smaller penalty)" : ""}`);
  else add("Freshness", hh ? -31 : -35, `Listed ${Math.round(age / 30)} months ago: may already be gone${hh ? " (holiday-home operator: slightly smaller penalty)" : ""}`);

  // 3. Duplicates
  if (l.twin) {
    if (l.twin.gapPct <= 2) add("Same unit, 2 agents", 10, `Same unit listed by another agent at almost the same price (#${l.twin.k}): the flat is real${age > 90 ? ", but both ads are old" : ""}`);
    else if (l.twin.cheaperAndOlder) add("Same unit, 2 agents", -15, `Same unit is ${l.twin.gapPct}% dearer in a fresher ad (#${l.twin.k}): this cheap price may be out of date`);
  }
  if (l.locationIssue && /generic/.test(l.locationIssue)) add("Location", -20, "No building named; map pin is the generic area point");
  else if (l.locationIssue) add("Location", -10, l.locationIssue);
  if (l.sharedPermitWith) add("Permit reused", -15, `Same permit number as #${l.sharedPermitWith}, in a different area`);

  // 4. Live price differs from the price noted earlier
  if (NOTED_PRICE[l.k] && NOTED_PRICE[l.k] !== l.price) add("Price changed", -15, `Price changed from AED ${NOTED_PRICE[l.k].toLocaleString()} to AED ${l.price.toLocaleString()} since you saved it`);

  // 5. Fees hidden / price conditional
  if (l.conditional) add("Price conditions", BIG_GAP.has(l.k) ? -30 : -10, l.conditional);
  else if (l.feesUnknown) add("Hidden fees", -10, "Some fees aren't priced, so the all-in cost can't be worked out");
  if (l.allIn && l.allIn / l.price - 1 > 0.15) add("Fees on top", -10, `Stated fees add ~${Math.round((l.allIn / l.price - 1) * 100)}% on top of the rent`);

  // 6. Missing permit / licence
  if (l.permitMissing && l.portal !== "Property Finder") add("Permit", -15, "Permit not shown on this portal");
  else if (l.permitMissing) add("Permit", -30, `No valid permit shown (${l.permit})`);
  if (l.permitMissing && l.agentLicPlaceholder) add("Licence", -20, "Agent licence is a placeholder too: advertiser can't be identified");

  // Unit evidence
  const corroborated = !!(l.twin && l.twin.gapPct <= 2);
  if (l.recycledPhotos) add("Photos", corroborated ? -10 : -20, corroborated ? "Photos also appear on other listings, though two agents show this same unit" : "These photos also appear on other listings");
  if (l.sizeIssue) add("Size", -15, l.sizeIssue);
  if (l.hotelConflict) add("Unit type", -20, l.hotelConflict);
  if (l.hotelDisclosed) add("Unit type", -30, "A hotel room with no kitchen, not a studio (stated in the title)");

  // 7. Agent
  if (SUPERAGENT.has(l.k)) add("Agent", 5, "SuperAgent badge");
  if (l.rating !== null && l.rating < 3.5) add("Agent", -5, `Agent rated ${l.rating} (${l.reviews} reviews)`);

  // 8. Building reviews (supporting only)
  const br = BUILDING_REVIEW[l.k];
  if (br !== undefined) add("Building reviews", br < 3.6 ? -5 : br >= 4.3 ? 3 : 0, `Building rated ${br}/5 by residents`);

  const score = Math.max(0, Math.min(100, 100 + sig.reduce((s, x) => s + x.points, 0)));
  const group: Group = score >= 70 ? "genuine" : score >= 40 ? "checking" : "misleading";
  const neg = [...sig].filter((x) => x.points < 0).sort((a, b) => a.points - b.points);
  const top = neg[0]?.plainReason ?? sig.find((x) => x.points > 0)?.plainReason ?? "No warning signs on the listing";
  return { score, group, signals: sig.filter((x) => x.plainReason), top };
}

// ---- All-in month-1 cost (rent + 5% VAT + service + tourism + cleaning + deposit) ----
export type CostLine = { label: string; amount: number | null; note?: string };
const FEES: Record<number, { vat?: boolean; service?: number; tourismNight?: boolean; tourismFlat?: number; cleaning?: number; deposit?: number; incl?: string; rentOverride?: number }> = {
  2: { tourismNight: true, deposit: 1000, incl: "All bills included" },
  3: { incl: "DEWA not included" },
  5: { tourismNight: true, cleaning: 200, incl: "Bills included (title)" },
  6: { vat: true, service: 0.1 }, 7: { vat: true, service: 0.1 },
  9: { vat: true, service: 0.07, tourismNight: true, cleaning: 200 },
  10: { vat: true, incl: "Electricity, water, chiller, Wi-Fi included" },
  11: { vat: true, rentOverride: 9000, tourismNight: true },
  13: { tourismFlat: 450, incl: "VAT, service and municipality fees included" },
  14: { vat: true },
  15: { deposit: 1500 },
  16: { incl: "DEWA, chiller, Wi-Fi included" }, 17: { incl: "DEWA, chiller, Wi-Fi included" }, 19: { incl: "DEWA, chiller, Wi-Fi included" }, 20: { incl: "DEWA, chiller, Wi-Fi included" }, 21: { incl: "DEWA, chiller, Wi-Fi included" },
  18: { vat: true, service: 0.07, tourismNight: true, cleaning: 200 },
  22: { deposit: 1500 },
  23: { tourismNight: true, cleaning: 200 },
  24: { vat: true, service: 0.1, tourismNight: true, deposit: 1000 },
  25: { vat: true, service: 0.15, tourismNight: true, incl: "All bills included" },
  26: { vat: true, service: 0.05 }, 29: { vat: true, service: 0.1 },
  30: { vat: true, cleaning: 0, incl: "All utilities included" },
  31: { incl: "Electricity, water, Wi-Fi, housekeeping included" },
};
export function allInMonth1(l: Listing): { lines: CostLine[]; total: number; unknown: number; incl?: string } {
  const f = FEES[l.k] ?? {}; const rent = f.rentOverride ?? l.price;
  const lines: CostLine[] = [{ label: f.rentOverride ? `Rent (3-month rate, not the ${l.price.toLocaleString()} on the card)` : "Rent", amount: rent }];
  lines.push({ label: "VAT 5%", amount: f.vat ? Math.round(rent * 0.05) : null, note: f.vat ? undefined : "❓ ask agent" });
  lines.push({ label: "Service charge", amount: f.service ? Math.round(rent * f.service) : null, note: f.service ? `${Math.round(f.service * 100)}%` : "❓ ask agent" });
  lines.push({ label: "Tourism fee (AED 10/night × 30)", amount: f.tourismNight ? 300 : f.tourismFlat ?? null, note: f.tourismNight || f.tourismFlat ? undefined : "❓ ask agent" });
  lines.push({ label: "Cleaning", amount: f.cleaning ? f.cleaning : null, note: f.cleaning ? undefined : "❓ ask agent" });
  lines.push({ label: "Refundable deposit", amount: f.deposit ?? null, note: f.deposit ? "refundable" : "❓ ask agent" });
  const total = lines.reduce((s, x) => s + (x.amount && x.label !== "Refundable deposit" ? x.amount : 0), 0);
  const unknown = lines.filter((x) => x.amount === null).length;
  return { lines, total, unknown, incl: f.incl };
}
