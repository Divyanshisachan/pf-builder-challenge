"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import audit from "@/data/rent-audit.json";
import photos from "@/data/photos.json";
import type { Listing } from "@/lib/scout";
import { judge } from "@/lib/scout";
import { trustCheck, allInMonth1, GROUP_NAME, Group, Trust } from "@/lib/trustCheck";

const AUD = audit as unknown as Listing[];
const PH = photos as Record<string, string>;
const img = (k: number) => (PH[k] ? `https://static.shared.propertyfinder.ae/media/images/listing/${PH[k]}/668x452.jpg` : "");
const fmt = (n: number) => n.toLocaleString("en-US");
const L = (k: number) => AUD.find((l) => l.k === k)!;
const nowStr = () => new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

// ---- Sample data (labelled in UI): agent reliability & building reviews ----
function agentSample(l: Listing) {
  const h = (l.k * 37) % 100;
  const startD = 9 + (h % 3), endD = 18 + (h % 3);
  const ist = (x: number) => { const t = x + 1.5; const hh = Math.floor(t) % 24; return `${hh % 12 || 12}:${t % 1 ? "30" : "00"}${hh < 12 ? "am" : "pm"}`; };
  const dubaiHour = (new Date().getUTCHours() + 4) % 24;
  const live = dubaiHour >= startD && dubaiHour < endD;
  return {
    reply: ["~5 min", "~30 min", "~2 h", "same day"][h % 4], rate: 55 + (h % 40), channel: h % 3 ? "WhatsApp" : "Call",
    hours: `${startD}am–${endD - 12}pm Dubai = ${ist(startD)}–${ist(endD)} your time`,
    best: live ? "Best time to message: now" : `Best time to message: in ${((startD - dubaiHour + 24) % 24) || 1}h`,
  };
}
function buildingSample(l: Listing) {
  const h = (l.k * 53) % 10;
  const overall = [4.4, 3.9, 4.1, 3.3, 4.6, 3.6, 4.2, 3.8, 4.0, 3.5][h];
  return { overall, cats: [["Maintenance", (overall - 0.3).toFixed(1)], ["Staff & security", (overall + 0.2).toFixed(1)], ["Gym & pool", (overall - 0.1).toFixed(1)], ["Noise", (overall - 0.6).toFixed(1)]],
    warn: ["3 residents mention short-stay operators", "2 residents mention lift waits at peak hours", "Residents mention road noise on the highway side", "1 resident mentions slow maintenance"][h % 4] };
}

type Reply = { kind: "confirmed" | "rented" | "none" | "price"; text: string };
function cannedReply(k: number): Reply {
  if (k === 2) return { kind: "rented", text: "Sorry, this one was just rented. I have a similar studio in the same building for 6,800, shall I send pictures?" };
  if (k === 11) return { kind: "price", text: "For 3 months it's AED 9,000/month + 5% VAT + tourism fee. The 7,500 is this month only." };
  if (k === 14) return { kind: "price", text: "The 7,000 rate was last year. Now AED 7,800 + VAT for 3 months." };
  const r = k % 5;
  if (r === 0 || r === 3) return { kind: "confirmed", text: "Yes, available from 1 Dec ✅ Video attached (unit number on the door). All-in price as listed, bills included." };
  if (r === 1) return { kind: "rented", text: "Sorry ma'am, already rented." };
  if (r === 2) return { kind: "confirmed", text: "Available 👍 Sending a live video now. 3-month rate same as listed." };
  return { kind: "none", text: "" };
}

type Hist = { t: string; k: number; from?: Group; to?: Group; text: string; kind: "verdict" | "alert" };

