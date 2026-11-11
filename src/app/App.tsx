"use client";
import { useEffect, useMemo, useState } from "react";
import audit from "@/data/rent-audit.json";
import { CARDS, PRESAVED, MOCK_REPLY, Card } from "@/data/cards";
import { judge, Listing, Verdict, DIVYANSHI } from "@/lib/scout";
import ScoutWishlist from "./ScoutWishlist";
import { trustCheck } from "@/lib/trustCheck";

export type Screen = "search" | "results" | "pdp" | "wishlist" | "scout";
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

export default function App({ start = "search" }: { start?: Screen }) {
  const [screen, setScreen] = useState<Screen>(start);
  const [applied, setApplied] = useState(start !== "search");
  const [sheet, setSheet] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState<number>(11);
  const [saved, setSaved] = useState<number[]>(start === "wishlist" ? [11, 16, ...PRESAVED] : PRESAVED);
  const [toast, setToast] = useState<{ t: string; go?: boolean } | null>(null);
  const [scoutK, setScoutK] = useState<number | null>(null);
  const [chats, setChats] = useState<Record<number, { from: "me" | "them" | "sys"; text: string }[]>>({});
  const [outcome, setOutcome] = useState<Record<number, { label: Verdict["label"]; text: string }>>({});
  const [descOpen, setDescOpen] = useState(false);

  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(null), 3800); return () => clearTimeout(t); } }, [toast]);
  useEffect(() => { window.scrollTo(0, 0); }, [screen, page, open]);

  const verdicts = useMemo(() => Object.fromEntries(AUD.map((l) => [l.k, judge(l)])) as Record<number, Verdict>, []);
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
        {saved.filter((k) => trustCheck(byK(k)).group === "misleading").length > 0 && <span className="dot">{saved.filter((k) => trustCheck(byK(k)).group === "misleading").length}</span>}
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
          {isSaved && <button className="q" style={{ marginTop: 12 }} onClick={() => setScreen("wishlist")}>✦ Scout has a note on this home ›</button>}
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

  if (screen === "wishlist" || screen === "scout") {
    body = (
      <>
        <ScoutWishlist key={saved.join(",")} initialSaved={saved} onBack={() => setScreen(applied ? "results" : "search")} onOpen={(k) => { setOpen(k); setDescOpen(false); setScreen("pdp"); }} />
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
