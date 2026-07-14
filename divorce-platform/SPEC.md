# Equita — Product, Architecture & Regulatory Specification

**Version 0.1 (Draft) · July 2026**

Equita is a court-connected platform that lets divorcing parties **liquidate marital assets** — real estate, vehicles, brokerage securities, crypto, and valuable chattel — with a fully traceable money flow. Its differentiator is the **liquidation-execution and disbursement layer**: it ties a court order → a dual-consented sale → neutral-controlled escrow → decree-driven split → an immutable, court-exportable audit trail, with the court, both spouses, and a court-appointed neutral all reading from one shared ledger. Existing tools do only pieces — forensic asset *tracing* (Thrive Financial, Valid8, CounselPro), generic *escrow* (BNY, Hudson, Secured Trust), *e-filing* pipes (1eFile, USLegalPro, Tyler Odyssey/ECF), and crypto *tracing* (Chainalysis). Nobody owns the execution spine that turns a decree into settled, split, provable money movement. Equita is that spine.

> **⚠️ NOT LEGAL ADVICE.** This document is an engineering and business specification prepared for internal product planning. It is not legal, regulatory, tax, or investment advice, and nothing here should be relied on as a legal opinion. Money-transmission, escrow, securities, and family-law rules vary by state and change frequently. Retain qualified fintech regulatory counsel and family-law counsel in every operating jurisdiction before building or launching. All cost and timeline figures are rough public-source estimates, not commitments.

---

## 1. Problem & Market Gap

Divorce forces the division of jointly owned assets, and courts frequently order that specific assets be **sold and the proceeds split**. Today that execution is manual, adversarial, and opaque: a realtor sells the house months later, a broker liquidates an account by phone, one spouse "handles" the crypto, funds land in a lawyer's IOLTA or a title company's escrow, and the actual split is reconstructed after the fact from bank statements and trust-account ledgers. Trust between the parties is at its lowest exactly when large sums move. Neither spouse — nor the judge — has a real-time, tamper-evident view of *what was sold, for how much, where the money went, and whether the split matched the decree*.

The market has solved adjacent problems in silos but left the execution spine open:

| Capability | Who does it today | What they do NOT do |
|---|---|---|
| Forensic asset **tracing / discovery** | Thrive Financial, Valid8, CounselPro | Execute sales; control escrow; disburse per decree |
| Generic **escrow / trust custody** | BNY, Hudson, Secured Trust, title companies | Divorce-specific dual consent; court order as trigger; decree-driven split logic |
| Court **e-filing** integration | 1eFile, USLegalPro, Tyler Odyssey / ECF | Move or hold money; sell assets; reconcile proceeds |
| Crypto **tracing** | Chainalysis, TRM | Liquidate on a regulated venue and disburse |
| Multi-asset **liquidation + decree-driven disbursement** on a shared court ledger | **— nobody —** | **This is Equita** |

The gap is not "another escrow account" or "another e-filing API." It is the **orchestration and provenance layer** that binds order, consent, sale, custody, split, and audit into one court-legible record.

---

## 2. Users & Jobs-to-Be-Done

- **Divorcing individual (each spouse).** "I want the marital assets sold at fair value, I want proof my ex isn't hiding or skimming proceeds, and I want my share to arrive with a receipt I can trust." Needs: identity-verified access, clear consent prompts, real-time visibility, dispute flags.
- **Family-law attorney.** "I want to execute the property settlement without babysitting a realtor, a broker, and a title company, and without my IOLTA becoming the reconciliation of last resort." Needs: matter dashboard, document export, e-filing hooks, defensible audit trail for the file.
- **Judge / court.** "I ordered a sale and a 60/40 split. Show me it happened exactly that way, in a record I can rely on and that survives appeal." Needs: read-only case view, order intake, exportable immutable audit package, no custody of funds by the court.
- **Court-appointed neutral (special master / receiver / referee).** "I'm accountable for executing the sale and the split. I need authority to trigger liquidation and disbursement, and a record that protects me." Needs: controlled disbursement authority, dual-consent gating, event log, court reporting.

---

## 3. Product Scope

### MVP (single asset class, single pilot county)

