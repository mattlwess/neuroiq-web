# Equita — project context for Claude Code

You are working on **Equita**, a court-connected platform that lets divorcing parties
**liquidate marital assets** (real estate, vehicles, brokerage securities, crypto, chattel)
with a fully **traceable money flow**. Read `SPEC.md` and `README.md` before making changes.

## The one-sentence thesis
Existing tools only do pieces — forensic **tracing** (Thrive, Valid8, CounselPro), generic
**escrow** (BNY, Hudson), court **e-filing** (1eFile, Tyler Odyssey/ECF), crypto **tracing**
(Chainalysis). Nobody owns the **liquidation-execution + disbursement spine**:
`court order → dual-consented sale → neutral-controlled escrow → decree-driven split → immutable, court-exportable audit trail`, with the court, both spouses, and a neutral on one shared ledger. Equita is that spine.

## Brand
- **Equita** = consumer-facing brand. Domains owned: `getequita.com`, `getequita.net`
  (registered at GoDaddy; premium `equita.com` is a later purchase).
- **Decree** = reserved name for a future court/attorney (B2B) tier. Note: lowercase
  "decree" in the product means the *divorce judgment* (correct legal term) — do not rename it.
- Palette: teal `#147D6F` (trust/renewal) + muted gold `#A9781F` (money/fair-share) on cool
  paper `#F4F6FA` / deep slate ink `#16232F`. Type: humanist **serif** display + system
  **sans** body + **mono** for ledger figures/eyebrows. Light + dark themes.

## Repo structure (this folder)
| Path | What it is |
|------|-----------|
| `index.html` | Consumer **landing page** (getequita.com front door): hero, how-it-works, live fair-split calculator, Netlify-Forms waitlist |
| `demo/index.html` | Interactive **app prototype**: role-gated dual-consent state machine, escrow ledger, decree-driven disbursement, hash-chained audit trail (served at `/demo`) |
| `SPEC.md` | Product + architecture + regulatory spec (~3.4k words, cited) |
| `netlify.toml` | Deploy config (publish root, `/app`→`/demo`, www→apex, security headers) |
| `favicon.svg`, `og-cover.png` | Brand + social assets |

Everything is **static HTML/CSS/vanilla-JS, no build step, no dependencies.**

## Conventions
- Keep pages **self-contained** (inline CSS/JS, no external fonts/CDNs) so they deploy anywhere.
- Theme via CSS custom-property tokens; override under both `@media (prefers-color-scheme)`
  and `:root[data-theme=...]`. Respect `prefers-reduced-motion`. Use `tabular-nums` for money.
- Money/ledger logic lives in the demo's reducer (`apply()` / `pending()`); the audit chain is
  a djb2 demo hash — in a real build this becomes SHA-256 + Merkle + RFC 3161 + WORM (see SPEC §5–6).

## How to run
```bash
python3 -m http.server 8080   # http://localhost:8080  (demo at /demo/)
```
Optional headless smoke-test with Playwright (Chromium): load the page, assert no
`pageerror`/console errors, exercise the calculator + waitlist, screenshot light & dark.

## Deploy
Static site → Netlify (see README "Deploy to getequita.com"). Waitlist posts to **Netlify
Forms**; signups land in Netlify → Forms → `waitlist`.

## Likely next tasks (pick with the user)
1. Extract this folder to its own repo (`git subtree split --prefix=divorce-platform`).
2. Build the real **MVP backend**: event-sourced ledger + state-machine service (SPEC §3–4).
   Recommended stack per spec: partner-custody escrow (chartered trust / escrow-as-a-service),
   brokerage-first liquidation adapter (e.g. Alpaca), Postgres event store.
3. Landing refinements: FAQ, founding story, real form-notification wiring.

## Guardrails
This is **pre-launch, mock data**. Nothing here is legal/financial advice. A production build
requires escrow/money-transmission licensing (or a chartered partner), KYC/AML, identity
verification, and court-integration compliance — see SPEC §5–8. Do not imply Equita is a live
regulated service.
