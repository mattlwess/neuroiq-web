

<!-- ============================================================ -->
<!-- SOURCE FILE: README.md -->
<!-- ============================================================ -->

# Sentinel Node — Self-Storage Smart-Lock Redesign

Research, engineering design, IP strategy, and go-to-market materials for a **facility-wired,
battery-free, operator-owned** smart lock for self-storage — with integrated sensing and tenant
wayfinding — intended for internal use by Next Century Self Storage (NCSS).

> **Status:** Engineering + IP-strategy + business analysis. **Not legal, tax, or investment advice.**
> A formal freedom-to-operate opinion and any patent filing must be finalized by a registered patent
> attorney. All financial figures are illustrative and require NCSS actuals. Not affiliated with Nokē,
> Janus International, DaVinci Lock, or Storage Defender; marks used for identification only.

## The thesis in one line
Nokē and DaVinci must sell to any facility assuming zero infrastructure — that forces retail batteries
and vendor clouds. A single operator who can run low-voltage wire is freed from both: **own the wire,
delete the battery; own the stack, delete the subscription.**

## Contents

| File | What it is | Audience |
|---|---|---|
| `smart-lock-brief.md` | The full deep-dive: patent landscape (Nokē / DaVinci / Storage Defender), design, charging, sensors, IP/FTO, roadmap — with citations | You + counsel |
| `sentinel-brief.html` | Shareable interactive one-pager (patent map, power architecture, Guide Path, live ROI calc) | Partners |
| `sentinel-deck.html` | 12-slide projectable partner deck (↑/↓ or space to navigate) | NCSS meeting |
| `sentinel-financial-model.html` | Interactive REIT value model — capex, NOI, cap-rate valuation lift, NPV | You + CFO |
| `sentinel-prototype-spec.md` | One-corridor prototype: block diagram, voltage-drop math, BOM, test plan | Engineer / EE |
| `design-around-memo.md` | Design-around analysis of the 3 red-flag patents + 9 standing design rules + attorney packet | Patent attorney |
| `provisional-patent-skeleton.md` | Provisional patent drafting scaffold (field, spec outline, 15 draft claims) | Patent agent |
| `wayfinding-phase2-scope.md` | "Guide Path" Phase-2 feature: wayfinding + staff presence signaling | Product / eng |

The `.html` files are self-contained — open them directly in any browser (double-click), no server needed.

## Recommended next steps
1. **File the provisional** (`provisional-patent-skeleton.md`) before this material circulates outside NDA.
2. **Formal FTO** on the three red-flag claims (`design-around-memo.md` → attorney packet).
3. **Build the one-corridor prototype** (`sentinel-prototype-spec.md`) at a live NCSS site.
4. **Pilot one facility**; plug real numbers into `sentinel-financial-model.html` for the REIT story.

## The 9 standing design rules (keep the build clear of the patent walls)
Non-shackle latch · single-authority credential validation · signed tokens not typed combinations ·
credential-revocation not physical overlock · never tie code issuance to a payment event · no
touch/quick-click input · wired + provisioned node · fixed-track or wiping-contact power (not inductive) ·
signed tokens over SHA-3 time codes. See `design-around-memo.md` for the mapping to each patent.


<!-- ============================================================ -->
<!-- SOURCE FILE: smart-lock-brief.md -->
<!-- ============================================================ -->

# Self-Storage Smart-Lock: Patent Landscape & Clean-Sheet Design Brief

**Prepared for:** M. Wess (Evolve Storage) — for potential Next Century Self Storage (NCSS) partnership
**Purpose:** Reverse-engineer the Nokē and DaVinci access model, map their patents, and design a
better internally-owned lock that (a) kills the monthly subscription, (b) kills the battery-replacement
problem, and (c) optionally folds in Storage Defender-style sensing.
**Date:** 2026-07-03
**Status:** Technical/business working document — **NOT a legal freedom-to-operate (FTO) opinion.**

---

## 0. Read this first — two honest caveats

1. **"Internal use only" does NOT avoid patent infringement.** US patent law (35 U.S.C. §271) makes it
   infringement to *make, use, offer to sell, or sell* a patented invention. **Using** the locks inside
   NCSS facilities is "use," and **building** them is "making" — both infringe if a valid claim reads on
   the product, retail or not. What "internal only" *does* change is your **risk exposure**, and heavily in
   your favor: (a) no product on a shelf for a competitor to buy and reverse-engineer, (b) far lower
   discoverability, (c) damages are capped at a *reasonable royalty on your own internal use*, not lost
   retail profits, and (d) no inducement/contributory exposure from third-party buyers. So the strategy is
   right — just don't rely on "we don't sell it" as a legal shield. Rely on **designing around the claims.**

2. **This is not a lawyer.** Patent databases were partly egress-blocked during research, so grant dates and
   verbatim claim text below are drawn from search-index extractions and must be re-pulled from USPTO Patent
   Center / Google Patents before you rely on them. Before spending real money on hardware, get a registered
   patent attorney to run a formal FTO search and read the independent claims of the patents flagged 🔴 below.
   The good news: the design in Part 4 is engineered specifically to make that review cheap and fast.

---

## 1. The competitive landscape in one page

| | **Nokē / Janus International** | **DaVinci Lock** | **Storage Defender** |
|---|---|---|---|
| What it is | Electronic **Bluetooth** smart lock (padlock / on-door latch) | **Mechanical** 4-digit combination padlock + cloud code mgmt | In-unit **sensor** + SMS alerting SaaS (not a lock) |
| Power | Battery (CR2032 / proprietary 3.6V Li), OR hardwired (Ion) | **None** — dumb mechanical lock | Battery wireless sensors |
| Connectivity | BLE mesh → gateway → cloud, 128-bit AES | None in lock; codes sent via SMS/email/web | Wireless (undisclosed; likely sub-GHz LPWAN) → gateway → cloud |
| Tenant unlock | Phone app / BLE fob | Enter a combination delivered as a code | N/A (monitoring only) |
| Delinquency | Electronically disable app access | Withhold the combination; staff places physical overlock | N/A |
| Battery pain | **Yes** — ~1–2 yr, proprietary cell, tool to replace | **None** (its main selling point) | Claims 5–10× WiFi battery life |
| Subscription | Quote-based system + ~$5.99/tenant/mo tech fee | Lock purchase + software subscription (added later, backlash) | Per-tenant monthly (drives operator ARR) |
| IP posture | Large electronic-lock portfolio (mechanism + software) | Small but **litigation-tested** overlock portfolio | In-unit-sensor patent family |