The MVP proves the **spine** on the *simplest* liquid asset — a jointly held brokerage account — in one cooperative jurisdiction.

**The MVP DOES:**
- Onboard both spouses + attorneys + a neutral with full KYC (identity, sanctions screening).
- Ingest a **structured court order / stipulated judgment** (uploaded PDF + human-keyed structured terms in the pilot; not auto-parsed).
- Capture **dual, ESIGN/UETA-compliant consent** from both parties to a specific liquidation and split instruction.
- Route liquidation of a **brokerage account** through a **partner broker API** (e.g., Alpaca Broker API) [alpaca.markets/broker].
- Hold proceeds in a **neutral-controlled escrow held by a chartered partner** (not Equita's own bank account) and disburse per the decree split.
- Maintain a **double-entry escrow ledger** and a **hash-chained, court-exportable audit trail**.
- Produce a signed, exportable **settlement package** (statement + audit proof) for the court file.

**The MVP does NOT:**
- Hold client money on Equita's own balance sheet or under Equita's own money-transmitter license (custody sits with the chartered partner — see §5).
- Directly e-*file* into the court docket (MVP exports a PDF/package; native ECF filing is Phase 2).
- Sell real estate, vehicles, or physical chattel (those require marketplace/MLS/title adapters — later phases).
- Auto-parse orders with AI, give legal advice, value assets, or opine on what a "fair" split is — the split comes from the decree.
- Handle QDRO-governed retirement accounts (ERISA plan-administrator process; Phase 3+, see §6).

### Later phases

- **Phase 2:** Real-estate adapter (listing/MLS + title/closing coordination), native ECF 5.0 e-filing, multi-county.
- **Phase 3:** Crypto liquidation via a regulated exchange (Coinbase Prime) [coinbase.com/developer-platform/products/prime-apis], vehicle/chattel marketplace adapters, QDRO orchestration workflow.
- **Phase 4:** Multi-state escrow/licensing footprint, receiver-network marketplace, analytics.

---

## 4. System Architecture

Equita is an **event-sourced orchestration platform**. Every state change is an immutable event; the escrow ledger and audit chain are projections of that event log. External money and asset movement happen through **adapters** to regulated partners; Equita never becomes the venue or the bank.

```
                         ┌──────────────────────────────────────────────┐
                         │                 Equita Core                  │
   Spouse A ──▶┐         │                                              │
   Spouse B ──▶┤  Web/   │  ┌────────────┐   ┌──────────────────────┐   │
   Attorneys ─▶┤  Mobile │  │  Identity/ │   │  Case State Machine  │   │
   Neutral ───▶┤  Client │  │  KYC/AML   │   │  (event-sourced)     │   │
   Judge ─────▶┘         │  └────────────┘   └─────────┬────────────┘   │
                         │        │                    │                │
                         │  ┌─────▼──────┐   ┌─────────▼───────────┐    │
                         │  │  Consent   │   │  Double-Entry       │    │
                         │  │  Service   │   │  Escrow LEDGER      │    │
                         │  │(ESIGN/UETA)│   │  (debits=credits)   │    │
                         │  └─────┬──────┘   └─────────┬───────────┘    │
                         │        │                    │                │
                         │  ┌─────▼────────────────────▼───────────┐    │
                         │  │  Tamper-Evident AUDIT CHAIN           │    │
                         │  │  (hash-chain → Merkle root → TSA/WORM)│    │
                         │  └───────────────────┬──────────────────┘    │
                         │        ┌─────────────┴───────────────┐       │
                         │        │        ADAPTER LAYER         │       │
                         └────────┼──────────────┬──────────────┼───────┘
                                  │              │              │
                     ┌────────────▼──┐ ┌─────────▼────────┐ ┌───▼──────────────┐
                     │ ESCROW/DISBURSE│ │  LIQUIDATION     │ │  COURT ADAPTER   │
                     │  (chartered    │ │  CHANNELS        │ │ (ECF 5.0 / EFM / │
                     │  trust/EaaS    │ │  · Brokerage API │ │  proxy; PDF pkg) │
                     │  partner)      │ │  · Crypto exch.  │ └──────────────────┘
                     └────────────────┘ │  · RE / MLS+title│
                                        │  · Marketplace   │
                                        └──────────────────┘
```

### Core services

- **Identity / KYC / AML** — onboarding, document + non-documentary verification, OFAC/sanctions screening, ongoing monitoring (§6).
- **Case State Machine (event-sourced)** — the authoritative workflow. States roughly: `CaseOpened → PartiesVerified → OrderIngested → LiquidationProposed → DualConsentCaptured → LiquidationExecuting → ProceedsInEscrow → SplitCalculated → DisbursementAuthorized → Disbursed → SettlementExported → Closed`. Guards enforce that money-moving transitions require both consent and a matching order term.
- **Consent Service** — renders the exact instruction, captures intent, consent-to-electronic-business, signature-to-record association, and retention per ESIGN/UETA (§4 requirements below).
- **Escrow Ledger** — see below.
- **Audit Chain** — see below.
- **Adapter Layer** — escrow/disbursement, liquidation channels, and court adapters behind uniform interfaces so partners can be swapped per jurisdiction.

### Double-entry escrow ledger

A classic **double-entry** ledger is the financial source of truth. Every movement is balanced (Σ debits = Σ credits); accounts are per-case and per-party. Example flow for a $200,000 brokerage liquidation split 60/40:

```
Event                        Debit                     Credit
Proceeds received      Escrow:Case#123     200,000   AssetSale:Brokerage 200,000
Fee accrual            Payable:Fees            500    Escrow:Case#123        500
Split A (60%)          Payable:SpouseA    119,700    Escrow:Case#123    119,700
Split B (40%)          Payable:SpouseB     79,800    Escrow:Case#123     79,800
Disburse A             Escrow:Bank        119,700    Payable:SpouseA    119,700
Disburse B             Escrow:Bank         79,800    Payable:SpouseB     79,800
```

The ledger is **append-only** — corrections are reversing entries, never edits. The actual cash lives in the **partner's** escrow/omnibus account; Equita's ledger is the sub-ledger of record, reconciled to the partner's statement daily.

### Event-sourced state machine + tamper-evident audit chain

The event log is the system of record; ledger and case status are derived projections, which makes replay, audit, and dispute reconstruction straightforward. To make tamper-evidence **real, not a gimmick**, Equita combines four layered techniques drawn from the certificate-transparency / Merkle-log playbook [dipankar-das.com/blog/merkle-hash-chain-audit-logs/]:

1. **Hash chaining.** Each event stores `SHA-256(prev_hash ‖ canonical_payload)`. Altering, deleting, or reordering any event breaks every downstream hash and is immediately detectable.
2. **Merkle batching.** Events are periodically batched into a Merkle tree; the root summarizes the whole batch and enables cheap inclusion proofs for any single event.
3. **External anchoring / notarization.** The Merkle root is anchored where Equita cannot reach it — an **RFC 3161 trusted timestamp authority** and optionally a public append-only ledger — so nobody (including Equita) can backdate or rewrite history [originstamp.com/en/blog/reader/blockchain-timestamp]. This is the difference between "we promise" and "here is math a third party attests to."
4. **WORM storage.** The raw event log and anchored roots are written to **write-once-read-many / object-lock** storage, so the cloud provider guarantees immutability for the retention period even against a rogue insider.

The **court export** bundles the relevant events, their Merkle inclusion proofs, the anchored root, and the RFC 3161 timestamp token into a self-verifying package a judge (or opposing counsel, or an appellate court) can independently validate.

### Core data model (entities → key fields)

- **Case** — `case_id, court_id, docket_no, jurisdiction, distribution_regime (equitable|community), status, created_at`.
- **Party** — `party_id, case_id, role (spouseA|spouseB|attorney|neutral|judge), kyc_status, sanctions_status, verified_at`.
- **CourtOrder** — `order_id, case_id, type (stipulation|judgment|sale_order), doc_hash, effective_date, split_terms (JSON: asset→{partyA_pct, partyB_pct, priorities}), ingested_by`.
- **Asset** — `asset_id, case_id, class (brokerage|realestate|crypto|vehicle|chattel), external_ref, valuation, liquidation_channel`.
- **LiquidationOrder** — `liq_id, asset_id, channel_adapter, requested_by, gross_proceeds, fees, status`.
- **Consent** — `consent_id, party_id, target_ref (liq_id|disbursement_id), intent_captured, econsent_captured, signature_artifact, record_hash, ip, timestamp`.
- **LedgerEntry** — `entry_id, case_id, debit_account, credit_account, amount, currency, ref_event_id`.
- **Disbursement** — `disbursement_id, case_id, party_id, amount, rail (ACH|wire), partner_txn_id, status`.
- **AuditEvent** — `event_id, case_id, type, payload, prev_hash, this_hash, merkle_batch_id, anchored_root, tsa_token`.

---

## 5. Escrow & Money-Movement Design

**The central design decision: Equita does not want to be a licensed money transmitter, and should structure so it does not have to be.** Holding customer funds or acting as a payment intermediary generally triggers state **Money Transmitter Licenses (MTLs)** plus **FinCEN MSB registration** [moderntreasury.com/journal/how-do-money-transmission-laws-work]. Doing this in all states is roughly a **6–12+ month** effort per heavily regulated state (California, New York) and, at full 50-state scale, on the order of **$225k+/year** in maintenance alone plus surety bonds of **$50k–$1M per state** and multi-million-dollar net-worth and bonding requirements [innreg.com/blog/money-transmitter-license-steps-and-requirements; brico.ai/post/how-much-do-mtls-cost; remitso.com/blogs/money-transmitter-license]. That is a non-starter for an MVP.

Three structural facts make a partner-led path realistic:

1. **The chartered-partner exemption.** A subsidiary or agent operating under a state- or federally-chartered **bank or trust company** is generally exempt from separate MTL requirements, because the charter already covers the custody/transmission activity [bastion.com/blog/understanding-the-regulatory-landscape-money-transmitters-msbs-trust-companies-and-banks]. In California specifically, **banks, trust companies, and similar regulated institutions are "non-independent" escrow agents exempt from the independent Escrow Law licensing** that otherwise binds standalone escrow companies (which need a corporation, a $50k bond, $50k tangible net worth, and experienced principals) [dfpi.ca.gov/regulated-industries/escrow-law/consumer-information-escrow/].
2. **The escrow-as-integral-service ruling.** FinCEN has ruled that when acceptance and transmission of funds are a **necessary and integral part of a transaction-management service** (its classic ruling was an internet-sale escrow), the provider is **not** a money transmitter [fincen.gov/resources/statutes-regulations/administrative-rulings/application-money-services-business-1]. Equita's role — orchestrating a court-ordered sale and split — is plausibly analogous, but this is fact-specific and must be confirmed by counsel, not assumed.
3. **The agent-of-another-MSB rule.** A firm that is an MSB *solely* because it acts as agent of another (licensed) MSB need not separately register [fincen.gov/resources/money-services-business-msb-registration].

**Recommended path:** Equita partners with a **chartered trust company or an escrow-/trust-as-a-service provider** that holds funds in a partner-owned escrow/omnibus account under its charter. Equita provides the software orchestration, dual-consent gating, ledger, and audit; the **partner is the custodian and regulated money-mover of record**, with the court-appointed **neutral** holding the disbursement authority the court delegates. Equita still registers with FinCEN as an MSB if counsel deems its activity to reach that line, and it builds a full BSA/AML program regardless because partners will contractually require it. This converts a 50-state licensing marathon into a **commercial partnership + one exemption analysis per operating state**, letting the pilot launch in a single county in months rather than years.

---

## 6. Compliance & Security

**KYC / AML / BSA.** Even under a partner-custody model, Equita builds a program on the **five pillars** (designated compliance officer, internal controls/policies, training, independent testing, and risk-based CDD) [capitalcomplianceexperts.com/compliance-news/the-five-5-pillars-of-bsa-aml-ofac-compliance/; fdic.gov/banker-resource-center/bank-secrecy-act-anti-money-laundering-bsaaml]. Concretely: a **CIP** verifying each party at onboarding via documentary and/or non-documentary (third-party) methods; **CDD** risk-rating and, where entities are involved, beneficial-ownership collection under the FinCEN CDD Rule; **OFAC sanctions screening** at onboarding, real-time before any disbursement, and on periodic rescreen [treasuryprime.com/blog/bsa-aml-policy-requirements; fluxforce.ai/blog/guide-to-aml-compliance-for-fintechs]. Divorce is a known vector for hidden/illicit assets, so transaction monitoring and SAR referral pathways (via the partner) matter more here than in a typical consumer app.

**E-signature & consent (ESIGN / UETA).** Every money-moving action is gated by consent that satisfies the four statutory requirements: **intent to sign**, **consent to do business electronically** (with the consumer disclosure and right to a paper record), **association of the signature with the specific record**, and **record retention/reproducibility** [ironcladapp.com/journal/contract-management/electronic-signature-law; signwell.com/resources/ueta-and-esign-act/]. In a two-party divorce, Equita captures **each spouse's consent to the exact same instruction** and preserves the withdrawal-of-consent right — the dual-consent artifact is itself an audit event with its own record hash.

**Family-law correctness.** The engine is jurisdiction-aware: **equitable-distribution** states divide marital property "fairly, not necessarily equally," while **community-property** states (CA, TX, AZ, NV, WA, ID, LA, NM, WI) presume a 50/50 split [utcourts.gov/en/self-help/case-categories/family/divorce/property.html]. Courts **can order a sale** rather than an in-kind distribution, though many jurisdictions presume in-kind distribution first [sog.unc.edu/blogs/civil-side/equitable-distribution-can-court-order-sale-marital-property]. The **neutral** (special master / receiver / referee) is the actor with delegated authority to execute the sale and disbursement — Equita models that role explicitly rather than pretending the software has authority. **Retirement accounts** are handled out-of-band via a **QDRO**, a separate court order directing the ERISA plan administrator to split the plan; Equita does not liquidate retirement plans in early phases but can track the QDRO as a case artifact [freemanlaw.com/qualified-domestic-relations-orders/; en.wikipedia.org/wiki/Qualified_domestic_relations_order].

**Court e-filing.** Native integration targets **OASIS LegalXML ECF 5.0 / ECF web services**, the non-proprietary XML + web-services standard for interoperable filing [docs.oasis-open.org/legalxml-courtfiling/ecf/v5.0/cs01/ecf-v5.0-cs01.html]. In practice most US courts run **Tyler Odyssey with an Electronic Filing Manager (EFM)** that an EFSP integrates into via SOAP web services [tylertech.com/.../Odyssey-Open-Platform-E-Courts.pdf]; open implementations like the **Suffolk LIT Lab E-file Proxy Server** and the `tyler-efm-client` SDK show the realistic integration surface [projects.suffolklitlab.org/EfileProxyServer/architecture/; pypi.org/project/tyler-efm-client/]. Honest expectation: full native filing requires per-jurisdiction EFM certification and is a Phase-2 effort; the MVP produces a court-ready PDF/package that a human files.

**Data privacy & security.** Equita is a financial institution for **GLBA** purposes — it must follow the GLBA Privacy Rule (notices, opt-outs) and the **Safeguards Rule** (a written information-security program with administrative, technical, and physical controls) [ftc.gov/business-guidance/resources/how-comply-privacy-consumer-financial-information-rule-gramm-leach-bliley-act]. **CCPA/CPRA** partially exempts GLBA-covered *data* but not the *entity*, so any non-GLBA data (marketing, prospects, web analytics) is still in scope, and CPRA's **sensitive personal information** rules and 2026 ADMT/risk-assessment regulations apply [orrick.com/.../GLBA-and-FCRA-Exemptions...; onetrust.com/blog/navigating-the-cpra-as-a-glba-compliant-business/]. Baseline controls: encryption in transit and at rest, tenant/case isolation, least-privilege RBAC keyed to court roles, **SOC 2 Type II** as the trust artifact for court and partner due diligence, and the WORM + notarization audit design from §4 doubling as both a legal and a security control.

---

## 7. Regulatory & Licensing Roadmap (phased, rough ranges)

| Gate | What it unlocks | Approach | Rough cost / time |
|---|---|---|---|
| **G0 — Counsel + structure** | Legal go/no-go on the partner model | Fintech + family-law counsel; escrow/MTL exemption memo per pilot state | ~$75k–$200k; 1–3 months |
| **G1 — FinCEN MSB registration** (if reached) | Federal AML posture | FinCEN Form 107 e-file; renew every 2 yrs | Low $; days-to-weeks + program build |
| **G2 — Chartered escrow/trust partner** | Custody & disbursement without own MTL | Commercial deal with trust co. / EaaS provider | Revenue-share/fees; 2–4 months to integrate |
| **G3 — BSA/AML + SOC 2** | Partner + court trust | Program, vendor tooling, Type II audit | ~$150k–$400k; 6–12 months to Type II |
| **G4 — ECF/EFM certification** | Native e-filing per court | EFSP integration + jurisdiction certification | Per-jurisdiction; months each |
| **G5 — Own escrow/MTL footprint** (optional, later) | Reduce partner dependence, multi-state | State-by-state or MTL Agreement/NMLS | $225k+/yr at scale; 12–24+ months |

Note: G5 is deliberately *last* and optional — the entire strategy is to defer or avoid direct 50-state licensing by riding a chartered partner's charter for as long as economically sensible.

---

## 8. Risks & Open Questions

- **Money-transmission characterization (highest risk).** The escrow-as-integral-service ruling is favorable but fact-specific; a regulator could view multi-party, court-ordered disbursement as transmission. Mitigation: partner-custody structure + written counsel opinion per state before launch.
- **"Practicing law" / unauthorized authority.** Equita must never appear to decide the split or exercise court authority — the decree and the neutral do. Keep the product a faithful executor, not an adjudicator.
- **Court adoption & procurement.** Courts are slow, risk-averse buyers; ECF/EFM certification is gated by vendors (notably Tyler). Mitigation: start with a single cooperative county and a PDF-export MVP, not native filing.
- **Trust in an adversarial setting.** If either spouse distrusts the platform, the whole value prop collapses. The tamper-evident, independently-verifiable audit chain is the trust primitive; it must be genuinely third-party-verifiable, not marketing.
- **Fiduciary / custody liability.** Even as software, Equita touches money-moving decisions; errors in split logic or disbursement are high-severity. Mitigation: double-entry invariants, reversing-entry corrections, daily partner reconciliation, human neutral in the loop.
- **Asset-specific edge cases.** Underwater mortgages, liens, jointly-titled vehicles, illiquid or disputed chattel, and volatile crypto pricing all complicate "liquidate and split." Scope tightly by asset class per phase.
- **QDRO / ERISA complexity.** Retirement splits are governed by plan administrators, not Equita — resist scope creep here.

---

## 9. Phased Build Roadmap (tied to licensing gates)

1. **Phase 0 — Foundations (G0, G1).** Counsel engagement and structure memo; incorporate; FinCEN registration if reached; design the event-sourced core, ledger, and audit chain; stand up KYC/OFAC vendors.
2. **Phase 1 — MVP, single asset + single county (G2, partial G3).** Brokerage liquidation via partner broker API; partner-custody escrow; dual consent; double-entry ledger; hash-chain + Merkle + RFC 3161 + WORM audit; PDF settlement export. One cooperative county, a handful of real cases with a friendly neutral.
3. **Phase 2 — Pilot hardening + real estate + native e-filing (G3 SOC 2 Type II, G4).** Add RE/MLS + title/closing adapter; native ECF 5.0 / EFM filing in the pilot jurisdiction; complete SOC 2 Type II; onboard 2–3 additional counties.
4. **Phase 3 — Multi-asset scale (G4 per jurisdiction).** Crypto liquidation via regulated exchange; vehicle/chattel marketplace adapters; QDRO tracking workflow; multi-jurisdiction rollout.
5. **Phase 4 — Footprint expansion (G5, optional).** Evaluate own escrow/trust licensing vs. continued partner reliance; receiver-network marketplace; analytics and reporting for courts.

Each phase ships only after its licensing gate clears — the build cadence is deliberately governed by the regulatory cadence, not the reverse.

---

## 10. Sources

- FinCEN — Escrow services / money-transmitter ruling: https://www.fincen.gov/resources/statutes-regulations/administrative-rulings/application-money-services-business-1
- FinCEN — MSB Registration: https://www.fincen.gov/resources/money-services-business-msb-registration
- Bastion — Money transmitters, MSBs, trust companies & banks: https://www.bastion.com/blog/understanding-the-regulatory-landscape-money-transmitters-msbs-trust-companies-and-banks
- InnReg — Money Transmitter License steps & requirements: https://www.innreg.com/blog/money-transmitter-license-steps-and-requirements
- Brico — MTL cost guide (2025): https://www.brico.ai/post/how-much-do-mtls-cost
- Remitso — MTL guide 2026: https://www.remitso.com/blogs/money-transmitter-license
- Modern Treasury — How money-transmission laws work: https://www.moderntreasury.com/journal/how-do-money-transmission-laws-work
- California DFPI — Escrow Law consumer information: https://dfpi.ca.gov/regulated-industries/escrow-law/consumer-information-escrow/
- FDIC — BSA/AML resource center: https://www.fdic.gov/banker-resource-center/bank-secrecy-act-anti-money-laundering-bsaaml
- Capital Compliance Experts — Five pillars of BSA/AML/OFAC: https://www.capitalcomplianceexperts.com/compliance-news/the-five-5-pillars-of-bsa-aml-ofac-compliance/
- Treasury Prime — Fintech BSA/AML policy requirements: https://www.treasuryprime.com/blog/bsa-aml-policy-requirements
- Fluxforce — AML compliance for fintechs 2026: https://www.fluxforce.ai/blog/guide-to-aml-compliance-for-fintechs
- OASIS — Electronic Court Filing 5.0: https://docs.oasis-open.org/legalxml-courtfiling/ecf/v5.0/cs01/ecf-v5.0-cs01.html
- OASIS — ECF web services 5.01: https://docs.oasis-open.org/legalxml-courtfiling/ecf-webservices/v5.01/csd03/ecf-webservices-v5.01-csd03.pdf
- Tyler Technologies — Odyssey Open Platform: https://www.tylertech.com/Portals/0/OpenContent/Files/18882/Odyssey-Open-Platform-E-Courts.pdf
- Suffolk LIT Lab — E-file Proxy Server architecture: https://projects.suffolklitlab.org/EfileProxyServer/architecture/
- tyler-efm-client (PyPI): https://pypi.org/project/tyler-efm-client/
- Ironclad — ESIGN & UETA electronic signature law: https://ironcladapp.com/journal/contract-management/electronic-signature-law
- SignWell — UETA & ESIGN best practices: https://www.signwell.com/resources/ueta-and-esign-act/
- UNC School of Government — Court-ordered sale of marital property: https://www.sog.unc.edu/blogs/civil-side/equitable-distribution-can-court-order-sale-marital-property
- Utah Courts — Property division (equitable vs. community): https://www.utcourts.gov/en/self-help/case-categories/family/divorce/property.html
- Freeman Law — QDROs demystified: https://freemanlaw.com/qualified-domestic-relations-orders/
- Wikipedia — Qualified Domestic Relations Order: https://en.wikipedia.org/wiki/Qualified_domestic_relations_order
- FTC — GLBA Privacy Rule compliance: https://www.ftc.gov/business-guidance/resources/how-comply-privacy-consumer-financial-information-rule-gramm-leach-bliley-act
- Orrick — GLBA/FCRA exemptions under state privacy laws: https://www.orrick.com/en/Insights/2022/08/What-Fintech-Companies-Need-to-Know-About-GLBA-and-FCRA-Exemptions-Under-State-Data-Protection-Laws
- OneTrust — CPRA for GLBA-compliant businesses: https://www.onetrust.com/blog/navigating-the-cpra-as-a-glba-compliant-business/
- Dipankar Das — Merkle hash-chain audit logs: https://dipankar-das.com/blog/merkle-hash-chain-audit-logs/
- OriginStamp — Blockchain timestamping / RFC 3161: https://originstamp.com/en/blog/reader/blockchain-timestamp
- Alpaca — Broker API: https://alpaca.markets/broker
- Coinbase — Prime APIs: https://www.coinbase.com/developer-platform/products/prime-apis
