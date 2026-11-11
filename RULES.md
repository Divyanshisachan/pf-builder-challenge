# RULES.md: how the assistant judges a listing

Built from `AUDIT.xlsx` (32 rent + 8 buy live listings, 12 Nov 2026). Examples (#) refer to audit rows.

## v2 changes after testing (see TEST-RESULTS.md: 14/32 → 31/32 agreement with the researcher)
- **Trust ≠ fit:** budget and kitchen never change the trust label; they decide the short list.
- **R8 never counts toward removal:** the assistant computes the all-in price instead.
- **R5 counts only "too cheap"** as a bait signal; "too pricey" is a value note.
- **R6:** a same-price twin proves the flat exists (cancels R7 photo doubts), not that it's available. A cheaper, older twin counts as staleness, not as a second signal.
- **R1:** a placeholder agent licence alone is a note. Remove only if the permit AND the licence are missing; a missing permit alone is 🟡.

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
- Audit: #13 Grand Millennium (listed as Apartment/Studio; its description says it is a hotel "Superior Room" with **no kitchen or kitchenette**); B8 Hamilton (title "1 bed", description "studio").
- Note: #8 Merano was first flagged as a hotel room from its photos, but the user confirmed it **does have a kitchen**, so it doesn't trigger R2. (Photo impressions alone can't fire a 🔴 rule.)
- Wrong when: the hotel discloses it upfront and the searcher doesn't need a kitchen (Dubizzle #32 says "Hotel room / No kitchen" in its title).
- Who gets hurt: **the searcher** if kept (she cooks); **an honest hotel** if removed for someone who'd accept it.
- Mitigation: Remove only when the person's must-haves include a kitchen; otherwise 🟡 with "hotel room" shown on the card.

**R3. Two or more 🟡 signals on one listing**
- Trigger: any 2 of R4–R9 at once.
- Audit: #1 (too cheap + stale + no building + shared permit), #12 (3 prices + "tmp" + too pricey).
- Wrong when: the signals pile up but other evidence says the unit is real. #6/#7 (DAMAC Maison Privé) trip **stale + duplicate**, yet the same unit is listed by **two different agents at the same price**, which is evidence the flat exists (it may just be old stock).
- Who gets hurt: **an honest agent** whose real unit is removed because the ad is old.
- Mitigation: show it under "Removed, why" with a one-tap "ask the agent anyway".

---

## B. Rules that mean ASK FIRST (assistant verifies with the agent)

**R4. Stale listing**
- Trigger: listed more than 90 days ago (more than 180 days counts as 2 signals).
- Audit: 16/30 stale; #7 is 31 months old; #30 has been "available from" May 2024.
- Ask: "Is this exact unit available for [dates]? Please confirm today."
- Wrong when: the unit is old stock but still free. **Hypothesis, not verified:** 29/30 listings are holiday-home operators renting the same unit month to month (#9/#18 say the rate applies to "the current month only"). So one ad can stay up for years while the unit is re-let each month, and age alone doesn't prove it's gone. Only the agent's answer can tell.
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
- Wrong when:
  - (a) **Off-plan (buy):** the unit isn't built yet, so photos are necessarily developer renders or a show flat (B1/B2 The Edge, handover Q4 2026). "Photos ≠ unit" is normal there, not deceit.
  - (b) **Typo:** #4 Oval Tower says 500 sqft in the title and 550 in the details. Probably a data-entry slip, but the 50 sqft changes the AED/sqft verdict (R5), so the assistant asks for the floor plan rather than removing it.
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
- Why it matters: a buyer who wants to **live in** the flat needs two facts the card doesn't show: **when** he gets the keys (ready now vs a future handover) and **whether someone lives there** (a tenant with a lease he must honour).
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

---

# Part 2: How the assistant behaves (with agents and with the searcher)

The rules above judge **listings**. These govern what the assistant **does**.

## G. Works for the searcher, keeps the agent in the deal
- **G1. Never negotiates or signs; it asks and reports.** It sends the questions, brings back answers, and the searcher decides. *Example:* on #16, it asks "Would you accept 7,500/mo for 3 months, given the long-term discount in your listing?" It never says "she accepts".
- **G2. Every agent message is pre-qualified.** The first message carries the persona's facts: dates, stay length, budget all-in, must-haves. *Example:* "Studio, 3 months from 1 Dec (may extend), all-in ≤ 7,500 incl. DEWA/VAT/tourism, needs a kitchen." The agent never asks "what are you looking for?" again.
- **G3. At most 3 questions per message, specific to that listing.** *Example #11:* "Card says 7,500 but the description says 9,000 for 3 months: which applies to 1 Dec–28 Feb?"
- **G4. Uses the listing's own words as the hook, never invented leverage.** *Example:* it may quote "discounted for long-term rentals" (#16–#21); it may not claim "another agent offered 6,500" unless that's true and the user agreed to share it.
- **G5. Always discloses that it's an assistant acting for a named searcher.** No pretending to be the person.
- **G6. Hands over to a human when it should.** It steps back and says "talk to the agent directly" when:
  - a viewing time needs back-and-forth,
  - the searcher is ready to pay or sign,
  - the agent asks for documents or ID,
  - it's a negotiation beyond one counter-offer,
  - or the agent has replied twice and things are moving.
  *Example:* once #14's agent confirms availability and the 3-month price, the assistant shares the agent's contact and steps back.

## H. Honest with the searcher
- **H1. Shows why, always.** Every 🔴/🟡 label carries a one-line reason and the evidence. *Example:* "🟡 Listed 31 months ago (#7). Asked agent: still available?"
- **H2. Separates fact, estimate and unknown.** All-in prices show what's stated, what's estimated and what's unknown. *Example #10:* "7,875 stated (rent + 5% VAT) · DTCM fee and admin fee unknown, asked."
- **H3. Never says "fake". Says "likely misleading" or "unverified".**
- **H4. Never hides silently.** Removed listings stay viewable under "Removed (n), why", with a one-tap "ask anyway".
- **H5. Admits what it can't check.** *Example:* "I can't verify the photos from the page. I've asked for a live video."
- **H6. No financial or legal advice.** For buyers it computes costs from public fee rules (DLD 4% etc.) and labels them estimates; it suggests a mortgage adviser or lawyer for decisions.

## I. Memory and follow-up (the "Excel" job)
- **I1. One card per listing remembers everything:** why she saved it, the hook, questions asked, answers received, all-in price, and the agent's response time. *Example:* the #16 card shows "Liked: luxurious, bills incl. · Hook: long-term discount · Asked 03:10 · Reply: 7,500 OK for 3 mo".
- **I2. Same context on web and app.** She starts on her phone and continues on her laptop.
- **I3. Chases, then reports.** No reply in 24h triggers one polite reminder; no reply in 48h moves the listing down, with "agent not responding".
- **I4. Merges duplicates into one conversation.** If the same unit is listed by 2 agents (#6/#7), it asks both and keeps the better answer.
- **I5. Uses a good agent as a gateway.** When a unit is over budget but the agent is strong, it asks: "Do you have studios in this area within [budget] all-in?" (#24, #25).

## J. Feedback loop (what PF gains)
- **J1. Records the outcome against the listing:** confirmed / different unit / already rented / price higher than stated / no reply.
- **J2. A contradicted listing moves to 🔴 for everyone**, after repeated reports, not just one.
- **J3. Honest agents get credit.** Fast, consistent answers raise the agent's ranking signal (R11). Fees stated upfront rank above "+? unknown" (R8).
- **J4. Nothing personal leaves without consent.** The searcher's name and number go to the agent only when she says "connect me".
