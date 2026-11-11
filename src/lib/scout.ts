// Scout rules engine: implements RULES.md (R1–R12) on page-visible signals.
// Production: an LLM extracts these signals from each listing page and description.
// Trust label (fake/misleading) is separate from fit (budget, kitchen): an honest listing can be over budget.
// Prototype: signals were extracted by hand during the 12 Nov 2026 audit (src/data/rent-audit.json).

export type Listing = {
  k: number; area: string; building: string; price: number; sqft: number; listed: string; url: string;
  agent: string; agency: string; rating: number | null; reviews: number;
  permit: string; permitMissing: boolean; agentLicPlaceholder: boolean; brokerPlaceholder: boolean;
  allIn: number | null; allInNote: string; feesUnknown: boolean; kitchen: string;
  hotelConflict?: string | null; hotelDisclosed?: boolean; conditional?: string | null; recycledPhotos?: boolean;
  sizeIssue?: string | null; cover?: string | null; locationIssue?: string | null; sharedPermitWith?: number | null;
  twin?: { k: number; gapPct: number; cheaperAndOlder: boolean } | null; hook?: string | null;
  portal: string; userTrust?: string; userWhy?: string; userVerdict?: string;
};

export type Persona = { budget: number; needsKitchen: boolean; monthly: boolean; today: string };
export const DIVYANSHI: Persona = { budget: 7500, needsKitchen: true, monthly: true, today: "2026-11-12" };

export type Signal = { rule: string; type: string; text: string; ask?: string };
export type Verdict = {
  label: "trusted" | "check" | "removed";
  signals: Signal[]; hard: Signal[]; positives: string[]; notes: string[];
  allIn: number | null; allInText: string; overBudget: boolean; fit: string[]; questions: string[];
};

// Area medians AED/sqft/month, computed from the audited listings (AUDIT.xlsx, B1:B2)
export const AREA_MEDIAN: Record<string, number> = { "Business Bay": 16.42, "Dubai Marina": 16.68 };

const days = (a: string, b: string) => Math.round((+new Date(b) - +new Date(a)) / 86400000);

