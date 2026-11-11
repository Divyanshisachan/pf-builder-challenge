import data from "../src/data/rent-audit.json";
import { judge, Listing } from "../src/lib/scout";
const map: Record<string, string> = { Trusted: "trusted", Caution: "check", Remove: "removed" };
let agree = 0; const rows: string[] = []; const conf: Record<string, number> = {};
for (const l of data as unknown as Listing[]) {
  const v = judge(l); const u = map[l.userTrust ?? ""];
  const ok = v.label === u; if (ok) agree++;
  conf[`${u}→${v.label}`] = (conf[`${u}→${v.label}`] || 0) + 1;
  rows.push(`| ${l.k} | ${l.building} | ${u} | ${v.label} | ${ok ? "✅" : "❌"} | ${[...v.hard, ...v.signals].map((x) => x.rule + " " + x.text).join("; ") || "–"} |`);
}
console.log(`Agreement: ${agree}/${data.length}`); console.log(JSON.stringify(conf));
console.log(rows.join("\n"));
