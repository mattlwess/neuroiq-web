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
