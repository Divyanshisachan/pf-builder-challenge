# Scout on the Wishlist: a trust assistant for Property Finder searchers

**Live prototype (open on a phone):** https://pf-builder-challenge-sigma.vercel.app
- `/` is the full renter flow: filters → results → listing → ♡✦ save → Wishlist → Scout
- `/wishlist` jumps straight to Scout with all 32 audited homes saved

Scout lives on the **❤ Wishlist**. It checks every home you saved, sorts them into **🟢 Looks genuine / 🟡 Needs checking / 🔴 Likely misleading**, explains why in one line, shows the real month-1 cost, and **messages the agents for you** (one tap, one message each, with your needs and the listing-specific questions). The agent replies, and the verdict updates. The agent stays in the deal; Scout never negotiates or signs.

## Scope (please read)
- **Renter-first.** 32 rent listings were personally reviewed (30 Property Finder + 1 Bayut + 1 Dubizzle; Business Bay + Dubai Marina studios, 12 Nov 2026). The prototype is the renter flow only.
- **Buyer side is light:** 8 Business Bay 1BR sale listings were checked by Claude, not personally reviewed, with a synthesised buyer persona. Buyer rules are directional.
- **Couldn't try Scout:** PF's Scout is at `/scout/v2` but shows "access currently limited" after login (`docs/CHALLENGES.md`).

## Run it
```bash
npm install
npm run dev          # http://localhost:3000  (/ and /wishlist)
npm run test:trust   # trust score vs my audit verdicts → 32/32 (in-sample)
npm run test:rules   # RULES.md engine vs my verdicts → 31/32 (v1 was 14/32)
```
Next.js 15, React 19, no backend, no API keys.

## What's real and what's mocked
| Real | Mocked / sample |
|---|---|
| All 32 listings: prices, sizes, dates, agents, agencies, permits, links (from live pages, 12 Nov 2026) | **Agent replies** (canned, grounded in each listing's own description, e.g. #11 "3-month rate is 9,000") |
| Listing photos (hot-linked from PF's CDN) and the full descriptions of #11 and #16 | **Agent reliability** (reply time, active hours, reply rate): labelled "sample data" |
| Trust signals extracted from each page and description (`src/data/rent-audit.json`) | **Building reviews** in the Details sheet: labelled sample (real PF building ratings are used only in the score) |
| My own verdict per listing (Trusted / Caution / Remove), used to calibrate and test | **History alerts** (price drop, relisted cheaper, gone stale): sample events |
| Area medians AED/sqft computed from the audited listings | **"AI"**: rules, not an LLM. Production would use an LLM to extract signals and draft messages; the prototype simulates it |
| Fee structures stated in each description (VAT, service %, tourism fee, deposit) | Sending: messages stay in-app. Production opens WhatsApp pre-filled (wa.me), like PF's current button |

## Repo map
| File | What it is |
|---|---|
| `AUDIT.md`, **`AUDIT.xlsx`** | 32-listing rent audit + 8-listing buy audit, with links, flags and a summary (source of truth: xlsx) |
| **`RULES.md`** | What makes a listing likely misleading, what earns the short list, what happens when unsure, and where each rule is wrong / who gets hurt. Part 2: how Scout behaves with agents |
| `TEST-RESULTS.md` | Rules engine vs my verdicts: v1 14/32 → v2 31/32, and why |
| **`AI-LOG.md`** | Confident wrong AI answers and how I caught them |
| `docs/PERSONA.md`, `docs/PERSONA-BUYER.md` | Divyanshi (short-term renter), Rohan (first-time buyer) |
| `docs/JOURNEY.md`, `JOURNEYS.pdf` | Rent and buy journeys, with where the audit found the pain |
| `docs/FINDINGS.md` | 72 raw findings from the audit |
| `evidence/` | Per-listing descriptions, price comparison, agents, shortlist, Scout screenshots |
| `src/lib/trustCheck.ts` | Scout score: start at 100, weighted signals, thresholds 70 / 40 |
| `src/lib/scout.ts` | RULES.md engine (labels, questions for the agent) |
| `src/app/ScoutWishlist.tsx` | Wishlist, Scout groups, Details sheet, outreach, verdict updates, history |

## What's missing (and what it would need)
- **Live signal extraction:** an LLM pass over every listing and description (I extracted the signals by hand).
- **PF internal data:** listing edit history, the WhatsApp lead outcome (did the agent reply? was the unit rented?), agent response times, and duplicate detection by photo hash. These are needed to replace the sample data and to run the feedback loop.
- **Out-of-sample test:** the score is calibrated on the same 32 listings it's scored on. Next step: label 100 fresh listings blind.
- **Real outreach:** WhatsApp Business API, or a PF inbox thread, so agent replies come back into the app.
- **Buyer flow screens:** only the rules and audit exist for buyers.
