# Trust Assistant: a short list you can believe

[Prototype](https://pf-builder-challenge-sigma.vercel.app) · [Repo](https://github.com/Divyanshisachan/pf-builder-challenge) · [Audit (Excel)](AUDIT.xlsx) · [Audit (MD)](AUDIT.md) · [Rules](RULES.md) · [AI-LOG](AI-LOG.md) · [Probable bug](https://drive.google.com/file/d/1JTdwMoPgwjZV9Ec_XqBifWx96aUOiNLn/view?usp=sharing) · Designed version: [ONE-PAGER.pdf](ONE-PAGER.pdf)

**Persona: Divyanshi, short-term renter** (India → Dubai, first time). *"Show me a studio I'd actually like, at the price I'll really pay."*
- **Needs:** studio with a real kitchen and monthly terms · all-in ≤ AED 7,500/mo, approved by her company · safe building, metro or easy cabs · finalise from India, on her phone.
- **Frustrations:** hidden fees broke an approved budget · bait photos, a different unit on WhatsApp · re-explains her needs; agents ignore Indian numbers · only ~10 of 30 WhatsApps got a reply (my past search) · loses track across ~10 WhatsApp chats.

**Stakeholders:** searcher · agent/agency · property owner · Property Finder · holiday-home operators · developers.
*I studied the renter's flow in depth; the buyer's flow only at a bird's-eye level (8 listings), within this assignment's scope.*

## The problem behind the problem
On the surface, some listings are fake. Underneath, from the page she can't tell which listings are real, available and within budget. So she messages everyone, waits, and gives up. Honest listings get buried under bait, and PF never learns which listings misled her, because the truth comes out later on WhatsApp.
**Audit of 32 live studios** ([Excel](AUDIT.xlsx) · [repo](AUDIT.md)):
- Only 2/30 raise no warning sign.
- 0/30 let you work out the all-in price.
- 16/30 were listed 90+ days ago.
- Only 12/32 were worth an inquiry.
- **Probable bug:** PF's "~90% below average" badge compares monthly rent with an annual average on 29/30 rent listings.

## Rules ([full set](RULES.md))
Each warning sign lowers trust. Scout sorts saved homes into **Looks genuine · Needs checking · Likely misleading**, and always says why.

| Rule | Warning sign |
|---|---|
| R1 | No permit, or a fake licence |
| R2 | "Studio" is really a hotel room |
| R3 | Two or more warning signs |
| R4 | Listed 90+ days ago: still free? |
| R5 | Price ±20% vs the area median |
| R6 | Same unit, 2 agents, same price |
| R7 | Photos or size don't match |
| R8 | Hidden fees or a conditional price |
| R9 | Building or location unclear |
| R10 | Buyer: handover or tenancy unclear |

**Where rules break:** each rule in RULES.md lists a real case where it's wrong. For example, R6 thinks #16/#17 are one unit, but they're on different floors. Tested on my 32 calls: the first rules matched 14/32; the fixed rules match 31/32. (Point weights are in RULES.md.)

## Where it lives
- **In the Wishlist, on web and app.** The ❤ is the trigger.
- Scout checks every saved home ("Scout checked your 32 saved homes: 8 look misleading"). Each card shows **Looks genuine**, **Needs checking** or **Likely misleading**, with a one-line reason.
- **"Ask Scout to verify"** drafts one message per agent. Nothing is sent until she taps Send.
- **Not on search results** (I couldn't reach PF's Scout: it's on a waitlist). Verdicts stay private; there is no public badge.

## Why use it, and when not
- **Use it to find out:** which listings are real, which agents are likely to reply, which listings are misleading, and which really fit the budget once the fees hidden in the description are added.
- **Don't use it:** when you already trust the agent; for viewings, negotiation or signing (it hands over to a human); or for legal or mortgage decisions.

## Agents and PF revenue (a suggestion)
There's no data yet on revenue impact, so this is the trade-off if PF ships it.
- **Pros:**
  - Honest agents get serious leads, and credit for stating fees.
  - Bait listings lose leads.
  - Verdicts stay private, so no public label hits paying agents.
  - It gives PF a trust edge over Bayut's TruCheck.
  - PF learns which listings mislead.
- **Cons:**
  - Fewer raw leads at first, while PF earns per listing and per lead.
  - False flags can hurt honest agents (holiday homes look stale).
  - Agent pushback.

## Metrics it moves
- **Portal metrics:** searcher-to-lead rate, agent reply rate, lead-to-viewing/deal rate, returning searchers, agent spend.
- **What Scout should move, from the 32-listing audit:**
  - Fewer messages wasted on poor listings (only 12/32 were worth one).
  - A higher agent reply rate (~10/30 in my own search).
  - A faster route to a trusted short list.
- The size of each move needs the 1% test.

## One number that proves it
- **The number:** how often Scout is right. Of the homes Scout calls Looks genuine, what share does the agent confirm are real, still free, and at that price?
- **Test:** turn Scout on for 1% of renters in Business Bay and Marina for 4 weeks, and compare with the other 99%.
- **I'm wrong if** Scout's homes aren't confirmed at least 5 points more often, or people don't book more viewings.

## What I could not build (priority order)
| # | Feature | Why it's needed | Why I couldn't add it |
|---|---|---|---|
| 1 | Real agent replies | Real replies and reply rates (simulated / sample in the UI) | No WhatsApp or PF inbox integration; no reply data |
| 2 | Buyer-side prototype | The assistant must work for buyers too | Time; buyer research was bird's-eye only (8 listings, no interviews) |
| 3 | Live permit and licence check | R1: proves who the advertiser is | No DLD Trakheesi / DTCM data access |
| 4 | Photo matching across listings | R7: catches recycled bait photo sets | Needs PF's image store plus engineering |
| 5 | DLD transaction prices | R5: fair price per building, especially for buyers | No DLD feed; I used listing medians instead |
| 6 | Outcome feedback loop | Contradicted listings reported to PF moderation | Needs a PF backend and a moderation process |
| 7 | LLM reading of descriptions | Extracts fees and terms from free text | No API key; the prototype uses fixed rules |
