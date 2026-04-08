# 11 — Open Questions

> Everything that couldn't be resolved through desk research and needs human input before the build spec can be written.

---

## Critical (Blocks Architecture)

### Q1: Payment Processor Selection
**Which high-risk processor to apply to first?**
- PeptiPay (peptide-specialized, no LegitScript needed) vs. Corepay (24-72 hr approval, GLP-1 friendly) vs. AllayPay (domestic US, eCheck included)
- **Why it matters:** Processor choice determines the payment gateway integration (Authorize.net vs. NMI vs. FluidPay), which affects Medusa module development.
- **Action needed:** Apply to 2 processors simultaneously (primary + backup). Need: business entity, EIN, bank account, and a compliance-ready landing page.

### Q2: Business Entity & Compliance Posture
- Is there a legal entity (LLC/Corp) already formed?
- Which state?
- Will the site sell as "research use only" (RUO) or pursue LegitScript/telemedicine model?
- **Why it matters:** RUO model is simpler and doesn't need LegitScript. LegitScript model opens advertising channels (Google, Facebook, Bing) but costs $950+ and requires telemedicine integration.

### Q3: Product Catalog Scope at Launch
- How many products at launch? (Suggestion: start with 15-25 best-sellers from the taxonomy)
- Will you carry SARMs, or peptides only? (SARMs add regulatory complexity)
- Will you carry GLP-1s (Semaglutide, Tirzepatide, Retatrutide)? (Highest demand but also highest legal risk — Eli Lilly is actively pursuing vendors)
- Will you carry research liquids (Tadalafil, Anastrozole, etc.)?
- **Why it matters:** Catalog scope affects category taxonomy, payment risk classification, and initial inventory investment.

### Q4: Medusa.js vs. WooCommerce Decision
- Is the founding team comfortable with TypeScript/Next.js?
- Or would PHP/WordPress be more maintainable?
- **Why it matters:** Medusa is the technically superior choice but WooCommerce has more pre-built payment integrations for this vertical (PeptiPay, Truevo, Coinbase Commerce all have WooCommerce plugins). If the team can't maintain a TypeScript stack, WooCommerce is the pragmatic answer.

---

## Important (Affects Launch Timeline)

### Q5: Inventory Sourcing
- Who is the peptide manufacturer/supplier?
- Will you white-label or brand under AzAminos?
- Who provides COAs — the manufacturer, or will you commission independent testing?
- What is the reorder lead time?
- **Why it matters:** Affects COA workflow (upload manufacturer COA vs. commission testing), product labeling, and restock planning.

### Q6: Shipping & Fulfillment
- Self-fulfilled from home/warehouse, or 3PL?
- Cold chain capability? (Peptides need cold packs in summer)
- Which states/countries will you NOT ship to?
- Free shipping threshold? (Competitors range $149-$200)
- **Why it matters:** Determines shipping integration choice (manual Pirate Ship vs. Shippo API vs. 3PL integration).

### Q7: Domain & Branding
- Is `azaminos.com` the final domain? Is it registered?
- Brand name confirmed as "AzAminos" or subject to change?
- Logo exists, or needs design?
- **Why it matters:** Domain, brand name, and logo are needed before payment processor applications (they review the website).

### Q8: Launch Geography
- US only at launch?
- Or US + select international (UK, Canada, Australia, EU)?
- **Why it matters:** International shipping adds complexity (customs forms, restricted compounds by country, international payment acceptance). Recommend US-only at launch.

---

## Nice to Know (Affects Feature Roadmap)

### Q9: Crypto Priority
- What percentage of revenue do you expect from crypto?
- Should crypto get the same checkout UX priority as credit cards, or is it secondary?
- Will you offer a crypto discount? (Competitors offer 5-10% off)
- **Why it matters:** If crypto is primary (like Next Era Peptide), the checkout UX design shifts significantly. If it's secondary, a simple Coinbase Commerce button suffices.

### Q10: Customer Accounts vs. Guest Checkout
- Require account creation, or allow guest checkout?
- Competitors are split — some incentivize with 10-25% first-order discount for registration
- **Why it matters:** Accounts enable order history, saved addresses, and marketing. Guest checkout reduces friction. Recommend: allow both, incentivize accounts.

### Q11: Reviews / Social Proof
- Will you have product reviews at launch?
- Native reviews or third-party (Judge.me, Yotpo, Trustpilot)?
- **Why it matters:** Peptide Pros credits "15,000+ five star reviews" as a major trust signal. Building a review base takes time — start early or import.

### Q12: Blog / Educational Content
- Will there be a blog at launch?
- Who writes content? (Founder, freelancer, AI-assisted?)
- **Why it matters:** Content drives SEO in this vertical. Competitors with blogs (STL, Limitless, Particle) rank better. But a blog without good content hurts credibility.

### Q13: Marketing Channels
- SEO + organic only at launch?
- Or paid ads? (Google/Facebook require LegitScript for peptide ads)
- Influencer partnerships? (Common in this vertical — bodybuilding/biohacking communities)
- **Why it matters:** If paid ads are a priority, LegitScript certification moves from "nice to have" to "blocking requirement."

### Q14: Budget & Timeline
- What's the budget for MVP development?
- Target launch date?
- Solo developer or team?
- **Why it matters:** Affects build-vs-buy decisions and phase prioritization.

---

## Research Gaps (Things I Couldn't Verify)

| Gap | What's Missing | How to Resolve |
|-----|---------------|----------------|
| **Exact processing fees** | High-risk processors don't publish rates publicly | Apply and get quotes from PeptiPay, Corepay, AllayPay |
| **Rolling reserve percentages** | Mentioned as 5-10% but varies by provider | Will be disclosed during merchant account application |
| **Competitor traffic data** | No SimilarWeb/SEMrush data pulled | Run SimilarWeb for traffic estimates on top 5 competitors |
| **State-level restrictions** | Didn't map which states restrict which compounds | Legal counsel needed to build the restricted-destination table |
| **Tirzepatide legal status** | Eli Lilly enforcement is active but scope unclear | Legal counsel on whether to carry tirzepatide at all |
| **Medusa v2 payment module maturity** | How easy is custom payment provider integration in Medusa v2? | Build a spike/proof-of-concept with Authorize.net integration |
| **Exact competitor checkout flows** | Many sites use JS-heavy checkout that WebFetch can't capture | Manual walkthrough of 3-4 competitor checkouts needed |
| **PeptiPay reliability** | New/niche provider — limited independent reviews | Ask for references; start with a small transaction volume |
