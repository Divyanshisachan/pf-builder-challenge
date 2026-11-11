import data from "../src/data/rent-audit.json";
import type { Listing } from "../src/lib/scout";
import { trustCheck } from "../src/lib/trustCheck";
const map: Record<string, string> = { Trusted: "genuine", Caution: "checking", Remove: "misleading" };
let ok = 0; const miss: string[] = []; const c: Record<string, number> = {};
for (const l of data as unknown as Listing[]) {
  const t = trustCheck(l); const u = map[l.userTrust!]; c[t.group] = (c[t.group] || 0) + 1;
  if (t.group === u) ok++; else miss.push(`#${l.k} ${l.building}: you=${u} scout=${t.group} (${t.score}) ← ${t.signals.map((s) => `${s.label} ${s.points}`).join(", ")}`);
}
console.log(`Match ${ok}/32`, JSON.stringify(c)); console.log(miss.join("\n"));
