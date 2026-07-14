# Equita — Court-Connected Asset Liquidation (Prototype)

> Liquidate marital assets with a **court-connected, traceable money flow**: dual-consent,
> judicial authorization, neutral-controlled escrow, and a hash-chained audit trail —
> all on one shared ledger that the court, both parties, and the neutral can see.

Self-contained static site — no build step, no dependencies. Deploys to any static host.

## Structure

| Path | What it is |
|------|-----------|
| `index.html` | **Consumer landing page** (getequita.com front door) — hero, how-it-works, live fair-split calculator, waitlist |
| `demo/index.html` | **Interactive app prototype** — the court-connected liquidation console (served at `/demo`) |
| `SPEC.md` | Product, architecture & regulatory specification |
| `favicon.svg`, `og-cover.png` | Brand + social-share assets |
| `netlify.toml` | Deploy config (publish root, `/app`→`/demo` redirect, www→apex, security headers) |

---

## Why this exists

The market for divorce/fintech tooling is fragmented into four silos that don't talk to
each other:

| Silo | Examples | What they do |
|------|----------|--------------|
| Forensic / asset tracing | Thrive Financial, Valid8, CounselPro | **Find & value** assets, flow-of-funds analysis |
| Escrow / neutral custodian | BNY Mellon, Hudson, Secured Trust | **Hold** money in trust |
| Court connectivity | 1eFile, USLegalPro, Tyler Odyssey/ECF | **File** documents into court systems |
| Traceability rails | Chainalysis; academic blockchain case-mgmt | **Prove** the money trail |

**Nobody owns the liquidation-execution layer** — turning the marital estate into cash and
disbursing it against the decree, with all three stakeholders on one traceable ledger.
That connective tissue is what Equita prototypes:

```
court order  →  dual-consented sale  →  escrow  →  decree-driven split  →  immutable audit filed back to court
```

## What the prototype demonstrates

- **Dual-consent state machine** — every asset advances only with both parties'
  consent, then judicial authorization: `Proposed → Co-signed → Court order → On market → Sold → Disbursed`.
- **Role-gated actions** — switch between *Petitioner / Respondent / Court / Neutral*;
  you can only take an action when it is genuinely your move.
- **Neutral-controlled escrow ledger** — sale proceeds flow in; disbursements flow out.
- **Decree-as-config distribution** — split percentages and carve-outs (reimbursements,
  fees) are encoded, so payouts are *computed*, not hand-cut.
- **Hash-chained audit trail** — each record's hash is derived from the previous record's
  hash, making the log tamper-evident and court-exportable (JSON export included).

## Run it locally

```bash
python3 -m http.server 8080   # then open http://localhost:8080  (demo at /demo/)
```

## Deploy to getequita.com (Netlify)

The waitlist form posts to **Netlify Forms** (`data-netlify="true"`), so signups are
captured automatically — no backend needed.

1. **Create the site** on Netlify from this repo. Because the project lives in a
   subfolder, set **Base directory = `divorce-platform`** and **Publish directory = `.`**
   (or first extract it to its own repo — see below).
2. **Add the domain:** Netlify → *Domain settings* → add `getequita.com` and `www.getequita.com`.
3. **Point DNS at GoDaddy** (keep the domain registered at GoDaddy, just change records):
   - **Apex** `getequita.com` → **A** record to Netlify's load balancer `75.2.60.5`
     *(or use Netlify DNS / an `ALIAS`/`ANAME` if your DNS host supports it)*.
   - **www** → **CNAME** to `<your-site>.netlify.app`.
   - Point `getequita.net` at the same site (Netlify treats it as a domain alias / 301).
4. Netlify auto-provisions HTTPS (Let's Encrypt) once DNS resolves.
5. Waitlist emails appear under **Netlify → Forms → `waitlist`** (add a notification/webhook
   to pipe them to email, a sheet, or your CRM).

> Also fine on Vercel/Cloudflare Pages — but the Netlify Forms capture is Netlify-specific;
> on other hosts swap the form action for Formspree or a serverless function.

## Extracting into its own repository

Recommended before production (keeps it off the NeuroIQ repo):

```bash
git subtree split --prefix=divorce-platform -b equita-standalone
# then push that branch to a new empty repo and point Netlify at its root
```

## Roadmap to production (not built here)

This is a **UI concept with mock data**, not a live system. A real build needs:

1. **Backend state machine + ledger** — the reducer here becomes an append-only,
   double-entry service (Postgres + event sourcing); the demo hash-chain becomes real
   signatures / notarization.
2. **Real escrow** — money-transmitter / escrow licensing, a chartered trust or BaaS
   partner, KYC-AML on both parties.
3. **Liquidation channels** — pluggable adapters: MLS/brokerage for real estate,
   marketplaces for chattel, brokerage APIs for securities, regulated exchanges for crypto.
4. **Court adapter** — integrate open e-filing standards (Tyler Odyssey / OASIS ECF) to
   pull the decree in and file the completed money-flow back as proof.
5. **Identity & e-signature** — verified identity per party + judge, legally-binding
   consent capture.

> ⚠️ Prototype / demonstration only. Nothing here constitutes legal or financial advice.
