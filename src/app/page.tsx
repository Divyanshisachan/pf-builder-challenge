"use client";
import { useEffect, useMemo, useState } from "react";
import audit from "@/data/rent-audit.json";
import { CARDS, PRESAVED, MOCK_REPLY, Card } from "@/data/cards";
import { judge, Listing, Verdict, DIVYANSHI } from "@/lib/scout";

type Screen = "search" | "results" | "pdp" | "wishlist" | "scout";
const AUD = audit as unknown as Listing[];
const byK = (k: number) => AUD.find((l) => l.k === k)!;
const card = (k: number) => CARDS.find((c) => c.k === k)!;
const fmt = (n: number) => n.toLocaleString("en-US");
const LBL = { trusted: "✓ Trusted", check: "⚠ Check first", removed: "✕ Removed" } as const;

function Heart({ on, size = 24 }: { on: boolean; size?: number }) {
  return (
    <span className="hrt" style={{ width: size + 2, height: size + 2 }}>
      <svg viewBox="0 0 24 24" style={{ width: size, height: size }} fill={on ? "#E1251B" : "none"} stroke={on ? "#E1251B" : "#1c1c1c"} strokeWidth="1.8">
        <path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.8 6.6 4.8c2.1 0 3.6 1.2 5.4 3 1.8-1.8 3.3-3 5.4-3 3.6 0 5.7 3.6 4.2 7-2.1 4.6-9.6 9.2-9.6 9.2z" />
      </svg>
      <i className="ai" aria-label="Scout AI">✦</i>
    </span>
  );
}

const FILTERS = [
  { id: "type", label: "Rent", applied: "Rent", opts: ["Rent", "Buy"] },
  { id: "ptype", label: "Property type", applied: "Apartment", opts: ["Apartment", "Villa", "Townhouse", "Hotel apartment"] },
  { id: "beds", label: "Beds", applied: "Studio", opts: ["Studio", "1", "2", "3+"] },
  { id: "price", label: "Price", applied: "Up to AED 8,000", opts: ["Up to AED 6,000", "Up to AED 8,000", "Up to AED 10,000"] },
  { id: "period", label: "Rent period", applied: "Monthly", opts: ["Yearly", "Monthly", "Weekly", "Daily"] },
  { id: "furn", label: "Furnishing", applied: "Furnished", opts: ["Any", "Furnished", "Unfurnished"] },
];

