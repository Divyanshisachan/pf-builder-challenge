# AI-LOG.md: confident wrong answers from AI, and how I caught them

I used Claude (Opus) as my main tool: it read listing pages, built tables, wrote rules and code. Below are moments where it was **confidently wrong about UAE real estate or these listings**, and how I caught each one.

## 1. "Listing #8 Merano Tower is a hotel room with no kitchen"
- **What the AI said:** in the first draft of RULES.md, it used #8 as the example for rule R2 ("hotel room sold as a studio, no kitchen") and flagged it in the audit sheet as a unit-type mismatch.
- **Why it was wrong:** it built that from my early comment that I couldn't *see* a kitchen in the photos, plus an automated page read that said "kitchen not specified". The listing does have a kitchen.
- **How I caught it:** I reopened the listing and checked. I pushed back ("listing #8 does have a kitchen, what are you saying?").
- **Fix:** #8 removed from R2. The real example is #13 Grand Millennium, whose own description says hotel "Superior Room", no kitchen. New principle in RULES.md: **photo impressions alone can never trigger a removal.**

## 2. "#16 and #17 Yacht Bay are the same unit listed by two agents"
- **What the AI said:** the trust sheet treated #16/#17 (both 460 sqft, AED 7,649 vs 7,699, same agency) as one unit with two agents: the "strongest case" that the flat is real.
- **Why it was wrong:** the descriptions say **5th floor** (#16) and **15th floor** (#17). They're two different flats. The "same size + same price = same unit" shortcut fails in towers with identical layouts on many floors.
- **How I caught it:** cross-checking the floor in each description while building the rules.
- **Fix:** RULES.md R6 now merges duplicates only if the floor also matches or is unknown, and #16/#17 is the documented "where this rule is wrong" case.

## 3. "Holiday-home units are re-let month after month, so an old ad is still live"
- **What the AI said:** in R4 (stale listings) it stated as fact that evergreen serviced units are re-let monthly, so old ads aren't misleading.
- **Why it was wrong:** there's no evidence for it. It's a guess about how operators behave. The listings only show that 29/30 are holiday-home operators and some prices are "valid for the current month only".
- **How I caught it:** I asked "how are you saying evergreen units are re-let? I don't understand".
- **Fix:** relabelled as a **hypothesis**. The rule stays 🟡 "ask the agent", never 🔴, because only the agent's answer can tell.

## 4. "#30 AG Tower is an old but genuine unit"
- **What the AI said:** it gave #30 as the example where a stacked-signals rule would wrongly remove a "genuine" listing.
- **Why it was wrong:** nothing on the page proves #30 is genuine. Its "available from" date is May 2024.
- **How I caught it:** I asked "how are you saying this is genuine? What is the reason?".
- **Fix:** the example was replaced with #6/#7. The same unit is listed by two different agents at the same price, which is actual evidence the flat exists.

## 5. Bonus, not real estate but costly: "Scout isn't on Property Finder's web"
- **What the AI said:** after searching the web and the PF homepage, it reported no Scout entry point and suggested it might be app-only.
- **Reality:** Scout exists at `propertyfinder.ae/scout/v2` (beta), behind a login and an "access limited" waitlist. I found it myself.
- **Lesson:** "I couldn't find it" ≠ "it doesn't exist". Finding #67 in `docs/FINDINGS.md`.

## What I changed in how I work with AI
- Every claim in RULES.md must point to a listing number in AUDIT.xlsx.
- Anything the AI infers about the market is labelled a hypothesis until a listing or the agent confirms it.
- I tested the rules against my own verdicts (TEST-RESULTS.md): v1 matched only 14/32, which is how I found the rules were far too aggressive.
