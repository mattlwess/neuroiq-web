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
