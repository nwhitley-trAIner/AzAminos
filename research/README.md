# AzAminos — Competitive & Technical Research

> **Executive Summary:** The research peptide e-commerce vertical is a $500M+ fragmented market with high vendor churn (4 of 10 originally-targeted competitors are now defunct), extreme payment processing complexity (Stripe/PayPal/Square are all prohibited), and trust as the primary differentiator. The recommended build is **Medusa.js + Next.js + PostgreSQL** with a three-rail payment stack (high-risk CC processor + backup processor + crypto via Coinbase Commerce). The site should adopt a clinical-white, trust-forward aesthetic with batch-specific COAs as the centerpiece trust signal. Crypto payments should be first-class, not an afterthought — they may represent 30-50% of transactions. The three decisions that must be made before build can begin: (1) which high-risk payment processor to apply to, (2) product catalog scope at launch, and (3) Medusa.js vs. WooCommerce based on team's TypeScript comfort level.

---

## Research Index

| # | File | Description | Status |
|---|------|-------------|--------|
| 01 | [01_competitor_inventory.md](01_competitor_inventory.md) | 18 competitors cataloged with URLs, traction signals, payment methods, product categories, shipping regions. Includes defunct vendor list. | Complete |
| 02 | [02_ux_patterns.md](02_ux_patterns.md) | Homepage structure, navigation taxonomy, PDP anatomy, cart/checkout flows, search/filter behavior for top 8 sites. Includes cross-site pattern summary. | Complete |
| 03 | [03_visual_style.md](03_visual_style.md) | Four style archetypes identified. Clinical White recommended for premium positioning. Color palettes, typography, photography patterns documented. | Complete |
| 04 | [04_product_taxonomy.md](04_product_taxonomy.md) | Normalized taxonomy across 10 categories with representative products, dosages, and price ranges from multiple vendors. Seed catalog structure proposed. | Complete |
| 05 | [05_verbiage_and_copy.md](05_verbiage_and_copy.md) | Verbatim copy from 11 competitor sites: hero headlines, RUO disclaimers, product descriptions, shipping/returns, FAQs, trust copy, footer legal. Recurring phrases mapped. | Complete |
| 06 | [06_trust_and_compliance_signals.md](06_trust_and_compliance_signals.md) | COA presentation, third-party lab partnerships, review systems, purity claims, certifications across 8 competitors. Sports Technology Labs identified as best-in-class. | Complete |
| 07 | [07_payments_landscape.md](07_payments_landscape.md) | **CRITICAL.** Stripe prohibition confirmed (verbatim quotes). Competitor payment methods mapped. 10 peptide-viable processors compared. Three-rail payment stack recommended. | Complete |
| 08 | [08_inventory_and_admin_requirements.md](08_inventory_and_admin_requirements.md) | Product CRUD fields, race-condition-safe stock enforcement patterns, order state machine, shipping integration comparison, admin RBAC. Medusa.js recommended over WooCommerce. | Complete |
| 09 | [09_security_model.md](09_security_model.md) | 13-threat model with controls matrix. Data minimization strategy, PCI SAQ-A compliance path, security architecture diagram, security headers checklist. | Complete |
| 10 | [10_tech_stack_recommendation.md](10_tech_stack_recommendation.md) | Full stack recommendation with alternatives and justifications. Mermaid architecture diagram. Phased implementation plan. Monthly cost estimates (~$120-160/mo infrastructure). | Complete |
| 11 | [11_open_questions.md](11_open_questions.md) | 14 open questions organized by criticality. Research gaps identified with resolution paths. | Complete |

---

## Top 5 Findings

1. **Stripe is definitively off the table** — "Research chemicals" are explicitly prohibited with no exception pathway. PayPal and Square have the same restriction. The entire payment architecture must be built around high-risk processors.

2. **Vendor churn is extreme** — Peptide Sciences (shut down March 2026), Amino Asylum (redirecting), Swole AF Labs (rebranded/redirecting), Pumping Iron Store (down). This signals both risk and opportunity in the market.

3. **Crypto is not optional** — ~70% of active competitors accept cryptocurrency. Some (Next Era Peptide) are crypto-only. The payment processing headaches make crypto a pragmatic necessity, not just a feature.

4. **COAs are the trust battleground** — Sports Technology Labs (named lab, batch-specific, verifiable) vs. Peptide Sciences (internal testing, shut down with 75% purity reports) illustrate that trust through transparency is the #1 competitive differentiator.

5. **GLP-1s dominate demand but carry legal risk** — Semaglutide/Tirzepatide/Retatrutide are the highest-demand products, but Eli Lilly is actively threatening vendors. Multiple competitors give GLP-1s their own top-level navigation category.

## Top 3 Decisions Needed

1. **Payment processor:** Apply to PeptiPay and/or Corepay. This requires a business entity, bank account, and compliance-ready landing page. Until a processor is approved, nothing else matters.

2. **Catalog scope:** Peptides only, or peptides + SARMs + research liquids? This affects risk classification, payment processor approval, and initial inventory investment.

3. **Tech platform:** Medusa.js (TypeScript, more control, better DX) vs. WooCommerce (PHP, more payment plugins, faster to market). Depends on team's technical comfort.