**The strategic read:** Nokē and DaVinci attack the same problem (self-service access + delinquency control)
from opposite hardware philosophies. Nokē's patents protect an **electronic BLE padlock and its
mechanism**; DaVinci's protect a **software model for mechanical combination overlocks**. Storage Defender
sits alongside both selling **sensing**. Your opening is the quadrant none of them own well: a
**facility-wired, battery-free, operator-owned electronic lock with sensing built in** — which is exactly
what your infrastructure advantage (you can run wire; they can't assume it) makes possible.

---

## 2. Patent landscape — what actually blocks you

Legend: 🔴 = directly relevant, read the claims before building · 🟡 = adjacent, watch it · ⚪ = context/prior art.
All numbers verified as real listings; **dates/claims must be re-verified at USPTO** (see caveat 2).

### 2a. Nokē / Janus (assignee NOKE, INC. / Janus International Group)

| Pat. no. | Title | Gist of coverage | Flag |
|---|---|---|---|
| **US9747739B2** | Wireless locking device | Electronic padlock that detects **user presses on the shackle** (short/long "quick-click" sequence) + BLE phone auth. The core FŪZ/Nokē padlock. | 🟡 |
| **US10176656B2** | Wireless locking device | Continuation: **capacitive touch panel** storing a code of long/short touches; match releases shackle. | 🟡 |
| **US10210686B2** | Electronic padlocks & related methods | The **mechanism**: shackle held by **ball bearing(s) + asymmetric cam** with locked / unlocked / removal states. | 🔴 (padlock form factor) |
| **US10713868B2** | Duration-based touch sensor unlock codes | **Morse-style short/long touch** unlock-code override. | 🟡 |
| **US11352817B2** | Electronic lock & interchangeable shackles | One lock body accepts **interchangeable shackles** via a tubular spacer. | ⚪ |
| **US11098500B2** (from US2019/0368233A1) | Lockout management w/ **multi-keyholder** electronic locking devices | Access system that flags a unit so **one keyholder (e.g., delinquent tenant) is denied while managers retain access** — the electronic overlock/lockout software. | 🔴 (your delinquency feature) |
| US10964139 / US11488429 | Access control electronics for wireless locks | BLE access-control electronics (assignee unconfirmed). | 🟡 |
| US11356642 / US11962944 / US12401768 | Electronic lock with remote monitoring | Cloud/gateway-monitored lock family (assignee unconfirmed). | 🟡 |
| US12198486 | Keyless puck lock apparatus | Puck-lock form factor (assignee unconfirmed). | ⚪ |

**Design-around read on Nokē:** their strongest, most specific claims are tied to **padlock hardware** —
the ball-bearing/asymmetric-cam shackle (US10210686) and the **touch/quick-click** input (US9747739,
US10176656, US10713868). If your lock is **not a padlock**, has **no shackle-press / capacitive-touch code
input**, and does not use their specific cam mechanism, you clear the bulk of the hardware wall by
construction. The one you must have counsel read is **US11098500 (multi-keyholder lockout)** — your
delinquency feature is the closest thing you build to a Nokē claim.

### 2b. DaVinci Lock (assignee 10F Pursuit LLC → DaVinci Lock LLC)

| Pat. no. | Title | Gist of coverage | Flag |
|---|---|---|---|
| **US10475115B2** | Manage distributed encrypted combination over-locks remotely | **Foundational.** Server stores lock ID + **encrypted unlock code**; gives customer immediate access to an **over-locked** unit **upon payment** of past-due balance. | 🔴 (if you use combination codes) |
| **US10922747B2** / **US11232513B2** | Secure & remove over-locks (from vacant units) | Self-service **removal of a physical overlock** without staff intervention. | 🟡 |
| **US11538098** | Randomly generate & associate unlock codes + lock IDs | Randomly generate/**pair codes to lock IDs** for locks **not capable of electronic communication** (dumb locks). | 🟡 |
| **US11663650 / US12014294** | Transmit unlock codes on **event triggers** | Reveal a code to a user on a **trigger** (delinquency cured, new rental). | 🔴 (if you deliver codes on events) |
| US12131373 | Facilitate access to self-storage units | Random code/ID pairs + distributed access mgmt, deliver to mobile device. | 🟡 |
| US12272195 | Transmit unlock codes via display augmentation | Newer code-**display** delivery method. | ⚪ |

**Design-around read on DaVinci:** their claims are **saturated with "combination / unlock code" and
"overlock"** language, aimed at **mechanical locks with no electronics**. An **electronic, credential-based
lock that never issues a human-typed combination and never relies on staff placing a physical overlock**
falls outside the natural reading of this family. **The trap:** if you add a **PIN-keypad fallback** and
tie **PIN issuance to a delinquency-cure event**, you walk straight back into US10475115 and US11663650.
Keep PIN issuance (if any) decoupled from payment events, or skip typed codes entirely. Note DaVinci
**won an injunction against SpiderDoor (2025)** on this exact family — they *enforce*, so respect it.

### 2c. Storage Defender / TeamOfDefenders LLC

| Pat. no. | Title | Gist of coverage | Flag |
|---|---|---|---|
| US11222522 / US11288946 / US11527147 / US11688271 | Devices/systems/methods for **monitoring controlled spaces for transitory uses** | **Battery-powered** in-unit sensor node, various sensors, wireless, **requires no external wiring and no device pairing**, for spaces with changing occupants. | 🟡 |
| US12424081 (Cieri/Yadov — StorageDefender-affiliated) | "Smart lock" | Electromechanical lock with **SHA-3 time-sensitive access code**; *cites DaVinci as prior art*. | 🟡 (if you do time-based OTPs) |

**Design-around read on Storage Defender:** their independent claims appear to **hinge on "no external
wiring" and "no device pairing."** Your node is **wired and provisioned** — which reads *outside* those
limitations by design. Their patents are more of a green light than a wall for your architecture: the very
thing that makes yours better (wire) is the thing that distinguishes it from their claims.

### 2d. Third-party "charge while locked" patents (nobody above owns these)

| Pat. no. | Title | Relevance | Flag |
|---|---|---|---|
| **US9787127B2** | Door lock with a **wireless charging** device | Frame + door coils **align when door closed** and trickle-charge the lock. Most on-point to "charge while locked." | 🔴 (if you go inductive) |
| **CN107342610A** | Automatic charging device for magnetic door lock | **Contacts auto-connect and charge when door closes** (contact-charging analog). | 🟡 |
| US11268300B2 (Schlage/Allegion) | Energy Harvesting Lock System | Harvest ambient (solar/RF/kinetic) energy for a lock. | ⚪ |
| EP2378041A2 | Electric door release powered by energy harvester | Harvesting prior art. | ⚪ |

**The elegant escape:** US9787127 (inductive-when-closed) and CN107342610 (contacts-when-closed) already
claim "power the lock only when it's closed." **You avoid both entirely on roll-up doors by putting the
electronics on the fixed track and running a wire to them — there is nothing to "charge across a gap"
because nothing moves.** The charge-while-closed problem you posed is only real on **swing-door leaves**,
and there a **wiping gold contact block** (distinct from CN107342610's magnetic scheme) is the safer lane.

---

## 3. Root-cause of the two pains you want gone

- **Battery life.** Both battery products fight physics: a lock must sleep for months on a coin cell, yet
  fire a motor that wants an amp for 50–80 ms. Cold storage units make it worse (CR2032 capacity craters
  below freezing). Nokē's "fix" is a bigger proprietary cell + a replacement tool — i.e., they moved the
  labor, they didn't remove it. **Root cause = onboard chemical energy store.** Remove the store, remove
  the problem.
- **Subscription.** Nokē (~$5.99/tenant/mo tech fee + system), DaVinci (software sub added *after* people
  bought locks), Storage Defender (per-tenant). You're renting three vendors' clouds. **Root cause =
  you don't own the stack.** For a single operator (NCSS) this is pure margin leakage and a data-ownership
  problem — both fixable by building it once and owning it.

Your instinct is correct: these are **old constraints (retail battery + vendor SaaS)**, and they only exist
because Nokē/DaVinci must sell to *anyone's* facility with *no* assumed infrastructure. **You don't have
that constraint.** That is the entire wedge.

---

## 4. The clean-sheet design — "wired-track, battery-free, owned"

Working codename: **NCSS Sentinel Node** (placeholder). Core thesis: *because you can run low-voltage wire,
you can delete the battery and the vendor cloud simultaneously.*

### 4a. Power architecture (this is the differentiator)

```
[Corridor] Listed NEC Class 2 power supply (24 VDC)
     │  (one home-run or short daisy-chains per corridor; 18 AWG typical)
     ├── Door Node 1 ── local buck (24→3.3V, low-Iq) ── SUPERCAP/LIC buffer ── MCU + motor + sensors
     ├── Door Node 2 ── …
     └── Door Node N ──  (buffer supplies the 50–150 mJ motor surge locally,
                          so one thin pair feeds many doors)
```

- **Backbone:** per-corridor **NEC Class 2, 24 VDC** low-voltage bus. Class 2 is touch-safe, needs no
  conduit/electrician-grade methods → **cheap retrofit**. (Nokē Ion already ships a hardwired 12–24 VDC
  storage lock, so this is code-proven and commercially validated — plan to design *around* it, not to
  claim the bare idea.)
- **No battery to replace.** Local energy buffer at each node is a **supercapacitor or lithium-ion
  capacitor (LIC)**, not a service battery:
  - ~**1,000,000** cycle life (a lock cycles a few times a day → effectively permanent),
  - **−40 to +65 °C** tolerance (matches unconditioned metal buildings that hit 60 °C+ / −20 °C),
  - charges from any voltage, **no float/BMS drama**, high self-discharge is irrelevant when always wired.
  - Its only jobs: supply the brief **motor surge** and ride out short bus dropouts. **This single choice
    eliminates the battery-replacement labor that defines the incumbent products.**
- **Outage ride-through (optional):** if you want hours of autonomy through a facility power cut, either
  back the corridor PSU with a facility UPS (cleanest — one battery per corridor, not one per door) **or**
  add a small **LiFePO4** cell per node *with a sub-0 °C charge lockout* (charging lithium below freezing
  plates lithium and kills it). Prefer the corridor-UPS approach; it keeps chemistry out of the door.
- **Fail-safe posture:** **fail-secure** (stays locked on total power loss, buffered) **with a keyed
  mechanical override core** so a dead facility never traps a tenant's goods — this is both a UX and a
  **legal/lien-compliance** requirement (see Part 7).

### 4b. The "charge while locked" question, answered directly

You asked about a low-voltage method to charge the lock while it's locked. Three tiers, best first:

1. **Roll-up doors (most of a storage facility): don't charge anything — wire the fixed track.** The lock
   body and all electronics mount on the **stationary inside rail** (industry-standard placement). Power is
   a direct wire. **Nothing crosses the moving door, so "charge while locked" is a non-problem.** Cleanest,
   cheapest, most reliable, and sidesteps US9787127/CN107342610 entirely.
2. **Swing doors where electronics must ride the leaf: gold-plated, magnetically-aligned pogo-pin
   contacts** on the hinge jamb that mate when the door closes (SELV 5–12 V, self-wiping to stay clean,
   IP-sealed, hard-gold over nickel to resist corrosion). This is your "charge while locked/closed" idea
   done right — and contacts are a design-around lane distinct from the inductive US9787127.
3. **Only if exposed contacts are a hard blocker (coastal/outdoor swing doors): sealed inductive.** No
   contacts to corrode, but ~40–80 % efficient, alignment-fussy, and **steel doors cause eddy-current
   losses** (needs ferrite shielding). And it's the most patent-encumbered lane (US9787127). Last resort.

### 4c. Energy budget (why the wire wins by a mile)

| Load | Energy | Note |
|---|---|---|
| Motor per lock/unlock | ~50–150 mJ (optimized ~18 mJ) | Buffer supplies this surge locally |
| Idle + advertising (lean) | ~100 µW avg → **~8–9 J/day** | Sets the floor |
| 10 actuations/day | ~1.5–3 J/day | |
| **Lean node total** | **~10–15 J/day (~3–4 mWh/day)** | |
| Full node (always-on PIR + LED) | **~50–100 J/day (~15–30 mWh/day)** | Wired power makes this a non-issue |

A wired bus delivers this **trivially**; the best-case indoor solar harvest (~621 µW at 1010 lux, which a
dark storage corridor never sustains) tops out near ~54 J/day and is wildly intermittent. **This is the
quantitative proof that "wire + supercap" beats "harvest + battery" the moment you're allowed to run wire.**

### 4d. Connectivity & access — the part that kills the subscription

Because the node is **wired**, you are not forced into a battery-conserving BLE-only mesh. Options, in order
of my recommendation for an **owned** stack:

- **Data over the same low-voltage run (RS-485 daisy-chain or PoE).** Rock-solid, no RF congestion, no
  gateway battery politics. The wire you ran for power carries the data.
- **BLE at the node for tenant convenience** (phone-unlock UX parity with Nokē) layered on top — but the
  *authority* lives on **your** server, not a vendor cloud.
- **On-prem / your-cloud access server** (self-hosted). This is what deletes the subscription: NCSS **owns**
  the authorization service, the tenant app, and the data. No per-tenant fee flowing to Nokē/DaVinci.
- **Access methods:** phone app (BLE) + optional fob + optional keypad. **Deliberately avoid** the Nokē
  touch/quick-click shackle-code and the DaVinci typed-combination-on-payment patterns (Part 2).
- **Delinquency = server-side credential revocation** ("soft overlock" — the door simply won't authorize
  the tenant's credential), **not** a staff-placed physical overlock and **not** a withheld combination.
  This is operationally superior (instant, no truck roll) *and* is the feature to route past counsel vs.
  Nokē US11098500 — frame it as **access-policy/credential revocation**, structurally different from
  "multi-keyholder lockout device."

### 4e. Why this specifically beats each incumbent

- **vs. Nokē:** no battery to replace (their #1 field-labor cost), no vendor tech-fee, no BLE-mesh
  reliability tax, and you own the data. You keep their phone-unlock convenience.
- **vs. DaVinci:** no staff walking the property to place/remove physical overlocks, no SMS/email code
  delivery that fails to reach tenants, electronic instead of a guessable 4-digit combo.
- **vs. Storage Defender:** because you're wired, you can fold their tiered sensing into the **same node**
  (next section) instead of buying a second battery-sensor subscription.

---

## 5. Sensor integration (the Storage Defender add-on)

Storage Defender splits its offering into **Smart Unit** (in-unit motion + beeper), **Smart Zone**
(facility temp/humidity/water/door), and **VisualVerify** (camera aggregation) — a split **forced by
battery budgets**. Your wired node relaxes that budget, so you can consolidate. Recommended per-node sensor
stack:

**Tier 1 — build into every door node (near-zero cost, high value):**
- **Door open/close** (reed / Hall-effect): the single most valuable signal. Enables "unit opened at 2am,"
  and — critically — **lock-state vs. door-state mismatch = pry/forced-entry detection** (lock says
  "locked" but door is open → alarm).
- **Tamper / MEMS accelerometer** on the lock body: detects pry, cut, hammering, removal; wake-on-motion,
  µA-class.

**Tier 2 — add where it pays (wired power makes these easy):**
- **Temp + humidity:** real value for climate-controlled product (mold/insurance claims, HVAC
  verification). A few bytes every 5–15 min.
- **In-unit PIR motion:** Storage Defender's flagship signal. **Because you have power, you can run it
  always-on** — but note a lock-mounted PIR sees the *door*, not the unit interior; for true interior
  coverage put PIR as a short-wired satellite inside the unit off the same corridor bus.

**Tier 3 — satellites / separate tier, not on the lock:**
- **Water/flood** leak sensor: high insurance value on ground-floor/basement units, but it belongs on the
  **floor**, wired as a cheap satellite.
- **Camera / visual verification:** never on the lock node's low-power radio — keep vision on a separate
  PoE tier (mirrors why Storage Defender made VisualVerify a separate product). Your PoE backbone can
  actually host it.

**The consolidation win:** Storage Defender needs three battery product lines because of power limits.
**One wired node can be Smart Unit + Smart Zone in a single device**, with the camera tier on the same PoE
you already ran. That is a cleaner, cheaper, fully-owned version of their stack — and, because your node is
*wired and paired/provisioned*, it reads **outside** their "no external wiring / no pairing" patent
limitations.

---

## 6. The REIT / business case (why this matters beyond the hardware)

For an operator planning to go public as a REIT in 3–5 years, this is not just a lock — it's three
valuation levers:

1. **Opex → owned asset.** You convert three recurring vendor subscriptions (Nokē tech fee, DaVinci
   software, Storage Defender per-tenant) into **one capitalized, owned system**. Directly lifts NOI, and
   NOI is what a storage REIT is valued on.
2. **Ancillary revenue you keep 100 % of.** You can still charge tenants a protection/tech/access fee (the
   Storage Defender case study cites **$85k ARR at one operator**) — but the margin stays in the REIT
   instead of leaking to vendors.
3. **A defensible proptech moat + data.** Owned IP (even a few solid design-around patents — see Part 8),
   plus a proprietary access/sensor dataset across the portfolio, is a differentiator in an S-1 story and
   a barrier to the operators you'll compete with. Vertically-integrated proptech reads well to public
   markets.

**Deployment note:** a single-operator, owned deployment is also the *ideal* environment to iterate the
hardware before any thought of spinning it out — which, if you ever did, is the moment your patent posture
(Part 8) and full FTO opinion become mandatory rather than advisable.

---

## 7. Legal / compliance guardrails (don't skip)

- **Self-storage lien law.** Electronically denying a delinquent tenant access is governed by **state
  self-storage lien statutes** — overlocking/denial has statutory rules (notice periods, what you may and
  may not deny, when you can auction). A "soft overlock" is legally *more* sensitive than a physical one
  because it's instant and remote. **Loop in counsel on the delinquency workflow per state.** Fail-safe
  mechanical override also matters here — you generally cannot trap a paying tenant's property.
- **Certifications** (still required even for internal use): **UL 294** (access control hardware), **FCC
  Part 15** (any BLE/sub-GHz intentional radiator), **NEC Class 2 / Article 725** (the power bus), plus
  **fire-egress** and **ADA** considerations on any interior latch.
- **Insurance/liability.** A lock that can *fail locked* creates liability; the fail-secure + mechanical
  override + documented power-loss behavior is both an engineering and an insurance requirement.
- **Coastal/unconditioned environments:** salt-fog + IP54+ testing on any exposed contact (swing-door
  pogo-pin variant).

---

## 8. IP strategy & recommended next steps

**Your design-around lanes, summarized:**
- Not a padlock, no ball-bearing/asymmetric-cam shackle, no touch/quick-click code → clears most of Nokē's
  *hardware* claims by construction.
- No typed combination, no code-on-payment, no staff-placed physical overlock → clears the natural reading
  of DaVinci's *overlock/combination* family.
- Wired + provisioned node → reads outside Storage Defender's *no-wiring/no-pairing* sensor claims.
- Electronics on the fixed roll-up track → sidesteps the third-party *charge-while-closed* patents entirely.

**Where you still need a lawyer to read claims (🔴):**
1. **Nokē US11098500** (multi-keyholder electronic lockout) vs. your delinquency/credential-revocation
   feature — the single highest-priority claim read.
2. **DaVinci US10475115 / US11663650** — only becomes a risk if you add typed codes tied to payment events;
   confirm your no-code design stays clear.
3. **US9787127** (inductive charge-when-closed) — only if you choose the inductive swing-door option;
   avoidable by using contacts or fixed-track wiring.

**Your own patentability (worth a provisional):** the bare "hardwired storage lock" is taken (Nokē Ion), so
novelty must live in the *combination* — e.g., **supercap/LIC-buffered Class 2 corridor bus with local
motor-surge supply feeding a fixed-track roll-up lock node that also carries multi-sensor
(door/tamper/environmental) fusion and server-side credential revocation, with no onboard service
battery.** That system-level combination, and the corrosion-hardened wiping-contact swing-door variant, are
plausibly novel. A **provisional patent** is cheap insurance and strengthens the REIT IP story.

**Recommended sequence:**
1. **Formal FTO** (registered patent attorney) on the three 🔴 items — re-pull the actual claim text first.
2. **One-corridor prototype** at an NCSS site: Class 2 24 VDC bus + 3–4 fixed-track roll-up nodes +
   supercap buffer + RS-485/PoE data + your access server + door-reed/accel/temp sensors. Prove battery-free
   operation and sub-second unlock across a facility power blip.
3. **File a provisional** on the system combination before the prototype is shown to anyone outside NDA.
4. **Pilot** one full facility; measure NOI impact (vendor-fee elimination + ancillary tenant fee) to build
   the REIT-story numbers.

---

## Appendix — source index

**Nokē / Janus:** US9747739B2, US10176656B2, US10210686B2, US10713868B2, US11352817B2, US11098500B2
(US2019/0368233A1); janusintl.com/products/noke, /nokeone, /noke-ion; DEF CON 24 (Rose & Ramsey, 2016 —
Nokē resisted attack); "Earworms Make Bad Passwords," Univ. of Kent SIoT 2017 (manual-override brute force).
⚠ Exclude: US10633894 (Honda), Delphian Systems family, "Nokelock" (separate Chinese brand — the Pen Test
Partners hack is NOT Nokē).

**DaVinci:** US10475115B2, US10922747B2, US11232513B2, US11538098, US11663650/US12014294, US12131373,
US12272195; davincilock.com; DaVinci v. SpiderDoor (N.D. Ala. 2:23-cv-00343, 2025 injunction/settlement).

**Storage Defender / TeamOfDefenders LLC:** US11222522, US11288946, US11527147, US11688271; US12424081
(Cieri/Yadov "Smart lock," cites DaVinci); storage-defender.com (Smart Units / Smart Zones / VisualVerify).

**Power / charging:** US9787127B2 (inductive charge-when-closed), CN107342610A (contact charge-when-closed),
US11268300B2 (Schlage energy-harvesting), EP2378041A2; Nokē Ion (12–24 VDC hardwired); NEC Class 2 /
Art. 725; UL 294; supercap vs. LiFePO4 vs. Li-ion trade study (cycle life / temperature).

*All patent numbers are real listings; grant dates and verbatim claims must be re-verified at USPTO Patent
Center / Google Patents before reliance. This document is engineering/business analysis, not legal advice.*


<!-- ============================================================ -->
<!-- SOURCE FILE: design-around-memo.md -->
<!-- ============================================================ -->

# Design-Around Memo — Three Red-Flag Patents

**Purpose:** give you and your patent attorney a running start on freedom-to-operate for the Sentinel Node
design, focused on the three claims most likely to touch it.
**Prepared:** 2026-07-03
**Status:** ⚠️ **Preliminary, non-legal.** Every patent database (Google Patents, Justia, FreePatentsOnline,
WIPO, uspto.report) is hard-blocked from this research environment, so **I could not read verbatim claim
text.** The claim scope below is reconstructed from search-index paraphrases and prior research and is
explicitly flagged where it must be confirmed against the issued patent. Treat this as the *analysis
scaffold* an attorney fills in — not an FTO opinion.

---

## How to read this

Patent infringement of an independent claim requires that the accused product embody **every element** of
that claim (the "all-elements rule"). So a design-around only has to reliably **remove or substitute one
element** of each independent claim. For each patent below I give: the reconstructed claim scope, the
element(s) your design does not embody, and the **design rules** that keep it that way. Confidence is stated
plainly.

---

## 🔴 1. Nokē — US 11,098,500 B2 — "Lockout management systems and methods with multi-keyholder electronic locking devices"

- **Assignee:** NOKE, INC. · **Published as app:** US 2019/0368233 A1 · **Granted:** ~Aug 24, 2021 (confirm).
- **This is your highest-priority read** because it's the incumbent claim closest to your delinquency feature.

**Reconstructed claim scope (⚠️ paraphrase, confirm verbatim):** an **electronic lock comprising a lock
body and a shackle** that transitions locked↔unlocked; a lock-control system that keeps the shackle locked
in response to a **locking command from a first keyholder**; a **multi-keyholder management system** that
receives a locking command from a **second keyholder**; and an unlock-control system that releases the
shackle **only after receiving unlock commands and credentials from *both* the first and second keyholders**
(extensible to "each of a plurality of keyholders"). This is the **lockout/tagout ("LOTO") pattern** —
multiple parties each lock the device, and it can't open until each releases — not a single-tenant
delinquency lock.

**Where your design falls outside it (two independent grounds):**
1. **No shackle.** The Sentinel Node is a **wired bolt/cam latch on a roll-up track**, not a shackle
   padlock. If "shackle" is a claim element (it appears to be), you don't embody it. *Design rule: keep the
   actuator a linear bolt / lead-screw / cam — never a shackle.*
2. **Single-authority release, not multi-keyholder consent.** Your unlock is authorized by **one server
   validating one tenant credential**. The claim's operative limitation appears to be that release requires
   unlock commands **from two or more keyholders**. Your "soft overlock" is the **server revoking one
   credential** — the opposite of "needs both keyholders to open." *Design rule: never architect unlock as
   "requires commands from multiple keyholders"; keep it single-authority credential validation.*

**Confidence:** *Moderate-high* that the design reads outside, pending verbatim confirmation of (a) whether
"shackle" is in the independent claim and (b) the exact multi-keyholder release limitation. If either is
broader than the paraphrase, revisit.

**Also pull (same family / adjacent):** **US 11,104,297** "Systems and methods for multi-keyholder digital
lockout" — likely the method counterpart; confirm it's Nokē and check its independent claim the same way.

---

## 🔴 2. DaVinci — US 10,475,115 B2 — "System and method for managing distributed encrypted combination over-locks from a remote location"

- **Assignee:** 10F Pursuit LLC (DaVinci) · **Filed:** Apr 25, 2018 · **Granted:** Nov 12, 2019.
- **The foundational DaVinci patent, and litigation-tested** (SpiderDoor injunction/settlement, 2025) — so
  it is enforced and should be respected precisely.

**Reconstructed claim scope (⚠️ paraphrase, confirm verbatim):** a distributed management system for
self-storage in which a remote server stores, per lock, a **lock identifier and an encrypted unlock code
(combination)**; the system provides a customer **immediate access to an *over-locked* space upon payment
of a past-due balance** by **decrypting/revealing the combination** to the customer. The invention centers
on **(a) a combination code, (b) that is encrypted/stored server-side, (c) for an over-lock, (d) released
on payment.**

**Where your design falls outside it:**
1. **No combination / unlock code.** Your tenant unlocks with a **cryptographic credential over BLE/wire**,
   not by receiving a human-typed **combination**. If "unlock code / combination" is a claim element, you
   don't embody it. *Design rule: issue signed access tokens to the device — never a human-typed code the
   tenant reads and enters.*
2. **No "over-lock."** You don't place a second physical lock and then release it; you **revoke a
   credential** on the tenant's existing electronic lock. The claim's "over-lock" framing appears central.
3. **Release not tied to payment as the operative trigger.** *Design rule: keep credential
   validity a function of account status generally, and don't build a mechanism whose claimed novelty is
   "reveal the code upon payment."*

**Confidence:** *High* that a no-combination, no-physical-overlock electronic credential design reads
outside this combination-centric family — but confirm the independent claim isn't drafted broadly enough to
capture "any code that grants access after a delinquency event."

---

## 🔴 3. DaVinci — US 11,663,650 (and continuation US 12,014,294) — "System and method for transmitting unlock codes based on event triggers"

- **Assignee:** DaVinci Lock LLC · **Granted:** ~2023 (confirm) / continuation ~Jun 2024.

**Reconstructed claim scope (⚠️ paraphrase, confirm verbatim):** a system that **transmits/reveals an
unlock code to a user's device upon a *trigger event*** (e.g., delinquency cured, new rental completed,
gate/access event). The gravamen is **event-triggered delivery of an unlock code.**

**Where your design falls outside it — but this is your easiest place to wander back in:**
1. **You transmit a signed *credential/token*, not an "unlock code," and you avoid coupling issuance to a
   discrete payment/rental *trigger event* as the claimed step.** *Design rule (critical): if you ever add a
   **PIN-keypad fallback**, do **not** architect "issue the PIN when the tenant pays / rents." Decouple any
   code issuance from payment/rental events — issue credentials on enrollment and control access by
   validity, not by event-triggered code delivery.*

**Confidence:** *Moderate-high* for a pure token design; **the risk is entirely in a future keypad/PIN
feature.** Flag any PIN feature to counsel before building.

---

## Adjacent patents worth a look (lower priority)

- **US 12,424,081** (Cieri/Yadov — StorageDefender-affiliated) "Smart lock," **SHA-3 time-sensitive access
  code.** Relevant only if you implement **time-based one-time codes (TOTP-style)**. *Design rule: if you do
  OTP, confirm you're not reading on a "SHA-3 time-sensitive code" claim; prefer signed tokens over
  hash-based OTP, or clear it first.*
- **US 9,787,127 B2** "Door lock with a wireless charging device" (third party). Relevant **only** if the
  swing-door variant goes **inductive**. *Design rule: use fixed-track wiring (roll-ups) or wiping pogo-pin
  contacts (swing) — both avoid the inductive-when-closed claim.*

---

## Your standing design rules (fold these into the spec so you stay clear by construction)

| # | Rule | Keeps you clear of |
|---|---|---|
| R1 | Actuator is a **bolt/cam/lead-screw**, never a shackle | Nokē 11,098,500; 10,210,686 |
| R2 | Unlock = **single-authority server credential validation**, never "multiple keyholders must both release" | Nokē 11,098,500 |
| R3 | Tenant presents a **signed token** (BLE/wire), never a **human-typed combination/code** | DaVinci 10,475,115; 11,663,650 |
| R4 | Delinquency = **credential revocation**, never a **physical over-lock** placed then released | DaVinci 10,475,115 / 10,922,747 |
| R5 | **Never tie code/PIN issuance to a payment or rental *event*** (if a keypad is ever added) | DaVinci 11,663,650 / 12,014,294 |
| R6 | No **shackle-press / capacitive touch "quick-click"** unlock input | Nokē 9,747,739 / 10,176,656 / 10,713,868 |
| R7 | Node is **wired + provisioned/paired** (not a drop-in wireless sensor) | StorageDefender 11,222,522 family |
| R8 | Swing-door power = **fixed-track wire or wiping contacts**, not inductive | US 9,787,127 |
| R9 | If OTP is used, prefer **signed tokens** over **SHA-3 time-sensitive codes** | US 12,424,081 |

If the design honors R1–R9, it removes at least one element from each red-flag independent claim as we
currently understand them. Counsel confirms against verbatim text.

---

## Attorney retrieval & confirmation packet (hand this over)

Because I can't reach the databases, here's exactly what to pull and the questions to answer. Any of these
opens in a normal browser or via the attorney's Patent Center / commercial search seat.

**Pull the issued patents (verbatim claims + file history):**
1. US 11,098,500 B2 — and family member US 11,104,297; parent app US 2019/0368233 A1
2. US 10,475,115 B2 — and continuations US 10,922,747 B2, US 11,232,513 B2
3. US 11,663,650 (B1/B2) — and continuation US 12,014,294
4. (Adjacent) US 12,424,081; US 9,787,127 B2

**Confirm these specific questions per patent:**
- **11,098,500:** Is **"shackle"** recited in the independent claim(s)? Is release limited to **"unlock
  commands and credentials from each of the first and second keyholders"** (multi-party), or could a single
  server-authorized release infringe? → If shackle + multi-keyholder are both required, R1/R2 clear it.
- **10,475,115:** Does the independent claim require an **"unlock code"/"combination"** and an **"over-lock"**?
  Could a claim be read to cover *any* electronic access grant after delinquency, absent a combination? →
  Confirms whether R3/R4 are sufficient.
- **11,663,650 / 12,014,294:** Is the claimed step **"transmitting an unlock code" upon a "trigger event"**?
  Does a signed-token model with no discrete payment-trigger avoid it? → Confirms R5 and any keypad plan.
- **File-history / prosecution estoppel:** any narrowing amendments or examiner statements that limit these
  claims (helps your non-infringement and any invalidity position).

**Also ask counsel to:**
- Run a full **FTO/clearance search** (not just these four) on: electronic self-storage locks, powered
  door-access nodes, low-voltage corridor access-control buses, and lock-integrated door/tamper sensing.
- Advise on filing your **provisional** (see the prototype spec §8) *before* the strategy brief/deck is shown
  outside NDA — several of your pitch activities are potential public-disclosure events.

---

*Preliminary engineering/IP analysis. Not a legal opinion, not an FTO clearance. Verify all claim scope
against issued patents with a registered patent attorney before relying on any conclusion here.*


<!-- ============================================================ -->
<!-- SOURCE FILE: provisional-patent-skeleton.md -->
<!-- ============================================================ -->

# Provisional Patent Application — Working Skeleton

> **⚠️ Not legal advice, not a filed application.** This is a drafting scaffold for a registered patent
> attorney/agent to finalize and file. A provisional does not require formal claims, but draft claims are
> included because they sharpen the eventual non-provisional and force the disclosure to support them.
> **Do not file as-is.** Before any public disclosure (deck, partner meeting outside NDA), have counsel
> file. Inventors, assignee, and formal figures to be completed with counsel.

**Suggested title:** *Battery-Free, Facility-Powered Access, Sensing, and Wayfinding Node Network for
Self-Storage Facilities*

**Inventor(s):** [ M. Wess; + any co-inventors ] · **Assignee:** [ entity TBD ] · **Filing basis:** 35 U.S.C. §111(b)

---

## 1. Field

The disclosure relates to access control for rental storage facilities, and more particularly to a network
of facility-powered nodes that actuate unit locks, sense unit and corridor conditions, and provide tenant
wayfinding and staff presence signaling over a shared low-voltage bus, without a user-replaceable service
battery at each unit.

## 2. Background

Self-storage access products today take one of two forms, each with a structural limitation:

1. **Battery-powered electronic locks** (e.g., Bluetooth padlocks and on-door latches) store operating
   energy in a coin cell or proprietary battery at each unit. The battery must be periodically replaced —
   labor that scales with unit count — and its capacity degrades in the wide, unconditioned temperature
   range of storage buildings. These products are designed to be sold into any facility with **no assumed
   infrastructure**, which forces the onboard-battery constraint.

2. **Mechanical combination locks with remote code management** avoid batteries but require staff to
   physically place and remove locks and depend on delivering human-enterable **combination codes** to
   tenants, which introduces labor and code-delivery failure modes.

Separately, **battery-powered wireless sensors** monitor units for motion and environmental conditions, and
require their own installation and battery maintenance and, typically, a per-unit subscription.

A single facility operator, by contrast, **can install permanent low-voltage wiring**. That freedom removes
the reason for onboard batteries and per-unit vendor subscriptions, yet no known system exploits it to unify
lock actuation, condition sensing, and tenant wayfinding in one battery-free, operator-owned node. Prior
hardwired storage locks still rely on onboard energy stores for motor actuation and do not disclose a shared
low-voltage bus whose per-unit current remains at the average node load during actuation by virtue of a
local capacitive buffer, nor the integration of wayfinding and presence signaling into the same node.

There is a need for a facility-powered access node that (a) eliminates the per-unit service battery,
(b) permits many nodes to share one low-current low-voltage bus, (c) fuses lock and door state to detect
forced entry, (d) imposes delinquency restrictions by credential revocation rather than a physical over-lock
or a transmitted combination, and (e) reuses the same powered node to guide tenants to their unit and signal
staff of aisle presence.

## 3. Summary

Disclosed is an access, sensing, and wayfinding system for a storage facility comprising a **low-voltage DC
power bus** (in embodiments compliant with NEC Class 2) distributed along a corridor and a plurality of
**lock nodes** coupled to the bus. Each lock node includes an **electrically actuated, non-shackle latch**
(e.g., a bolt, cam, or lead-screw), a **local capacitive energy buffer** (supercapacitor or lithium-ion
capacitor), a controller, and one or more sensors. The capacitive buffer sources the **peak actuation
current** for the latch motor so that the current drawn from the shared bus remains substantially at the
**average node load** during actuation, allowing many nodes to share a single low-current pair. Each node is
**devoid of a user-replaceable electrochemical service battery** as its primary operating energy store.

In embodiments, a node mounts to the **stationary track of a roll-up door** so that no power crossing to the
moving curtain is required; for swing doors, power crosses to the leaf via **wiping contacts** that mate when
the door closes. A **server** issues signed access credentials to tenant devices and imposes a delinquency
restriction (a "soft over-lock") by **revoking a credential**, without placing a physical over-lock and
without transmitting a human-enterable combination. A node fuses **door-position** and **latch** state to
generate a **forced-entry signal** when a door opens while the latch is engaged. In further embodiments each
node carries an **addressable indicator**, and the server directs a subset of indicators and corridor panels
to present a **wayfinding indication** routing a tenant to an assigned unit and to present a **presence
indication** to staff identifying a corridor or aisle in which a person is detected.

The combination yields a battery-free, operator-owned node network in which lock actuation, condition
sensing, forced-entry detection, delinquency control, tenant wayfinding, and staff presence signaling are
provided over one shared low-voltage infrastructure.

## 4. Brief description of the drawings (to be produced with counsel)

- **FIG. 1** — Facility/corridor view: Class 2 PSU (UPS-backed) → low-voltage DC bus → plurality of lock nodes.
- **FIG. 2** — Lock node block diagram: bus input, buck converter, capacitive buffer, controller, motor
  driver + non-shackle latch, sensors (door reed/Hall, accelerometer, temp/humidity), data transceiver,
  radio, addressable indicator, keyed mechanical override.
- **FIG. 3** — Current-vs-time plot: bus current remaining ~flat at average load while buffer sources the
  motor actuation surge.
- **FIG. 4** — Roll-up door: node on stationary track, no crossing to moving curtain.
- **FIG. 5** — Swing door: wiping/pogo-pin contacts on jamb mating pad on leaf when closed.
- **FIG. 6** — Forced-entry logic: door-open AND latch-engaged → alarm.
- **FIG. 7** — Server credential issue/revoke (soft over-lock) sequence.
- **FIG. 8** — Wayfinding: server lighting node indicators + corridor panels to route a tenant; aisle
  presence flag to staff.
- **FIG. 9** — Method flowchart.

## 5. Detailed description (outline to expand with counsel)

**5.1 Power distribution.** Corridor PSU, listed Class 2, UPS-backed; 24 VDC embodiment; home-run and
daisy-chain topologies; conductor gauge and voltage-drop sizing to the *average* node load; touch-safe SELV
rationale; per-corridor segmentation.

**5.2 Lock node energy path.** Low-quiescent buck; capacitive buffer (supercap/LIC) sizing to source the
motor surge (e.g., ~50–150 mJ per actuation) and to ride bus dropouts of a stated duration; explicit
statement that the node lacks a user-replaceable electrochemical service battery as its primary operating
store; optional non-serviced LiFePO4 with sub-0 °C charge lockout solely for outage ride-through; suitability
of the buffer over the facility's temperature range.

**5.3 Buffer-decoupled bus loading.** The mechanism by which each node's buffer sources peak actuation
current so bus current stays substantially at average node load; consequent ability to place N nodes on one
low-current pair; staggering not required.

**5.4 Latch and form factors.** Non-shackle latch embodiments (bolt, cam, lead-screw); fixed-track roll-up
mounting with no curtain crossing; swing-door wiping-contact embodiment (magnetically aligned, hard-gold,
self-wiping, SELV, sealed); keyed mechanical override for fail-safe egress; fail-secure on power loss.

**5.5 Data and access.** Wired data (RS-485/PoE) and/or radio (BLE/802.15.4 mesh); server-issued signed,
short-TTL credentials; tenant device unlock; absence of human-enterable combination; delinquency by
credential revocation ("soft over-lock") decoupled from any payment-triggered code transmission.

**5.6 Sensing and forced-entry fusion.** Door-position sensor (reed/Hall), accelerometer tamper, temp/
humidity; the forced-entry signal generated when door-open coincides with latch-engaged; satellite sensors
(PIR, water) on the same bus.

**5.7 Wayfinding and presence.** Addressable indicator per node; corridor/aisle panels; server maps unit →
aisle → node and directs indications routing an identified tenant in an assigned color/arrow to the assigned
unit ("this is your unit"); presence indication derived from node sensor events identifying a corridor/aisle
occupied by a person; exception states (after-hours, approach to a flagged unit) escalated on the same
indicators; aisle-level (non-identifying) presentation to floor staff.

**5.8 Forward compatibility.** Reserved indicator channel and panel addressing to permit wayfinding as an
add-on to an already-installed access/sensing node.

---

## 6. Draft claims (for the non-provisional; illustrative)

Drafted to capture the novel *combination* while removing, by construction, at least one element of each
red-flag prior-art claim (no shackle; no combination; no physical over-lock; credential revocation).

**1.** An access system for a storage facility, comprising:
 a low-voltage direct-current power bus distributed along a corridor of the facility; and
 a plurality of lock nodes coupled to the power bus, each lock node comprising:
  an electrically actuated latch movable between an engaged state and a released state, the latch
  **excluding a shackle**;
  a motor arranged to move the latch and drawing a peak current during actuation;
  a **capacitive energy buffer** electrically coupled to source said peak current such that current drawn by
  the lock node from the power bus during actuation **remains substantially at an average operating current
  of the lock node**;
  a controller configured to actuate the latch in response to a validated access credential; and
 wherein each lock node is **devoid of a user-replaceable electrochemical battery as a primary operating
 energy store**, the lock node being powered from the power bus.

**2.** The system of claim 1, wherein the power bus is a Class 2 circuit and each lock node includes a buck
converter having a quiescent current small relative to the average operating current.

**3.** The system of claim 1, wherein the capacitive energy buffer comprises a supercapacitor or a
lithium-ion capacitor sized to source the peak current and to maintain operation through a bus interruption
of at least a predetermined duration.

**4.** The system of claim 1, wherein at least one lock node is mounted to a **stationary track of a roll-up
door** such that the lock node receives power without any electrical crossing to a movable curtain of the
door.

**5.** The system of claim 1, wherein at least one lock node is mounted to a swing door and receives power
through **wiping electrical contacts** that mate when the door closes, the contacts operating at a
safety-extra-low voltage.

**6.** The system of claim 1, further comprising a server configured to issue said access credential to a
tenant device and to impose an access restriction on a unit by **revoking the credential**, without placing a
physical over-lock on the unit and **without transmitting a human-enterable combination**.

**7.** The system of claim 1, wherein each lock node further comprises a door-position sensor and is
configured to generate a **forced-entry signal when the door-position sensor indicates an open door while the
latch is in the engaged state**.

**8.** The system of claim 1, wherein each lock node further comprises at least one of an accelerometer
configured for wake-on-motion tamper detection and a temperature/humidity sensor.

**9.** The system of claim 1, wherein each lock node further comprises an **addressable indicator**, and
further comprising a server configured to cause a subset of the indicators to present a **wayfinding
indication routing an identified tenant to an assigned unit**.

**10.** The system of claim 9, further comprising corridor panels coupled to the power bus and configured,
under direction of the server, to present directional guidance to the assigned unit.

**11.** The system of claim 9, wherein the server is further configured to cause presentation of a
**presence indication identifying a corridor or aisle in which a person is detected** based on sensor events
from one or more lock nodes, the presence indication being aisle-level and non-identifying to floor staff.

**12.** The system of claim 1, wherein each lock node comprises a **keyed mechanical override** and is
**fail-secure** upon loss of bus power.

**13. (Method).** A method of operating a storage facility, comprising:
 distributing low-voltage direct current along a corridor over a shared bus to a plurality of lock nodes;
 at each lock node, **buffering a motor actuation surge with a local capacitive store so that current drawn
 from the shared bus remains substantially at an average node current**;
 validating a server-issued credential presented by a tenant device and actuating a non-shackle latch in
 response;
 imposing a delinquency restriction by **revoking a credential at a server** without placing a physical
 over-lock and without transmitting a human-enterable combination;
 generating a forced-entry signal when a door opens while its latch is engaged; and
 directing addressable indicators to route an identified tenant to an assigned unit and to signal staff of a
 corridor or aisle in which a person is detected;
 the lock nodes operating **without a user-replaceable service battery**.

**14.** The method of claim 13, wherein the lock node is mounted to a stationary track of a roll-up door and
receives power without crossing to a movable curtain.

**15.** The method of claim 13, further comprising maintaining lock-node operation through a bus interruption
using the local capacitive store.

*(Dependent claims to be expanded: buffer sizing ranges; specific sensor sets; radio vs. wired data; OTP via
signed token rather than hash-based code; UPS ride-through; corrosion-hardened contacts; color-blind-safe and
ADA-compliant indications; escalation on approach to a flagged unit.)*

## 7. Abstract

A facility-powered node network for storage units. A low-voltage bus along a corridor powers lock nodes each
having a non-shackle latch, a local capacitive buffer that sources the latch motor's actuation surge so the
shared bus carries only average current, and sensors — with no user-replaceable service battery per unit.
Roll-up nodes mount to the fixed track (no crossing to the moving curtain); swing nodes use wiping contacts.
A server unlocks via signed credentials and enforces delinquency by revoking a credential (a soft over-lock)
rather than a physical over-lock or a transmitted combination. Nodes fuse door and latch state to flag forced
entry, and addressable node/corridor indicators route a tenant to an assigned unit and signal staff of aisle
presence.

---

## 8. Novelty & prior-art positioning (attorney notes, not part of the filing)

- Closest prior art: **hardwired storage locks** (e.g., Nokē Ion) — so claim novelty rests on the
  **combination**, principally: (i) the **capacitive-buffer-decoupled bus** where per-node current stays at
  average during actuation, enabling many nodes per low-current pair; (ii) **absence of a service battery**
  as primary store; (iii) **fixed-track roll-up mounting with no curtain crossing**; (iv) **credential-
  revocation soft over-lock** with no combination; (v) **integrated wayfinding + aisle presence** on the
  same powered node. Emphasize (i) and (v) as the least-anticipated features.
- Design-around alignment: claims deliberately recite **"excluding a shackle"** (clear of Nokē
  11,098,500/10,210,686), **"without a human-enterable combination"** and **"without a physical over-lock"**
  (clear of DaVinci 10,475,115 / 11,663,650), and **"without a user-replaceable service battery"** (distinct
  from battery locks). Keep these negative limitations tied to the technical rationale in the spec.
- Consider a **separate or continuation** filing for the wayfinding/presence subsystem if counsel prefers to
  keep the access claims clean; otherwise the unified filing broadens coverage and strengthens the IP story.

*Preliminary drafting scaffold. Have a registered patent practitioner conduct a prior-art search, finalize
claims and figures, and file before any non-NDA public disclosure.*


<!-- ============================================================ -->
<!-- SOURCE FILE: sentinel-prototype-spec.md -->
<!-- ============================================================ -->

# Sentinel Node — One-Corridor Prototype Specification (Rev A)

**Goal of this build:** prove, at one NCSS corridor, that a facility-wired lock runs **battery-free**,
unlocks in **< 1 s**, survives a **facility power blip**, and reports **door / tamper / environmental**
telemetry — on **NEC Class 2** wiring an installer (not an electrician) can pull. This is the artifact you
put in front of NCSS and, later, a patent attorney and a contract manufacturer.

> Engineering working spec, not a released design. Component part numbers are representative starting
> points to price against, not a final BOM. Verify every claim (voltage drop, UL/FCC, lien-law behavior)
> before a facility-wide rollout.

---

## 1. Scope of the prototype

| Item | Prototype target |
|---|---|
| Doors | 6 roll-up units on one corridor (fixed-track lock placement) + 1 swing-door bench unit (pogo-pin variant) |
| Backbone | One Class 2 24 VDC bus, single home-run to a corridor enclosure |
| Data | RS-485 daisy-chain (primary) + BLE at each node (tenant-unlock demo) |
| Access authority | Self-hosted server (laptop/NUC or your cloud) — **no vendor SaaS** |
| Sensors | Door reed, MEMS accelerometer (tamper), temp/humidity on every node; 1 in-unit PIR satellite; 1 floor water sensor |
| Success gate | Battery-free operation ≥ 30 days; unlock < 1 s; ride through a 10 s bus cut; forced-entry (lock-vs-door mismatch) alarm fires; zero battery swaps |

---

## 2. System block diagram

```
                 ┌─────────────────────────── Corridor enclosure ───────────────────────────┐
  Facility AC ──▶│  UPS ──▶ Listed Class-2 PSU (24 VDC, ≤100 VA)  ──▶  [+24V / GND]  [RS-485 A/B] │
                 └───────────────────────────────┬───────────────────────┬──────────────────────┘
                                24 VDC + RS-485 (one 4-conductor run, 18 AWG)
        ┌───────────────┬───────────────┬───────────────┬───────────────┬───────────────┐
     ┌──▼──┐         ┌──▼──┐         ┌──▼──┐         ┌──▼──┐         ┌──▼──┐         ┌──▼──┐
     │Node1│         │Node2│         │Node3│         │Node4│         │Node5│         │Node6│
     └─────┘         └─────┘         └─────┘         └─────┘         └─────┘         └─────┘
   each node:  24V─▶ buck 3.3V ─▶ MCU ─┬─ motor driver ─▶ latch actuator
                         │             ├─ reed (door) · accel (tamper) · temp/humidity
               supercap  │             ├─ RS-485 xcvr (data)  · BLE SoC (tenant unlock)
               buffer  ──┘             └─ status LED · mechanical override core (keyed)
```

- **Fixed-track placement (roll-up):** the entire node mounts on the stationary inside rail. The moving
  door carries **nothing** — no contacts, no coil, no wire crossing. This is why "charge while locked" is a
  non-problem here and why the third-party charge-when-closed patents don't apply.
- **Swing-door bench unit:** identical node, but power crosses to the leaf via a **magnetically-aligned
  pogo-pin block** (see §6).

---

## 3. Power budget & the "one thin pair feeds many doors" claim

**Per-node average draw** (design targets):

| State | Current @ 3.3 V | Notes |
|---|---|---|
| Deep idle (RTC + accel wake-on-motion) | 15–40 µA | sets the daily floor |
| RS-485 receiver listening | +1–5 mA (duty-cycled) | poll, don't hold bus active |
| BLE advertising | ~0.3 ms bursts | negligible average |
| Motor actuation | 0.2–0.5 A for 50–80 ms | **buffer supplies this, not the bus** |

**Daily energy:** lean node **~10–15 J/day**; full node with always-on PIR + LED **~50–100 J/day**
(≈ 3–30 mWh/day). Six nodes ≈ **60–600 J/day** average — i.e. **single-digit mA average** on the 24 V bus.

**Why the surge doesn't size the wire:** the supercap sources the motor pulse locally. The bus only ever
sees the *average* load, so a 6-node corridor draws milliamps on the trunk. This is the crux of the design
and the thing to demonstrate on a scope: **bus current stays flat while a lock fires.**

### Voltage-drop check (do this per real corridor length)

Round-trip drop `Vdrop = I × R_total`, `R_total = 2 × L × R_per_ft`.

- 18 AWG ≈ **6.4 mΩ/ft**. For a 150 ft home-run at a **worst-case simultaneous** 6 × 0.4 A = 2.4 A inrush
  (won't really happen — buffers stagger — but bound it):
  `R = 2 × 150 × 0.0064 = 1.92 Ω` → `Vdrop = 2.4 A × 1.92 Ω = 4.6 V` (19% at 24 V) — too much *only* if all
  six fired through the bus at once, which the buffers prevent.
- At the **realistic** average of ~50 mA on the trunk: `Vdrop = 0.05 × 1.92 = 0.096 V` (0.4%). Comfortable.
- **Rule for rollout:** size for the *average* + a modest margin because buffers absorb inrush; keep
  ≤ 10 % drop at the average load; if a corridor is long, step to 16/14 AWG or split into two home-runs.
  24 VDC (vs 12) buys you distance headroom — keep it at 24.

---

## 4. Bill of materials (representative, per node unless noted)

| Block | Representative part | Qty | Notes / target |
|---|---|---|---|
| MCU + BLE | Nordic **nRF52840** SoC module | 1 | BLE + enough GPIO/ADC; well-supported, FCC-modular options exist |
| Buck 24→3.3 V | TI **TPS62840** (60 nA Iq) or LMR33630 | 1 | ultra-low quiescent so idle conversion loss ≪ load |
| Energy buffer | 2–3 × supercap (e.g. **10–50 F, 3.0 V**) or a small **LIC** | 1 set | sized for motor surge + ~10 s ride-through; −40…+65 °C |
| Motor + driver | 6–9 V geared actuator + **DRV8837** H-bridge | 1 | fail-secure latch; drive from buffered rail |
| Latch mechanism | Custom bolt/cam (NOT Nokē ball-bearing/asymmetric-cam) | 1 | design-around: linear bolt or lead-screw, no shackle |
| Mechanical override | Keyed core (facility master, differs per state lien needs) | 1 | fail-safe egress requirement |
| Door sensor | Reed or **Hall (e.g. DRV5032, 1.3 µA)** + magnet on door | 1 | the highest-value signal |
| Tamper | MEMS accel **LIS2DH12** (wake-on-motion, ~2 µA) | 1 | pry/cut/removal detection |
| Environment | **SHT4x** temp/humidity (~0.4 µA @ 1 read/min) | 1 | climate-controlled value |
| Data | RS-485 transceiver **THVD1500** (half-duplex) | 1 | robust wired telemetry along the trunk |
| Enclosure | IP54+ ABS/PC; salt-fog spec for coastal | 1 | UL 294 hardware context |
| Corridor (shared) | **UPS** + listed **Class 2 24 VDC PSU** (≤100 VA) | 1 | one per corridor; UPS = clean ride-through |
| Swing variant only | Magnetic **pogo-pin** block, hard-gold, 2–4 pin | 1 | SELV 5–12 V handoff to the leaf |
| In-unit satellite | PIR module on a stub of the same bus | 1/unit | interior motion (Storage Defender's flagship signal) |
| Floor satellite | Water/leak probe | as needed | ground-floor/basement only |

---

## 5. Firmware / server behavior (prototype)

- **Unlock path:** tenant app → BLE to node **or** server command over RS-485 → node verifies a
  server-signed, short-TTL token → fires latch. Authority is the **server**, not the node and not a vendor.
- **Delinquency = credential revocation** at the server ("soft overlock"): the tenant's token simply stops
  validating. **No** withheld combination, **no** staff-placed physical lock, **no** code-on-payment event
  — these are the DaVinci/Nokē patterns to stay clear of.
- **Forced-entry alarm:** if `door_state == OPEN` while `lock_state == LOCKED` → immediate alert (this is the
  single most valuable derived signal and near-free once you have the reed + latch state).
- **Telemetry:** door events (per transition), tamper (on wake), temp/humidity (every 5–15 min). Bytes, not
  kilobytes — trivial on RS-485.
- **Power-loss behavior:** fail-secure (stays locked, buffered); on total loss, keyed mechanical override
  opens. Log and surface the ride-through on the demo.

---

## 6. Swing-door charge-while-closed handoff (bench unit)

For the one leaf-mounted node, prove the contact scheme:
- 2–4 **spring-loaded pogo pins** on the hinge-side jamb, **magnet-aligned** to a mating gold pad on the leaf.
- **SELV 5–12 V** across the gap (limits electrolytic corrosion), **self-wiping** on close, **hard-gold over
  nickel** pads, conformal-sealed. Salt-fog test if the site is coastal.
- Buffer on the leaf side rides the brief open interval so the node never browns out while the door is up.
- **Do not** default to inductive — lossy, alignment-fussy, steel eddy losses, and the most patent-encumbered
  lane (US 9,787,127). Contacts are both cheaper and a cleaner design-around.

---

## 7. Test plan (the demo that sells it)

1. **30-day battery-free run** — nodes powered only from the bus; zero cells; log uptime.
2. **Unlock latency** — < 1 s app-tap-to-open across all 6 nodes; scope the motor pulse.
3. **Flat-bus proof** — fire a lock while metering trunk current; show the supercap sources the surge and
   the bus stays flat (this is the "one pair feeds many doors" money shot).
4. **Ride-through** — cut facility AC for 10 s (UPS + buffers): locks hold state, node stays online, no reboot.
5. **Forced-entry** — lift a door while its lock reads LOCKED; alarm fires < 2 s.
6. **Thermal** — soak a node at 60 °C and at −10 °C; confirm supercap buffer + latch still actuate (the case
   batteries fail; supercaps don't).
7. **Swing handoff** — cycle the bench door 500× on the pogo-pin block; verify contact resistance stable
   (wiping action working).

---

## 8. What to hand the patent attorney (before spend)

Pull actual claim text and get a written read on:
1. **Nokē US 11,098,500** — multi-keyholder lockout vs. your server-side credential revocation (top priority).
2. **DaVinci US 10,475,115 / US 11,663,650** — confirm your no-typed-code, no-physical-overlock design stays
   clear; specifically confirm you are NOT tying any code issuance to a payment event.
3. **US 9,787,127** — only if the swing-door variant ever goes inductive (recommend it doesn't).

And file a **provisional** on the *system combination*: supercap/LIC-buffered NEC Class 2 corridor bus with
local motor-surge supply feeding a **fixed-track roll-up lock node** that fuses door/tamper/environmental
sensing with **server-side credential revocation** and **no onboard service battery** — plus the
corrosion-hardened wiping-contact swing-door variant. The bare "hardwired storage lock" is taken (Nokē Ion);
the defensible novelty is this specific combination.

---

*Rev A · 2026-07-03 · Engineering working spec — verify all figures before rollout. Not legal advice.*


<!-- ============================================================ -->
<!-- SOURCE FILE: wayfinding-phase2-scope.md -->
<!-- ============================================================ -->

# Phase 2 Feature Scope — "Guide Path": Wayfinding + Presence Signaling

**One-line:** turn the powered lock network into a navigation and awareness layer — LED guidance that walks
a tenant to their unit ("this is your unit"), and staff-facing presence flags that say "a tenant is in
Aisle 4" (the doctor's-office / patient-room flag, done in light and data).

**Why it belongs in this system:** you are *already* running a Class 2 powered bus, an addressable data
network, an MCU, and motion/door sensors to every door for the lock. Guidance lighting and presence
signaling are a **firmware + fixture overlay on infrastructure that already exists** — the marginal cost per
door is a few dollars of LED, not a new network. No competitor can match the incremental economics because
none of them have the powered, addressable node at every unit that you will.

**Phasing:** Phase 1 (prototype/spec) proves lock + power + sensing. **Guide Path is Phase 2** — but there's
one cheap Phase-1 decision that unlocks it (see §6): reserve an addressable-LED channel and panel address
space on the Rev A node now, so Phase 2 is a fixture-and-firmware add, not a board respin.

---

## 1. The three jobs Guide Path does

| Job | Who it serves | The signal |
|---|---|---|
| **Navigate me to my unit** | Tenant | End-cap panels route them aisle-by-aisle in *their* color; their unit door glows **green — "this is your unit."** |
| **"Someone's in this aisle"** | Store manager / staff | Aisle-level presence flag (physical LED bar + dashboard tile). The Dr.'s-office flag: glance and know where people are. |
| **"Something's off here"** | Staff / security | Same lights carry exceptions: after-hours presence, approach to a delinquent/flagged unit, environmental alert. |

---

## 2. Components (all on the existing bus)

1. **Per-unit RGB indicator** — an addressable RGB LED (e.g., SK6812/WS2812-class) at each door node. It
   already has power, an MCU, and network addressing. Behaviors:
   - **Steady green, gentle pulse** = *your unit* (lit only for the tenant currently navigating).
   - **Directional chase** toward the unit as they get close.
   - **Amber** = attention (climate/insurance alert on that unit). **Blue** = staff/maintenance assigned.
     **Red** = restricted / delinquent / do-not-enter. **Off/dim** = default resting state.
2. **Aisle end-cap comm panels** — small LED arrow/number panels (or compact matrix) at aisle mouths and
   decision points. On tenant check-in (app or gate), panels light a **personal color + directional arrow**
   guiding them turn-by-turn to their aisle — airport-gate-style. Optional small e-ink/LCD for unit-range
   labels and ADA text/audio.
3. **Aisle presence flag** — a bright LED bar at each aisle entrance (and mirrored on the manager
   dashboard) that lights when the node network detects a person in that aisle. Optional **motorized
   physical flag** at the aisle mouth or office for the literal doctor's-office analog.
4. **Orchestration** — your access **server** already knows the unit-location map and who's on site; it
   computes the route and addresses the specific nodes/panels to light in the tenant's color, using the
   RS-485/mesh you already run. Presence is derived from the **PIR / door / tamper events already in the
   node network** — no new sensors required for the core feature.

---

## 3. How presence is sensed (reusing what's already there)

- **Door + PIR + accelerometer events** already stream to the server. A tenant walking an aisle trips
  in-unit PIRs / passes door nodes → server infers **aisle-level occupancy** and raises the flag.
- For tighter aisle coverage, add cheap **aisle-mouth PIR or break-beam** satellites on the same bus (like
  the water/PIR satellites in the lock spec) — optional, only where door/PIR coverage is sparse.
- **Escalation logic** (all server-side, reuses the sensor tier): normal presence = info; **after-hours**
  presence = alert; presence **at/approaching a delinquent or flagged unit** = security escalation with the
  unit's RGB going red and a dashboard priority ping.

---

## 4. Design constraints — get these right or it backfires

- **ADA / accessibility (mandatory):** never encode meaning in **color alone**. Pair every color with an
  **arrow, unit number, and/or text**, and consider **audio** cues at panels. Use a **color-blind-safe**
  set (green / blue / amber are distinguishable; avoid red-vs-green as the *sole* discriminator). This is
  both a legal (ADA) and a usability requirement.
- **Privacy & tenant comfort:** presence signaling to staff must be **aisle-level, not identity-tracking on
  the floor.** Keep tenant identity in the **secured dashboard**, not on public-facing flags. Disclose
  monitoring in the tenant agreement. Some tenants specifically value storage for its discretion — signal
  *"someone is here,"* not *"John Smith is at unit 412."* Get counsel to align this with state privacy law
  and your lease.
- **Light discipline:** only the navigating tenant's unit lights; **time-out after arrival**; low ambient
  default brightness. Avoid a corridor of glowing doors (confusing, and it defeats "this is *your* unit").
- **Power on the bus:** RGB LEDs draw more than the lock's idle µA, but you're wired — fine. Still, **PWM-dim
  and drive event-only**, keep any persistent status glow at low brightness, so the corridor bus average
  stays modest. Budget an addressable LED at moderate brightness in the low tens of mA, lit for seconds
  during guidance — negligible; a full-brightness always-on corridor is what to avoid.
- **Fail quiet:** if guidance data is lost, lights go to safe default (off/dim); never strand a tenant with
  a wrong-direction arrow. Guidance failure must not affect **lock** function (keep the lock's safety path
  independent of the LED subsystem).

---

## 5. IP note (do a targeted scan before building Phase 2)

The building blocks are borrowed from mature, **patented** fields — so clear them, don't assume:
- **Parking guidance systems** (per-space red/green "available/occupied" lights + central guidance —
  Park Assist, INDECT, TKH/Sensata, etc.) are heavily patented. Your use is *inverted* (guide to an
  assigned space, not advertise a free one) and in a *different industry*, but the "indicator light per
  bay + server-directed guidance" concept has prior art. **Scan parking-guidance indicator patents.**
- **Nurse-call / room-status flag systems** (the literal doctor's-office analog) are patented in
  healthcare. Different field, but note it.
- **Self-storage-specific** navigation / aisle-occupancy patents (check PTI, Janus/Nokē, OpenTech) — likely
  greener space, and where your own novelty would live.
- **Opportunity:** fold Guide Path into the **same provisional** as the lock. A claim to a *single powered
  node network that fuses access control, environmental/tamper sensing, tenant wayfinding, and staff
  presence signaling on one low-voltage bus* is broader and more defensible than the lock alone, and it's a
  stronger REIT-IP story. Have counsel decide whether to file it together or as a linked continuation.

---

## 6. The one cheap Phase-1 decision that unlocks Phase 2

Bake **forward-compatibility** into the Rev A prototype node so Guide Path is later an add-on, not a respin:
- Add **one spare addressable-LED data channel** (a single GPIO + a footprint for an SK6812-class driver)
  and a **power tap** sized for a few LEDs on the node PCB.
- Reserve **panel addresses** and a route-command message type in the RS-485/mesh protocol and the server
  data model (unit → aisle → node location map).
- Cost now: ~a dollar of parts and a little firmware headroom. Payoff: Phase 2 becomes "mount fixtures +
  flash firmware," not "redesign the board."

---

## 7. Suggested demo (when Phase 2 is greenlit)

1. Tenant taps "navigate" in the app at the gate → end-cap panels light their color + arrows to the aisle.
2. Their unit door pulses **green**; neighbors stay dark. Arrival detected → guidance times out.
3. Manager dashboard shows **"tenant in Aisle 4"**; the aisle flag is lit. Tenant leaves → flag clears.
4. After-hours: same presence turns the aisle flag **amber** and pings the on-call manager. Approach to a
   flagged/delinquent unit turns that unit **red** and escalates.

---

*Phase 2 concept scope. Engineering + product analysis, not legal advice. Run a targeted FTO scan on
parking-guidance and room-status-flag patents before building, and align presence signaling with privacy
counsel and your lease.*
