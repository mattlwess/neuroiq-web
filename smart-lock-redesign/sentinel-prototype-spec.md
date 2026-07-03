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