export default function App() {
  const [screen, setScreen] = useState<Screen>("search");
  const [applied, setApplied] = useState(false);
  const [sheet, setSheet] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState<number>(11);
  const [saved, setSaved] = useState<number[]>(PRESAVED);
  const [toast, setToast] = useState<{ t: string; go?: boolean } | null>(null);
  const [scoutK, setScoutK] = useState<number | null>(null);
  const [chats, setChats] = useState<Record<number, { from: "me" | "them" | "sys"; text: string }[]>>({});
  const [outcome, setOutcome] = useState<Record<number, { label: Verdict["label"]; text: string }>>({});
  const [descOpen, setDescOpen] = useState(false);

  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(null), 3800); return () => clearTimeout(t); } }, [toast]);
  useEffect(() => { window.scrollTo(0, 0); }, [screen, page, open]);

  const verdicts = useMemo(() => Object.fromEntries(CARDS.map((c) => [c.k, judge(byK(c.k))])) as Record<number, Verdict>, []);
  const label = (k: number) => outcome[k]?.label ?? verdicts[k].label;

  const toggleSave = (k: number) => {
    if (saved.includes(k)) { setSaved(saved.filter((x) => x !== k)); setToast({ t: "Removed from wishlist" }); }
    else { setSaved([k, ...saved]); setToast({ t: `Saved. ✦ Scout is checking it`, go: true }); }
  };

  const tapCard = (c: Card) => {
    if (c.detail) { setOpen(c.k); setDescOpen(false); setScreen("pdp"); }
    else setToast({ t: "Prototype: only the first 2 listings open" });
  };

  const askAgent = (k: number) => {
    const v = verdicts[k]; const c = card(k);
    const msg = `Hi ${c.agent.split(" ")[0]}, I'm Scout, Property Finder's assistant, writing for Divyanshi about "${c.title}" (${c.loc.split(",")[0]}).\n\nShe needs: furnished studio with a kitchen, from 1 Dec for 3 months (may extend), budget AED 7,500/month all-in.\n\n${v.questions.map((q, i) => `${i + 1}. ${q}`).join("\n")}\n\nThank you!`;
    setChats((c0) => ({ ...c0, [k]: [{ from: "me", text: msg }, { from: "sys", text: "Sent via Property Finder · agent usually replies within 30 min (simulated reply in this prototype)" }] }));
    setTimeout(() => {
      const reply = MOCK_REPLY[k];
      const res: Record<number, { label: Verdict["label"]; text: string }> = {
        11: { label: "check", text: "Confirmed: the real 3-month price is AED 9,000 + VAT + tourism fee, about AED 9,450+ all-in. Over your budget. The 7,500 was a current-month-only rate." },
        16: { label: "trusted", text: "Confirmed: AED 7,500 all-in for 3 months, available 1 Dec, live video received. Fits your budget. Recommended: reply to book a video viewing." },
        9: { label: "trusted", text: "Fees confirmed: ~AED 8,700 in month 1. Honest listing, but over your budget." },
        14: { label: "check", text: "The 7,000 price is out of date; the real price is AED 7,800 + VAT. Recorded: listing price not current." },
        2: { label: "removed", text: "Bait-and-switch: the agent says it's booked and offers a different unit. Recorded against this listing." },
      };
      setChats((c0) => ({ ...c0, [k]: [...(c0[k] || []), { from: "them", text: reply }] }));
      setOutcome((o) => ({ ...o, [k]: res[k] }));
    }, 1600);
  };

  const counts = { trusted: 0, check: 0, removed: 0 } as Record<Verdict["label"], number>;
  saved.forEach((k) => counts[label(k)]++);

  // ---------- screens ----------
  const Top = (
    <div className="top">
      <div className="bar">
        <div className="logo"><i />Property Finder</div>
      </div>
      <div className="bar" style={{ paddingTop: 0 }}>
        <div className="search">⌕ <span style={{ color: applied ? "#1c1c1c" : undefined }}>{applied ? "Business Bay, Dubai Marina" : "City, community or building"}</span></div>
      </div>
      <div className="chips">
        {FILTERS.map((f) => (
          <button key={f.id} className={`chip ${applied ? "on" : ""}`} onClick={() => setSheet(f.id)}>{applied ? f.applied : f.label} ▾</button>
        ))}
      </div>
    </div>
  );

  const Nav = (
    <div className="nav">
      <button className={screen === "search" || screen === "results" || screen === "pdp" ? "on" : ""} onClick={() => setScreen(applied ? "results" : "search")}>⌕<span>Search</span></button>
      <button className={screen === "wishlist" || screen === "scout" ? "on" : ""} onClick={() => setScreen("wishlist")} style={{ position: "relative" }}>
        <Heart on={screen === "wishlist" || screen === "scout"} size={18} />
        {counts.removed + counts.check > 0 && <span className="dot">{counts.removed + counts.check}</span>}
        <span>Wishlist</span>
      </button>
      <button onClick={() => setToast({ t: "Not part of this prototype" })}>☰<span>More</span></button>
    </div>
  );

  let body: React.ReactNode = null;

  if (screen === "search") {
    body = (
      <>
        {Top}
        <div className="note"><b>Prototype · renter flow.</b> Tap any filter to see its options, then tap <b>Next</b> to apply the filters used in the audit: Rent · Apartment · Studio · up to AED 8,000 · Monthly · Furnished · Business Bay + Dubai Marina.</div>
        <div style={{ padding: "40px 24px", textAlign: "center", color: "#6b6b6b", fontSize: 14 }}>
          <div style={{ fontSize: 42 }}>🏙️</div>
          <p>Divyanshi is moving to Dubai for ~3 months and needs a furnished studio, AED 5,000–7,500 a month all-in.</p>
        </div>
        <button className="cta" onClick={() => { setApplied(true); setScreen("results"); }}>Next: apply filters →</button>
      </>
    );
  }

  if (screen === "results") {
    const per = 6; const list = CARDS.slice((page - 1) * per, page * per);
    body = (
      <>
        {Top}
        <div className="count"><span><b style={{ color: "#1c1c1c" }}>Studios for rent, monthly</b> · 8 audited listings</span><span>Sort: Featured</span></div>
        {list.map((c) => (
          <div className="card" key={c.k}>
            <div className="ph" onClick={() => tapCard(c)}>
              <img src={c.imgs[0]} alt={c.title} referrerPolicy="no-referrer" onError={(e) => ((e.target as HTMLImageElement).style.opacity = "0")} />
              {c.tag && <span className="badge">{c.tag}</span>}
              <span className="cnt">📷 {c.imgCount}</span>
            </div>
            <div className="cb" onClick={() => tapCard(c)}>
              <div className="price">AED {fmt(c.price)} <small>/ monthly</small></div>
              <div className="ttl">{c.title}</div>
              <div className="loc">📍 {c.loc}</div>
              <div className="facts"><span>Studio</span><span>1 bath</span><span>{c.sqft} sqft</span><span className="muted">Listed {c.listed}</span></div>
            </div>
            <div className="actions">
              <button className="act" onClick={() => setToast({ t: "Call: agents often don't pick up foreign numbers" })}>📞 Call</button>
              <button className="act wa" onClick={() => setToast({ t: "WhatsApp opens outside Property Finder" })}>WhatsApp</button>
              <button className="act heart" onClick={() => toggleSave(c.k)} aria-label="Save"><Heart on={saved.includes(c.k)} size={20} /></button>
            </div>
          </div>
        ))}
        <div className="pager">
          {[1, 2, 3, 4].map((p) => <button key={p} className={p === page ? "on" : ""} onClick={() => (p <= 2 ? setPage(p) : setToast({ t: "Prototype: pages 3–4 not included" }))}>{p}</button>)}
        </div>
        {Nav}
      </>
    );
  }

  if (screen === "pdp") {
    const c = card(open); const isSaved = saved.includes(c.k);
    body = (
      <>
        <div className="top"><div className="bar" style={{ justifyContent: "space-between" }}>
          <button onClick={() => setScreen("results")} style={{ fontSize: 22 }}>‹</button>
          <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
            <button onClick={() => setToast({ t: "Share" })}>⇪</button>
            <button onClick={() => toggleSave(c.k)} aria-label="Save to wishlist"><Heart on={isSaved} /></button>
          </div>
        </div></div>
        <div className="gal">{c.imgs.map((u, i) => <img key={i} src={u} alt="" referrerPolicy="no-referrer" />)}</div>
        <div className="sec">
          <div className="price" style={{ fontSize: 22 }}>AED {fmt(c.price)} <small>/ monthly</small></div>
          <div className="ttl" style={{ fontSize: 15, fontWeight: 600 }}>{c.title}</div>
          <div className="loc">📍 {c.loc}</div>
          <div className="facts"><span>🛏 Studio</span><span>🛁 1</span><span>📐 {c.sqft} sqft</span></div>
          <div className="muted" style={{ marginTop: 8 }}>Available from {c.avail} · Listed {c.listed}</div>
          {isSaved && <button className="q" style={{ marginTop: 12 }} onClick={() => { setScoutK(c.k); setScreen("scout"); }}>✦ Scout has a note on this home ›</button>}
        </div>
        <div className="sec"><h4>Description</h4><div className={`desc ${descOpen ? "" : "clip"}`}>{c.desc}</div>
          <button style={{ color: "#E1251B", fontWeight: 600, marginTop: 6 }} onClick={() => setDescOpen(!descOpen)}>{descOpen ? "Show less" : "Read more"}</button></div>
        <div className="sec"><h4>Amenities</h4><div className="amen">{c.amen.map((a) => <span key={a}>{a}</span>)}</div></div>
        <div className="sec"><h4>Property details</h4><div className="kv">
          <span>Type</span><b>Apartment</b><span>Size</span><b>{c.sqft} sqft</b><span>Bedrooms</span><b>Studio</b><span>Furnishing</span><b>Furnished</b><span>Available from</span><b>{c.avail}</b>
        </div></div>
        <div className="sec"><h4>Provided by</h4>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            {c.brokerLogo && <img src={c.brokerLogo} alt="" referrerPolicy="no-referrer" style={{ width: 56, height: 44, objectFit: "contain", border: "1px solid #eee", borderRadius: 8 }} />}
            <div><b>{c.agent}</b><div className="muted">{c.broker}</div><div className="muted">Agent rating: {byK(c.k).rating ?? "none"} ({byK(c.k).reviews} reviews)</div></div>
          </div></div>
        <div className="sec"><h4>Regulatory information</h4><div className="kv"><span>DTCM permit</span><b>{c.dtcm}</b><span>Reference</span><b>#{c.k} (audit)</b></div></div>
        <div className="sticky">
          <button className="act" onClick={() => setToast({ t: "Call: agents often don't pick up foreign numbers" })}>📞 Call</button>
          <button className="act" onClick={() => setToast({ t: "Email" })}>✉ Email</button>
          <button className="act wa" onClick={() => setToast({ t: "WhatsApp opens outside Property Finder" })}>WhatsApp</button>
        </div>
      </>
    );
  }

  if (screen === "wishlist") {
    body = (
      <>
        <div className="top"><div className="bar" style={{ justifyContent: "space-between" }}>
          <b style={{ fontSize: 18 }}>Wishlist ({saved.length})</b>
          <button onClick={() => { setScoutK(null); setScreen("scout"); }} style={{ display: "flex", gap: 6, alignItems: "center", fontWeight: 700, color: "#241F5A" }}><span className="spark">✦</span>Scout</button>
        </div></div>
        {saved.length > 0 && (
          <div className="scoutbar" onClick={() => { setScoutK(null); setScreen("scout"); }}>
            <div className="t"><span className="spark">✦</span>Scout checked your {saved.length} saved homes</div>
            <p>{counts.trusted} trusted · {counts.check} to check first · {counts.removed} removed. Tap a home to see why, or let Scout ask the agents for you.</p>
          </div>
        )}
        {saved.map((k) => {
          const c = card(k); const v = verdicts[k]; const l = label(k); const why = outcome[k]?.text ?? [...v.hard, ...v.signals][0]?.text ?? v.positives[0] ?? "No warning signs on the page";
          return (
            <div className="wcard" key={k} onClick={() => { setScoutK(k); setScreen("scout"); }}>
              <img src={c.imgs[0]} alt="" referrerPolicy="no-referrer" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <b>AED {fmt(c.price)}</b><span className={`label l-${l}`}>{LBL[l]}</span>
                </div>
                <div className="loc" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.loc.split(",").slice(0, 2).join(",")}</div>
                <div className="why">{why}</div>
                <div className="muted" style={{ marginTop: 3 }}>All-in: {v.allInText}</div>
              </div>
            </div>
          );
        })}
        {saved.length === 0 && <p className="note">Tap ♡ on a listing to save it. Scout checks every saved home for you.</p>}
        {Nav}
      </>
    );
  }

  if (screen === "scout") {
    const k = scoutK;
    body = (
      <>
        <div className="top"><div className="bar">
          <button onClick={() => setScreen("wishlist")} style={{ fontSize: 22 }}>‹</button>
          <span className="spark">✦</span><b>Scout</b><span className="muted">· works for you, not the agent</span>
        </div></div>
        {k === null ? (
          <div style={{ padding: 14 }}>
            <div className="msg sys">Your needs: furnished studio with a kitchen · monthly, from 1 Dec, ~3 months · AED {fmt(DIVYANSHI.budget)} all-in.</div>
            <div className="msg them">I checked your {saved.length} saved homes against what's visible on each listing:
              {"\n"}✓ {counts.trusted} trusted · ⚠ {counts.check} to check · ✕ {counts.removed} removed.{"\n\n"}Tap one for the reasons, or ask me:</div>
            {saved.map((s) => <button key={s} className="q" onClick={() => setScoutK(s)}><span className={`label l-${label(s)}`}>{LBL[label(s)]}</span> {card(s).loc.split(",")[0]} · AED {fmt(card(s).price)}</button>)}
            <button className="q" onClick={() => setToast({ t: "Coming next: compare all-in prices side by side" })}>Compare the real monthly cost of all my homes</button>
            <button className="q" onClick={() => setToast({ t: "Coming next: ask every agent in one tap" })}>Ask all agents: still available for 1 Dec?</button>
          </div>
        ) : (() => {
          const c = card(k); const v = verdicts[k]; const l = label(k); const chat = chats[k];
          return (
            <div style={{ padding: "4px 0" }}>
              <div className="wcard" style={{ border: 0, margin: "8px 14px" }}>
                <img src={c.imgs[0]} alt="" referrerPolicy="no-referrer" />
                <div><b>AED {fmt(c.price)}</b> <span className="muted">/ month</span><div className="loc">{c.loc}</div><div style={{ marginTop: 6 }}><span className={`label l-${l}`}>{LBL[l]}</span></div></div>
              </div>
              <div className="sec"><h4>Why</h4><ul className="list" style={{ paddingLeft: 18, margin: 0 }}>
                {v.hard.map((x, i) => <li key={"h" + i}><span className="rule">{x.rule}</span>{x.text}</li>)}
                {v.signals.map((x, i) => <li key={"s" + i}><span className="rule">{x.rule}</span>{x.text}</li>)}
                {v.positives.map((x, i) => <li key={"p" + i} style={{ color: "#1a7f4b" }}>✓ {x}</li>)}
                {v.notes.map((x, i) => <li key={"n" + i} className="muted">{x}</li>)}
                {v.hard.length + v.signals.length === 0 && <li>No warning signs visible on the listing.</li>}
              </ul></div>
              <div className="sec"><h4>Real monthly cost</h4>
                <div className="row"><span>Listed price</span><b>AED {fmt(c.price)}</b></div>
                <div className="row"><span>All-in (what the listing states)</span><b>{v.allInText}</b></div>
                {v.fit.map((f, i) => <div key={i} className="muted" style={{ marginTop: 4 }}>• {f}</div>)}
              </div>
              <div className="sec"><h4>Ask the agent for me</h4>
                {!chat ? (
                  <>
                    <p className="muted" style={{ marginTop: 0 }}>Scout sends one message with your needs and {v.questions.length} questions, then brings the answer back here. The agent stays in the deal.</p>
                    {v.questions.map((q, i) => <div key={i} className="msg sys">{i + 1}. {q}</div>)}
                    <button className="btn navy" onClick={() => askAgent(k)}>✦ Ask {c.agent.split(" ")[0]} for me</button>
                  </>
                ) : (
                  <>
                    {chat.map((m, i) => <div key={i} className={`msg ${m.from}`}>{m.text}</div>)}
                    {chat.length < 3 && <div className="muted">Agent is typing…</div>}
                    {outcome[k] && <div className="msg sys"><b>Scout:</b> {outcome[k].text}</div>}
                    {outcome[k]?.label === "trusted" && <button className="btn" onClick={() => setToast({ t: "Next: Scout hands over to the agent for the viewing" })}>Connect me with the agent for a viewing</button>}
                  </>
                )}
              </div>
              <div style={{ padding: "0 14px 20px" }}><button className="btn ghost" onClick={() => setScoutK(null)}>Back to all saved homes</button></div>
            </div>
          );
        })()}
        {Nav}
      </>
    );
  }

  const f = FILTERS.find((x) => x.id === sheet);
  return (
    <div className="phone">
      {body}
      {f && (
        <div className="sheetbg" onClick={() => setSheet(null)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <h3>{f.label}</h3>
            {f.opts.map((o) => <button key={o} className={`opt ${o === f.applied ? "on" : ""}`} onClick={() => setToast({ t: `Demo uses "${f.applied}"` })}>{o}{o === f.applied ? "  ✓ demo filter" : ""}</button>)}
            <button className="btn" onClick={() => { setSheet(null); setApplied(true); setScreen("results"); }}>Apply</button>
          </div>
        </div>
      )}
      {toast && (
        <div className="toast"><span>{toast.t}</span>{toast.go && <b onClick={() => { setToast(null); setScreen("wishlist"); }}>View ›</b>}</div>
      )}
    </div>
  );
}
