# TEST-RESULTS.md: rules engine vs the user's own trust calls

**Test:** run all 32 audited rent listings through `src/lib/scout.ts` (RULES.md) and compare the engine's label (trusted / check / removed) with the researcher's own call in `AUDIT.xlsx` (Trusted / Caution / Remove). Reproduce with `npm run test:rules`.

| Version | Agreement | What went wrong |
|---|---|---|
| v1 (rules as first written) | **14/32** | Far too aggressive: 13 "Caution" listings removed. Hidden fees, "too pricey" and stale ads were stacking up into removals |
| v2 (4 principled fixes) | **31/32** | 1 miss: #31 (Bayut, empty permit section + approx. date) removed, user said Caution |

## The 4 fixes (each is now in RULES.md)
1. **Trust ≠ fit.** "Over budget" or "no kitchen" is a fit problem, not a trust problem. An honest listing can be over budget (#9 Urban Oasis: user trusted it, but it's ~8,700 all-in).
2. **Hidden fees are fixed, not punished (R8).** The assistant computes the all-in price, so R8 never counts toward removal.
3. **Only "too cheap" is a bait signal (R5).** "Too pricey" is a value note. Bait lures with a low price, not a high one. If the size itself is doubtful (#4, #20), the cheap-per-sqft signal is the same fact and counts once.
4. **Two agents at the same price prove the flat exists, not that it's available (R6).** That cancels photo or unit doubts (#6/#7), but staleness still counts (#24/#29 stay "check"). A cheaper, older twin (#14) is the same fact as staleness, so it counts once.
Plus R1 softened: a placeholder **agent** licence alone is a data-entry note, not a signal (#27 trusted by user). Removal needs both permit and licence missing, or permit missing plus another signal.

## Caveat (honest)
v2 was tuned on the same 32 listings it is scored on (**in-sample**). The real test is out-of-sample: a fresh set of listings labelled by someone who hasn't seen the rules. That's in the "could not build" list.

## v2 result per listing
| # | Building | User | Engine | Match | Signals |
|---|---|---|---|---|---|
| 1 | not named | removed | removed | ✅ | R4 Listed 8 months ago; R5 42% cheaper per sqft than the Dubai Marina median; R6 Same permit number as listing #2 in a different area; R9 No building named; generic Dubai Marina map pin |
| 2 | DAMAC Maison Privé A | removed | removed | ✅ | R4 Listed 8 months ago; R6 Same permit number as listing #1 in a different area; R7 Photo set also appears on other listings |
| 3 | Safeer Towers | removed | removed | ✅ | R4 Listed 7 months ago; R5 34% cheaper per sqft than the Business Bay median |
| 4 | Oval Tower | check | check | ✅ | R5 23% cheaper per sqft than the Business Bay median; R7 500 sqft in the title vs 550 in the details |
| 5 | not named | removed | removed | ✅ | R4 Listed 14 months ago; R9 No building named; generic Dubai Marina map pin |
| 6 | DAMAC Maison Privé | check | check | ✅ | R4 Listed 20 months ago; R7 Photo set also appears on other listings; R8 Stated extras add ~15% to the headline |
| 7 | DAMAC Maison Privé A | check | check | ✅ | R4 Listed 31 months ago; R7 Photo set also appears on other listings; R8 Stated extras add ~15% to the headline |
| 8 | Merano Tower | removed | removed | ✅ | R1 No valid permit (None shown) and a placeholder agent licence; R4 Listed 26 months ago |
| 9 | Urban Oasis by Missoni | trusted | trusted | ✅ | R8 Rate valid for the current month only |
| 10 | Studio One | check | check | ✅ | R4 Listed 9 months ago |
| 11 | Bayz by Danube | check | check | ✅ | R8 Card says 7,500; 3-month rate is 9,000; R9 Community photos show Downtown; the building is on the Al Khail Road edge |
| 12 | Studio One | removed | removed | ✅ | R1 No valid permit on the listing ('tmp'); R4 Listed 8 months ago; R8 7,500 only on a 6-month booking; detail page shows 95,000/yr |
| 13 | Grand Millennium | removed | removed | ✅ | R2 Listed as a studio apartment; description says hotel "Superior Room", no kitchen; R4 Listed 4 months ago; R7 Cover photo is the hotel reception |
| 14 | Executive Bay A | check | check | ✅ | R4 Listed 16 months ago; R6 Same unit is listed 14.3% higher in listing #28, and this cheaper ad is older |
| 15 | Marina Diamond 1 | trusted | trusted | ✅ | R8 Rate valid for the current month only |
| 16 | Yacht Bay | trusted | trusted | ✅ | – |
| 17 | Yacht Bay | trusted | trusted | ✅ | – |
| 18 | Urban Oasis | trusted | trusted | ✅ | R8 Rate valid for the current month only |
| 19 | LIV Residence | trusted | trusted | ✅ | – |
| 20 | J ONE Tower A | check | check | ✅ | R5 30% cheaper per sqft than the Business Bay median; R7 686 sqft but photos look much smaller |
| 21 | J ONE Tower A | trusted | trusted | ✅ | – |
| 22 | Marina Diamond 2 | check | check | ✅ | R4 Listed 11 months ago; R8 Rate valid for the current month only |
| 23 | Marina View A | check | check | ✅ | R1 No valid permit on the listing (None shown) |
| 24 | MAG 318 | check | check | ✅ | R4 Listed 9 months ago; R8 Stated extras add ~19% to the headline |
| 25 | Aykon City Tower C | check | check | ✅ | R4 Listed 12 months ago; R8 Stated extras add ~24% to the headline |
| 26 | DAMAC Majestine | removed | removed | ✅ | R1 No valid permit (None shown) and a placeholder agent licence; R8 Stated extras add ~10% to the headline |
| 27 | Regalia by Deyaar | trusted | trusted | ✅ | – |
| 28 | Executive Bay A | trusted | trusted | ✅ | – |
| 29 | MAG 318 | check | check | ✅ | R4 Listed 9 months ago; R8 Stated extras add ~15% to the headline |
| 30 | AG Tower | check | check | ✅ | R4 Listed 7 months ago |
| 31 | Terraces Marasi Dr | check | removed | ❌ | R1 No valid permit on the listing (Section empty); R4 Listed 4 months ago |
| 32 | Canal Bay (hotel room) | check | check | ✅ | R2 Hotel room with no kitchen (disclosed in the title) |
