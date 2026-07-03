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
