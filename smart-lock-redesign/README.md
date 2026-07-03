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
