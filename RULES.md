# RULES.md: how the assistant judges a listing

Built from `AUDIT.xlsx` (32 rent + 8 buy live listings, 12 Nov 2026). Examples (#) refer to audit rows.

## How it decides
Every listing gets one of three labels, always **with the reason shown**:

| Label | Meaning | What the user sees |
|---|---|---|
| 🔴 **Remove** | Likely fake or misleading | Hidden from the short list; viewable under "Removed (n), why" |
| 🟡 **Ask first** | Could be fine, but a claim can't be checked on the page | Kept, with a pre-written question the assistant sends the agent |
| 🟢 **Short list** | No red flags; fits the person | Ranked by all-in price and fit |

Principles:
- **Never say "fake".** On the page we can only suspect; the agent conversation confirms (audit finding #69).
- **One signal alone rarely removes.** Remove needs a hard rule (R1, R2) or 2+ signals.
- **Misleading ≠ not for me.** Taste (view, luxury, size) only re-ranks, in the Fit layer at the end.

---

## A. Rules that REMOVE (likely fake or misleading)

**R1. Can't identify the advertiser**
- Trigger: no permit shown, permit = "tmp", or placeholder agent licence ("12345", "DriverLicense").
- Audit: #8, #12, #23, #26 (no permit / "tmp"); #6, #7, #27, #29 (placeholder agent licence).
- Wrong when: the permit exists but PF's field mapping didn't display it (Bayut #31 shows an empty regulatory section on a real listing).
- Who gets hurt: **an honest agent** loses leads because of a data-entry gap.
- Mitigation: downgrade to 🟡 if the agent sends the permit number when asked.

**R2. The unit type contradicts the listing**
- Trigger: listed as Apartment/Studio, but the description says hotel room / no kitchen; or "1 bed" in the title vs "studio" in the text.
- Audit: #8 Merano, #13 Grand Millennium (hotel rooms as studios); B8 Hamilton (1BR vs studio).
- Wrong when: the hotel discloses it upfront and the searcher doesn't need a kitchen (Dubizzle #32 says "Hotel room / No kitchen" in its title).
- Who gets hurt: **the searcher** if kept (she cooks); **an honest hotel** if removed for someone who'd accept it.
- Mitigation: Remove only when the person's must-haves include a kitchen; otherwise 🟡 with "hotel room" shown on the card.

**R3. Two or more 🟡 signals on one listing**
- Trigger: any 2 of R4–R9 at once.
- Audit: #1 (too cheap + stale + no building + shared permit), #12 (3 prices + "tmp" + too pricey).
- Wrong when: an older but genuine unit with honest quirks (#30 AG Tower: stale + slightly cheap, yet a real, spacious unit).
- Who gets hurt: **an honest agent** who simply never refreshed the ad.
- Mitigation: show it under "Removed, why" with a one-tap "ask the agent anyway".

---

## B. Rules that mean ASK FIRST (assistant verifies with the agent)

**R4. Stale listing**
- Trigger: listed more than 90 days ago (more than 180 days counts as 2 signals).
- Audit: 16/30 stale; #7 is 31 months old; #30 has been "available from" May 2024.
- Ask: "Is this exact unit available for [dates]? Please confirm today."
- Wrong when: serviced holiday-home units really are re-let month after month, so an old ad can still be live (#6/#7 same unit, 2 agents, same price).
- Who gets hurt: **an honest operator** of evergreen stock.

**R5. Price far from comparable units**
- Trigger: AED/sqft at or below −20% (too cheap) or at or above +20% (too pricey) vs the area median. Buy: below every recorded DLD sale in the same building.
- Audit: too cheap #1, #3, #4, #20; too pricey #8, #10, #12, #13, #26; buy B7 Churchill is below all 5 recorded sales.
- Ask: "What is the all-in monthly price for [term], and what's included?"
- Wrong when: the cheap one is genuine (older building, or a motivated seller, B7), or "too cheap" comes from a **wrong sqft** rather than a low price (#20 lists 686 sqft but looks smaller).
- Who gets hurt: **an honest agent** with a real bargain; **the searcher** misses it if removed.

**R6. Duplicate or near-duplicate**
- Trigger: same building + same size from 2+ agents, or the same permit across different areas.
- Audit: #6=#7, #24=#29, #10/#12, #14/#28; #1/#2 share a permit across Marina and BB; buy B1/B2.
- What it does:
  - Merge into **one card** and show all agents.
  - Gap ≤5% and fresh: **counts as proof the unit is real** (positive).
  - Gap >10%: question the cheaper, older one (#14 is 7,000 and 16 months old vs #28 at 7,999 and fresh).
- Wrong when: two units with the same size are different flats. #16/#17 Yacht Bay, both 460 sqft at almost the same price, are on the **5th and 15th floors**, so they're two real units, not one.
- Who gets hurt: **an honest agent** whose separate unit gets merged and hidden.
- Mitigation: merge only if the floor also matches, or is unknown.

**R7. Unit evidence doesn't match**
- Trigger: size conflict inside the listing; a photo set seen on other listings; a cover photo that isn't the unit (lobby, skyline); size vs photos look inconsistent.
- Audit: #4 (500 vs 550 sqft), #2/#6/#7 (recycled set), #13 (reception cover), #20.
- Ask: "Please send a live video of this unit and the floor plan."
- Wrong when: off-plan or new buildings legitimately use developer show-unit photos; a size conflict is just a typo.
- Who gets hurt: **an honest agent** with a typo or developer photos.

**R8. The headline price isn't the price**
- Trigger: stated extras push all-in more than 10% above the headline; the price is conditional (6-month only, current month only); or the card, detail page and description disagree.
- Audit: 12/30 (e.g. #11 card 7,500 vs 3-month rate 9,000; #12 three prices; #24 +19%; #25 +24%).
- What it does: **recompute and show the all-in**; rank by all-in, not headline.
- Wrong when: the fee structure is normal for serviced apartments, and a long-term discount is common practice, not deception (the user's own view).
- Who gets hurt: **an honest agent who discloses fees** looks pricier than one who hides them.
- Mitigation: listings with unpriced extras show "+? unknown" and rank **below** fully disclosed ones.

**R9. Location can't be verified**
- Trigger: building not named; generic area map pin; community photos only.
- Audit: #1, #5 (generic Marina pin); #11 (community photos imply Downtown, but it sits on the highway edge).
- What it does: community photos **never count** as evidence for the unit. Ask: "Which building and floor?" Show metro walking time when known.
- Wrong when: the agent withholds the name early to avoid being bypassed (common practice).
- Who gets hurt: **the searcher** if kept without checking.

**R10. Buyer only: status unclear**
- Trigger: ready vs off-plan conflict ("ready to move" with a future handover); tenanted without rent or lease end; no tenancy status at all.
- Audit: 8/8 unclear on tenancy; B4 "available" before its 2027 handover; B5 "brand-new and ready" with a Q2 2026 date.
- Ask: "Vacant on transfer? If tenanted: rent, lease end, notice served? Handover date?"
- Wrong when: the seller is an investor and tenancy doesn't matter to this buyer.
- Who gets hurt: **the buyer** if kept unchecked (he can't move in).

---

## C. Signals that only re-weight (never remove alone)

**R11. Agent track record**
- More than 20 reviews and a rating of 3.5 or above: boost. Fewer than 5 reviews: neutral. A rating under 2.5 with 5+ reviews: lower.
- Audit: 3.8 from 104 (#16, #20) beats 4.5 from 2 (#1, #2); #28 has 1.5 from 2.
- Wrong when: a new honest agent has no reviews yet, or one bad review from 2 sinks them (#28).
- Who gets hurt: **an honest new agent**.

**R12. Ignore PF's "% below average" badge on rent**
- It compares monthly rent with an annual average (29/30 wrong). Replace it with like-for-like AED/sqft vs the area median.
- (The sale badge is correct and is kept.)

---

## D. SHORT LIST rules (what earns trust)

A listing goes on the short list only if **all** of these hold:
1. No 🔴 rule fires.
2. At most one 🟡 signal, and the assistant has a question queued for it.
3. **All-in** ≤ the person's budget, or ≤ budget +5% when the description offers a negotiation hook (e.g. "discounted for long-term", #14, #16, #17, #19–21).
4. Meets must-haves: renter needs a real kitchen and monthly terms; buyer needs ready, vacant, and total cash ≤ the cash budget.

**Boosted** when: same unit confirmed by 2 agents at similar prices (#16/#17-style), fees fully stated (#9, #18), distances given (#17), listed ≤30 days.

---

## E. When NOT sure

- **Never hide silently.** Uncertain means 🟡, with the reason and the question shown.
- The assistant sends the agent **3 questions max**: availability today, all-in price for the person's term, live video or floor plan.
- **No reply in 24 hours:** down-rank and tell the user ("agent hasn't replied").
- **The reply contradicts the listing** (different unit, "already rented", higher all-in): move to 🔴 and record it against the listing. **Only the conversation can confirm a fake**, so this record is the evidence PF doesn't have today.
- **The reply confirms it:** promote to 🟢 and save the answer (price, terms) to the listing card for the user.

---

## F. Fit layer (taste, never "misleading")

Re-ranks the short list using the person's stated or picked preferences: view and floor, luxury or modern look, size, gym/pool/sauna, metro walking time. This is where the "would I go ahead" verdicts from the audit live. **Fit never moves a listing to 🔴.**

---

## Where these rules come from (audit counts, 30 PF rent listings)
Stale 16 · Price ≠ payable 12 · Duplicate 12 · Unit mismatch 8 · Identity 8 · Location 3 · **2+ signals: 16 · 0 signals: 2** · PF badge wrong 29/30 · Placeholder broker licence 20/30 · Photos stated real: 0/30.