export default function ScoutWishlist({ initialSaved, onBack, onOpen }: { initialSaved: number[]; onBack?: () => void; onOpen?: (k: number) => void }) {
  const [saved, setSaved] = useState<number[]>(initialSaved);
  const [archived, setArchived] = useState<number[]>([]);
  const [tab, setTab] = useState<"list" | "scout" | "history">("list");
  const [scanning, setScanning] = useState(false);
  const [open, setOpen] = useState<Record<Group, boolean>>({ genuine: true, checking: true, misleading: true });
  const [sheet, setSheet] = useState<number | null>(null);
  const [toast, setToast] = useState<{ t: string; undo?: () => void; go?: () => void } | null>(null);
  const [override, setOverride] = useState<Record<number, { group: Group; reason: string }>>({});
  const [flash, setFlash] = useState<number[]>([]);
  const [select, setSelect] = useState<number[] | null>(null);
  const [flow, setFlow] = useState<0 | 1 | 2 | 3 | 4>(0);
  const [needs, setNeeds] = useState({ budget: "AED 5,000–7,500 all-in", move: "1 Dec 2026", stay: "3 months (may extend)", pay: "Monthly", confirms: ["Still available for my dates?", "Live video showing the unit number?", "All-in monthly price (DEWA, chiller, VAT, tourism, agency fee)?"] });
  const [drafts, setDrafts] = useState<Record<number, string>>({});
  const [threads, setThreads] = useState<Record<number, { from: "me" | "them" | "sys"; text: string; t: string }[]>>({});
  const [hist, setHist] = useState<Hist[]>([
    { t: "Yesterday 21:10", k: 16, text: "Price drop: AED 7,700 → 7,649", kind: "alert" },
    { t: "Yesterday 18:42", k: 2, text: "Relisted by another agent cheaper: AED 6,000 → 5,800", kind: "alert" },
    { t: "Mon 10:05", k: 15, text: "Gone stale: no update for 50+ days", kind: "alert" },
  ]);
  const [bell, setBell] = useState(0);
  const [bellOpen, setBellOpen] = useState(false);
  const timers = useRef<number[]>([]);

  const trust = useMemo(() => Object.fromEntries(AUD.map((l) => [l.k, trustCheck(l)])) as Record<number, Trust>, []);
  const groupOf = (k: number): Group => override[k]?.group ?? trust[k].group;
  const reasonOf = (k: number) => override[k]?.reason ?? trust[k].top;
  const active = saved.filter((k) => !archived.includes(k));
  const flagged = active.filter((k) => groupOf(k) === "misleading").length;
  const misleadingN = active.filter((k) => groupOf(k) === "misleading").length;

  useEffect(() => { setToast({ t: `Scout checked your ${active.length} saved homes: ${flagged} need a look →`, go: () => goScout() }); /* eslint-disable-next-line */ }, []);
  useEffect(() => { if (toast) { const t = window.setTimeout(() => setToast(null), 4500); return () => clearTimeout(t); } }, [toast]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const goScout = () => { setTab("scout"); setScanning(true); window.setTimeout(() => setScanning(false), 1400); };
  const ask = (k: number) => {
    const l = L(k); const v = judge(l); const t = trust[k];
    const specific = Array.from(new Set([...v.questions, ...t.signals.filter((s) => s.points < 0).slice(0, 1).map((s) => `Your listing shows: "${s.plainReason}". Can you clarify?`)])).slice(0, 1);
    return `Hi ${l.agent.split(" ")[0]}, I'm interested in your listing at ${l.building} (AED ${fmt(l.price)}/month).\n\nMy needs: ${needs.budget}, move-in ${needs.move}, ${needs.stay}, ${needs.pay.toLowerCase()} payment.\n\n${[...needs.confirms, ...specific].map((q, i) => `${i + 1}. ${q}`).join("\n")}\n\nThanks!\n— Sent by Scout on behalf of Divyanshi`;
  };
  const startFlow = (ks: number[]) => { setSelect(null); setDrafts(Object.fromEntries(ks.map((k) => [k, ""]))); setFlow(1); };
  const toDrafts = () => { setDrafts(Object.fromEntries(Object.keys(drafts).map((k) => [k, ask(+k)]))); setFlow(2); };
  const send = () => {
    const t = nowStr();
    setThreads((th) => ({ ...th, ...Object.fromEntries(Object.entries(drafts).map(([k, d]) => [k, [{ from: "me", text: d, t }, { from: "sys", text: "Delivered · agent usually replies within 30 min", t }]])) }));
    setFlow(4);
  };
  const simulate = () => {
    const ks = Object.keys(drafts).map(Number); let up = 0, down = 0;
    ks.forEach((k, i) => {
      const id = window.setTimeout(() => {
        const r = cannedReply(k); const from = groupOf(k); const t = nowStr();
        if (r.kind === "none") { setThreads((th) => ({ ...th, [k]: [...(th[k] || []), { from: "sys", text: "No reply yet: Scout will remind once in 24h", t }] })); return; }
        setThreads((th) => ({ ...th, [k]: [...(th[k] || []), { from: "them", text: r.text, t }] }));
        const to: Group = r.kind === "confirmed" ? "genuine" : r.kind === "rented" ? "misleading" : "checking";
        const reason = r.kind === "confirmed" ? "Agent confirmed availability and sent a live video" : r.kind === "rented" ? "Agent confirmed it's already rented" : "Agent quoted a higher price than the listing";
        if (to !== from) {
          to === "genuine" ? up++ : to === "misleading" ? down++ : null;
          setOverride((o) => ({ ...o, [k]: { group: to, reason } }));
          setFlash((f) => [...f, k]); window.setTimeout(() => setFlash((f) => f.filter((x) => x !== k)), 2200);
          setHist((h) => [{ t: `Today ${t}`, k, from, to, text: reason, kind: "verdict" }, ...h]);
          setBell((b) => b + 1);
        }
        if (i === ks.length - 1) window.setTimeout(() => setToast({ t: `${up} moved to Looks genuine, ${down} to Likely misleading after agent replies`, go: () => { setFlow(0); goScout(); } }), 300);
      }, 2000 + i * 900 + (k % 3) * 400);
      timers.current.push(id);
    });
  };
  const removeMisleading = () => {
    const ks = active.filter((k) => groupOf(k) === "misleading");
    setArchived((a) => [...a, ...ks]);
    setToast({ t: `${ks.length} moved to Archived`, undo: () => setArchived((a) => a.filter((x) => !ks.includes(x))) });
  };

  const Card = ({ k, mode }: { k: number; mode: "list" | "scout" }) => {
    const l = L(k); const g = groupOf(k); const t = trust[k]; const sel = select?.includes(k);
    return (
      <div className={`wcard ${flash.includes(k) ? "flash" : ""}`} onClick={() => (select ? setSelect(sel ? select.filter((x) => x !== k) : [...select, k]) : setSheet(k))}>
        {select && <input type="checkbox" readOnly checked={!!sel} style={{ width: 20, accentColor: "#E1251B" }} />}
        <img src={img(k)} alt="" referrerPolicy="no-referrer" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 6 }}>
            <b style={{ fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{l.building === "not named" ? `${l.area} (building not named)` : l.building}</b>
            {mode === "scout" && <span className={`label l-${g === "genuine" ? "trusted" : g === "checking" ? "check" : "removed"}`}>{override[k] ? "↻ " : ""}{t.score}</span>}
          </div>
          <div className="muted">AED {fmt(l.price)}/mo · {l.sqft} sqft · {l.area}</div>
          {mode === "scout" && <div className="why">{reasonOf(k)}</div>}
          {mode === "scout" && !select && (
            <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }} onClick={(e) => e.stopPropagation()}>
              <button className="mini" onClick={() => setSheet(k)}>Details</button>
              {g !== "misleading" && <><button className="mini" onClick={() => setToast({ t: "Call: opens the dialler (prototype)" })}>Call</button><button className="mini wa" onClick={() => setToast({ t: "WhatsApp: opens wa.me with Scout's message (prototype)" })}>WhatsApp</button></>}
              {g === "checking" && <button className="mini navy" onClick={() => startFlow([k])}>✦ Ask Scout to verify</button>}
            </div>
          )}
        </div>
      </div>
    );
  };

  // ---------- render ----------
  const header = (
    <div className="top"><div className="bar" style={{ justifyContent: "space-between" }}>
      {onBack && <button onClick={onBack} style={{ fontSize: 22 }}>‹</button>}
      <b style={{ fontSize: 18, flex: 1 }}>Wishlist</b>
      <button onClick={() => { setBellOpen(!bellOpen); setBell(0); }} style={{ position: "relative", fontSize: 18 }}>🔔{bell > 0 && <span className="dot" style={{ position: "absolute", right: -8, top: -4 }}>{bell}</span>}</button>
      <button onClick={goScout} className="scoutbtn"><span className="spark">✦</span>Scout AI</button>
    </div>
      <div className="tabs">
        {(["list", "scout", "history"] as const).map((x) => <button key={x} className={tab === x ? "on" : ""} onClick={() => (x === "scout" ? goScout() : setTab(x))}>{x === "list" ? `❤ ${active.length} saved · ${flagged} flagged` : x === "scout" ? "✦ Scout check" : "History"}</button>)}
      </div>
    </div>
  );

  let body: React.ReactNode;
  if (flow > 0) {
    const ks = Object.keys(drafts).map(Number);
    body = (
      <div style={{ padding: 14 }}>
        <div className="steps">{["Your needs", "Drafts", "Confirm", "Threads"].map((s, i) => <span key={s} className={flow === i + 1 ? "on" : ""}>{i + 1}. {s}</span>)}</div>
        {flow === 1 && <>
          <h3 style={{ margin: "12px 0 6px" }}>Your needs <span className="muted">(set once)</span></h3>
          {(["budget", "move", "stay", "pay"] as const).map((f) => <label key={f} className="fld"><span>{{ budget: "All-in budget", move: "Move-in", stay: "Stay length", pay: "Payment" }[f]}</span><input value={needs[f]} onChange={(e) => setNeeds({ ...needs, [f]: e.target.value })} /></label>)}
          <div className="muted" style={{ margin: "10px 0 4px" }}>Scout always asks:</div>
          {needs.confirms.map((c) => <div key={c} className="msg sys">✓ {c}</div>)}
          <button className="btn navy" onClick={toDrafts}>Draft {ks.length} message{ks.length > 1 ? "s" : ""} →</button>
          <button className="btn ghost" onClick={() => setFlow(0)}>Cancel</button>
        </>}
        {flow === 2 && <>
          <h3 style={{ margin: "12px 0 6px" }}>Scout's drafts <span className="muted">(edit if you like)</span></h3>
          <div className="stack">{ks.map((k) => (
            <div key={k} className="draft"><div className="muted" style={{ marginBottom: 6 }}>To <b>{L(k).agent}</b> · {L(k).agency} · #{k} {L(k).building}</div>
              <textarea value={drafts[k]} onChange={(e) => setDrafts({ ...drafts, [k]: e.target.value })} rows={11} /></div>))}</div>
          <button className="btn navy" onClick={() => setFlow(3)}>Review & send →</button>
          <button className="btn ghost" onClick={() => setFlow(1)}>Back</button>
        </>}
        {flow === 3 && <>
          <h3 style={{ margin: "18px 0 6px" }}>Send to {ks.length} agent{ks.length > 1 ? "s" : ""}?</h3>
          <p className="muted">Nothing is sent until you tap Send. Each agent gets only their own message. Your phone number is shared only when you say "connect me".</p>
          {ks.map((k) => <div key={k} className="row"><span>{L(k).agent}</span><span className="muted">{L(k).building}</span></div>)}
          <button className="btn" onClick={send}>Send {ks.length} message{ks.length > 1 ? "s" : ""}</button>
          <button className="btn ghost" onClick={() => setFlow(2)}>Back</button>
          <p className="muted" style={{ fontSize: 11.5 }}>Production: opens WhatsApp with this text pre-filled (wa.me link), like PF's current WhatsApp button but smarter.</p>
        </>}
        {flow === 4 && <>
          <div style={{ display: "flex", gap: 8, margin: "10px 0" }}>
            <button className="btn navy" style={{ margin: 0 }} onClick={simulate}>▶ Simulate agent replies</button>
            <button className="btn ghost" style={{ margin: 0 }} onClick={() => { setFlow(0); goScout(); }}>See verdicts</button>
          </div>
          {ks.map((k) => <div key={k} className="thread"><div className="thead"><img src={img(k)} alt="" referrerPolicy="no-referrer" /><div><b>{L(k).agent}</b><div className="muted">{L(k).building} · {GROUP_NAME[groupOf(k)]}</div></div></div>
            {(threads[k] || []).map((m, i) => <div key={i} className={`msg ${m.from}`}>{m.text}<div className="ts">{m.t}</div></div>)}</div>)}
        </>}
      </div>
    );
  } else if (tab === "list") {
    body = (
      <>
        <div className="scoutbar" onClick={goScout}><div className="t"><span className="spark">✦</span>Scout checked your {active.length} saved homes</div><p>{flagged} look misleading and {active.filter((k) => groupOf(k) === "checking").length} need checking. Tap to see why →</p></div>
        <div className="count"><span>{active.length} saved</span><button style={{ color: "#E1251B", fontWeight: 700 }} onClick={() => setSelect(select ? null : [])}>{select ? "Cancel" : "Select"}</button></div>
        {active.map((k) => <Card key={k} k={k} mode="list" />)}
      </>
    );
  } else if (tab === "scout") {
    body = scanning ? (
      <div style={{ padding: "60px 24px", textAlign: "center" }}><div className="spark big">✦</div><h3>Checking {active.length} listings…</h3><div className="prog"><i /></div><p className="muted">Price vs area · freshness · duplicates · permits · fees</p></div>
    ) : (
      <>
        <div className="count"><span>Private to you. Agents never see these verdicts.</span><button style={{ color: "#E1251B", fontWeight: 700 }} onClick={() => setSelect(select ? null : [])}>{select ? "Cancel" : "Select"}</button></div>
        {(["genuine", "checking", "misleading"] as Group[]).map((g) => {
          const ks = active.filter((k) => groupOf(k) === g).sort((a, b) => trust[b].score - trust[a].score);
          return (
            <div key={g} className="grp">
              <button className={`ghead g-${g}`} onClick={() => setOpen({ ...open, [g]: !open[g] })}><span>{GROUP_NAME[g]} ({ks.length})</span><span>{open[g] ? "▾" : "▸"}</span></button>
              {open[g] && ks.map((k) => <Card key={k} k={k} mode="scout" />)}
              {open[g] && g === "misleading" && ks.length > 0 && !select && <button className="btn ghost" style={{ margin: "4px 14px 10px", width: "calc(100% - 28px)" }} onClick={removeMisleading}>Remove all likely misleading ({ks.length})</button>}
            </div>
          );
        })}
        {archived.length > 0 && <details className="grp" style={{ padding: "0 14px" }}><summary className="muted" style={{ padding: "10px 0" }}>Archived ({archived.length}): never deleted</summary>{archived.map((k) => <div key={k} className="row"><span>#{k} {L(k).building}</span><button className="mini" onClick={() => setArchived(archived.filter((x) => x !== k))}>Restore</button></div>)}</details>}
        <p className="muted" style={{ padding: "6px 14px 0", fontSize: 11.5 }}>Production would call an LLM; prototype simulates it with rules (see RULES.md).</p>
      </>
    );
  } else {
    body = (
      <div style={{ padding: 14 }}>
        <h3 style={{ marginTop: 4 }}>History</h3>
        {hist.map((h, i) => (
          <div key={i} className="hist"><div className="muted">{h.t}</div>
            <div><b>#{h.k} {L(h.k).building}</b> {h.kind === "verdict" ? <>· {GROUP_NAME[h.from!]} → {GROUP_NAME[h.to!]}</> : <span className="label l-check" style={{ marginLeft: 4 }}>Alert</span>}</div>
            <div className="why">{h.text}</div></div>
        ))}
        <p className="muted" style={{ fontSize: 11.5 }}>Alerts are sample events in this prototype.</p>
      </div>
    );
  }

  const s = sheet !== null ? L(sheet) : null;
  return (
    <>
      {header}
      {bellOpen && <div className="bellpop">{hist.filter((h) => h.kind === "verdict").slice(0, 5).map((h, i) => <div key={i} className="why">#{h.k} → {GROUP_NAME[h.to!]}: {h.text}</div>)}{hist.every((h) => h.kind !== "verdict") && <div className="muted">No verdict changes yet.</div>}</div>}
      {body}
      {select && select.length > 0 && <button className="cta" onClick={() => startFlow(select)}>✦ Message {select.length} agent{select.length > 1 ? "s" : ""}</button>}
      {s && (() => {
        const t = trust[s.k]; const c = allInMonth1(s); const a = agentSample(s); const b = buildingSample(s);
        const twin = s.twin ? L(s.twin.k) : null;
        return (
          <div className="sheetbg" onClick={() => setSheet(null)}><div className="sheet" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}><img src={img(s.k)} alt="" referrerPolicy="no-referrer" style={{ width: 70, height: 52, objectFit: "cover", borderRadius: 8 }} />
              <div><b>{s.building}</b><div className="muted">AED {fmt(s.price)}/mo · {GROUP_NAME[groupOf(s.k)]} · score {t.score}</div></div></div>
            {onOpen && (s.k === 11 || s.k === 16) && <button className="q" style={{ marginTop: 10 }} onClick={() => onOpen(s.k)}>Open listing ›</button>}
            <h4>a. Score breakdown</h4>
            <div className="row"><span>Start</span><b>100</b></div>
            {t.signals.map((x, i) => <div key={i} className="row"><span style={{ flex: 1, paddingRight: 8 }}>{x.plainReason}</span><b style={{ color: x.points < 0 ? "#E1251B" : "#1a7f4b" }}>{x.points > 0 ? "+" : ""}{x.points}</b></div>)}
            {override[s.k] && <div className="row"><span>{override[s.k].reason}</span><b>↻ moved</b></div>}
            <h4>b. All-in cost, month 1</h4>
            {c.incl && <div className="muted">{c.incl}</div>}
            {c.lines.map((x, i) => <div key={i} className="row"><span>{x.label}</span><b>{x.amount !== null ? `AED ${fmt(x.amount)}` : x.note}</b></div>)}
            <div className="row" style={{ borderTop: "1px solid #eee", marginTop: 4, paddingTop: 6 }}><span><b>Known month-1 total</b> (excl. deposit)</span><b>≈ AED {fmt(c.total)}{c.unknown ? " + ❓" : ""}</b></div>
            <h4>c. Same unit elsewhere</h4>
            {twin ? (<>
              {[s, twin].sort((x, y) => +new Date(y.listed) - +new Date(x.listed) || x.price - y.price).map((x, i) => <div key={x.k} className="row"><span>{x.agent} · listed {x.listed}</span><b>AED {fmt(x.price)} {i === 0 ? "← contact this one" : ""}</b></div>)}
            </>) : <div className="muted">No other agent lists this unit.</div>}
            <h4>d. Agent reliability <span className="muted">(sample data)</span></h4>
            <div className="row"><span>Typical reply</span><b>{a.reply}</b></div><div className="row"><span>Reply rate</span><b>{a.rate}%</b></div>
            <div className="row"><span>Prefers</span><b>{a.channel}</b></div><div className="row"><span>Rating</span><b>{s.rating ?? "none"} ({s.reviews})</b></div>
            <div className="muted">Active {a.hours}</div><div style={{ color: "#241F5A", fontWeight: 700, fontSize: 13, marginTop: 4 }}>{a.best}</div>
            <h4>e. Building reviews <span className="muted">(sample, mirrors PF's building reviews)</span></h4>
            <div className="row"><span>Overall</span><b>{b.overall}/5</b></div>
            {b.cats.map(([n, v]) => <div key={n} className="row"><span>{n}</span><b>{v}</b></div>)}
            <div className="msg sys">⚠ {b.warn}</div>
            {groupOf(s.k) === "checking" && <button className="btn navy" onClick={() => { setSheet(null); startFlow([s.k]); }}>✦ Ask Scout to verify</button>}
            <button className="btn ghost" onClick={() => setSheet(null)}>Close</button>
          </div></div>
        );
      })()}
      {toast && <div className="toast"><span>{toast.t}</span>{toast.undo && <b onClick={() => { toast.undo!(); setToast(null); }}>Undo</b>}{toast.go && <b onClick={() => { toast.go!(); setToast(null); }}>View</b>}</div>}
    </>
  );
}
