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