export function judge(l: Listing, p: Persona = DIVYANSHI): Verdict {
  const s: Signal[] = []; const hard: Signal[] = []; const pos: string[] = [];
  // R1: can't identify the advertiser
  const notes: string[] = [];
  if (l.permitMissing && l.agentLicPlaceholder) hard.push({ rule: "R1", type: "identity", text: `No valid permit (${l.permit}) and a placeholder agent licence` });
  else if (l.permitMissing) s.push({ rule: "R1", type: "identity", text: `No valid permit on the listing (${l.permit})`, ask: "Please share the DTCM/RERA permit number for this listing." });
  else if (l.agentLicPlaceholder) notes.push("Agent licence field looks like a placeholder (common data-entry gap, not counted)");
  // R2: unit type contradicts the listing
  if (l.hotelConflict && p.needsKitchen) hard.push({ rule: "R2", type: "unit-type", text: l.hotelConflict });
  if (l.hotelDisclosed) s.push({ rule: "R2", type: "unit-type", text: "Hotel room with no kitchen (disclosed in the title)" });
  // R4: stale
  const age = days(l.listed, p.today);
  if (age > 90) s.push({ rule: "R4", type: "stale", text: `Listed ${Math.round(age / 30)} months ago`, ask: "Is this exact unit free for my dates? Please confirm today." });
  else if (age <= 30) pos.push(`Fresh: listed ${age} days ago`);
  // R5: price outlier vs area median
  const dev = l.price / l.sqft / AREA_MEDIAN[l.area] - 1;
  // v2: only "too cheap" is a bait signal; "too pricey" is a value/fit note, not misleading.
  // If the size itself is in doubt (R7), the outlier is the same fact: count it under unit-evidence.
  if (dev <= -0.2) s.push({ rule: "R5", type: l.sizeIssue ? "unit-evidence" : "price-outlier", text: `${Math.round(-dev * 100)}% cheaper per sqft than the ${l.area} median`, ask: "What is the all-in monthly price, and what's included?" });
  else if (dev >= 0.2) notes.push(`${Math.round(dev * 100)}% pricier per sqft than the ${l.area} median (value note, not a trust signal)`);
  // R6: duplicates
  if (l.twin) {
    // v2: "cheaper and older twin" is the same fact as staleness: count it as stale, not a second type.
    if (l.twin.cheaperAndOlder) s.push({ rule: "R6", type: "stale", text: `Same unit is listed ${l.twin.gapPct}% higher in listing #${l.twin.k}, and this cheaper ad is older`, ask: "Is this price still valid today?" });
    else if (l.twin.gapPct <= 5) pos.push(`Same unit listed by a second agent at almost the same price (#${l.twin.k}): the flat is real`);
  }
  if (l.sharedPermitWith) s.push({ rule: "R6", type: "duplicate", text: `Same permit number as listing #${l.sharedPermitWith} in a different area` });
  // R7: unit evidence mismatch
  if (l.recycledPhotos) s.push({ rule: "R7", type: "unit-evidence", text: "Photo set also appears on other listings", ask: "Please send a live video of this exact unit, showing the door number." });
  if (l.sizeIssue) s.push({ rule: "R7", type: "unit-evidence", text: l.sizeIssue, ask: "Please share the floor plan with the size." });
  if (l.cover) s.push({ rule: "R7", type: "unit-evidence", text: l.cover });
  // R8: headline price isn't the price
  const uplift = l.allIn ? l.allIn / l.price - 1 : 0;
  if (l.conditional) s.push({ rule: "R8", type: "price-not-payable", text: l.conditional, ask: "What's the all-in monthly price for a 3-month stay, and can I extend at the same rate?" });
  else if (uplift > 0.1) s.push({ rule: "R8", type: "price-not-payable", text: `Stated extras add ~${Math.round(uplift * 100)}% to the headline`, ask: "Please confirm the all-in monthly total including VAT, service charge and tourism fee." });
  // R9: location can't be verified
  if (l.locationIssue) s.push({ rule: "R9", type: "location", text: l.locationIssue, ask: "Which building and floor is this, and how far is the nearest metro on foot?" });
  // R11: agent track record (weight only)
  if (l.rating && l.reviews >= 20 && l.rating >= 3.5) pos.push(`Agent rated ${l.rating} from ${l.reviews} reviews`);
  // R12: PF rent badge ignored; we use like-for-like AED/sqft above.

  // v2: R8 is resolved by the assistant (it computes the all-in), so it never counts toward removal.
  const suspect = s.filter((x) => x.type !== "price-not-payable");
  const confirmedReal = !!(l.twin && !l.twin.cheaperAndOlder && l.twin.gapPct <= 5);
  // Two agents at the same price prove the flat EXISTS (cancels photo/unit doubts), not that it's AVAILABLE (stale still counts).
  const n = new Set(suspect.map((x) => x.type).filter((t) => !(confirmedReal && t === "unit-evidence"))).size;
  const label: Verdict["label"] = hard.length || n >= 2 ? "removed" : n === 1 ? "check" : "trusted";

  // All-in and fit (D: short list)
  const allIn = l.allIn ?? null;
  const allInText = l.allInNote;
  const cap = p.budget * (l.hook ? 1.05 : 1);
  const overBudget = (allIn ?? l.price) > cap;
  const fit: string[] = [];
  if (overBudget) fit.push(`All-in ~AED ${(allIn ?? l.price).toLocaleString()} is over your AED ${p.budget.toLocaleString()} budget`);
  if (p.needsKitchen && /None/.test(l.kitchen)) fit.push("No kitchen (you need one)");
  if (l.feesUnknown) fit.push("Some fees not priced yet");
  const questions = Array.from(new Set([...hard, ...s].map((x) => x.ask).filter(Boolean) as string[])).slice(0, 3);
  if (questions.length < 3 && l.feesUnknown) questions.push("What is the all-in monthly total for 3 months (DEWA, chiller, VAT, tourism fee, agency fee)?");
  return { label, notes, signals: s, hard, positives: pos, allIn, allInText, overBudget, fit, questions: questions.slice(0, 3) };
}
