# 02 — UX Patterns

> Homepage structure, navigation taxonomy, PDP anatomy, checkout flows, search/filter, and mobile behavior for the top 8 accessible competitors.

---

## 1. Limitless Biotech (limitlesslifenootropics.com)

### Homepage Structure
- **Hero:** Clean headline "Research Peptides Backed by Independent Testing" with subheading about USA-made, third-party verified compounds
- **Trust bar:** Not explicitly visible as a strip; trust messaging is woven into hero copy
- **Category grid:** 13 research categories displayed as cards: Cognitive Health, Immune Health, Metabolic, Mitochondrial, Gastrointestinal, Musculoskeletal, Cardiovascular, Circadian, Dermatological, Cellular Longevity, Reproductive Health, Tissue Regeneration, Hormonal Research
- **Quality commitments section:** Sterility/endotoxin screening, chemical contaminant analysis, complete technical documentation

### Navigation Taxonomy
- **Shop by Research Category** (the 13 categories above — organized by biological system, NOT by compound type)
- **Shop by Type** (product form factor)
- **Shop A-Z** (alphabetical index)
- **Contact Us**
- **Blog**

**Unique insight:** This is the only site that categorizes by *research application area* rather than compound type. This is a premium, trust-forward taxonomy.

### PDP / Cart / Search
- Not fully accessible via static fetch; JavaScript-heavy rendering

---

## 2. Sports Technology Labs (sportstechnologylabs.com)

### Homepage Structure
- **Hero:** "Highest Quality SARMs and Peptides" with four supporting bullets (credit cards, USA-tested, highest purity, same-day shipping)
- **Trust bar:** Contact phone number prominently displayed (959-333-0983)
- **Product listings:** Direct product grid on homepage
- **Bitcoin callout:** "Pay with Bitcoin for another 10% OFF" banner

### Navigation Taxonomy
```
- New Products
- Buy SARMs
  ├── Liquid SARMs
  ├── SARMs Powders
  ├── SARMs Stacks
  └── Wholesale
- Buy Peptides
  ├── Peptides
  ├── Peptide Stacks
  └── Wholesale
- COAs
- FAQs
- Company
  ├── About Us
  ├── Blog
  ├── Videos
  └── Contact Us
```

**Key pattern:** SARMs and Peptides are top-level siblings. Stacks and Wholesale are subcategories under each. COAs get their own top-level nav item (trust signal).

### PDP Anatomy
- Products listed with both research names and common names: "MK-677 (Ibutamoren)", "RAD-140 (Testolone)"
- Liquid SARMs delivered with 1ml dropper
- USP-grade PEG 400 as suspension medium
- Purity claims: "minimum 98%", some up to "101.9%" vs. reference standard

### Cart & Checkout
- **Payment options at checkout:** Credit cards, e-checks, Zelle, cryptocurrency
- **Age gate:** Not visible
- **RUO acknowledgment:** Products positioned as research-only throughout, but no explicit checkbox observed
- **Guest checkout:** Appears available

### Search & Filter
- Standard product sorting/filtering
- Categories accessible via nav dropdowns

---

## 3. Core Peptides (corepeptides.com)

### Homepage Structure
- **Hero:** "Peptides for Sale Online - USA Made | Core Peptides"
- **Tagline:** Team focused on "highest quality peptides for our customers' research needs"
- **Platform:** WordPress + WooCommerce + Divi theme
- **Product grid:** Multi-column layout with price displays and sale badges

### Navigation Taxonomy
- Search-driven navigation with WooCommerce product filtering
- Categories not fully visible in static HTML (JS-rendered)
- Simpler than STL — appears to be a flat or shallow taxonomy

### PDP Anatomy
- WooCommerce product template
- Star rating system
- Price display with sale indicators (styled in blue #36aadd)
- PhotoSwipe gallery (lightbox image viewer)
- Stock status indicators

### Cart & Checkout
- WooCommerce side-cart plugin for quick cart preview
- Standard WooCommerce checkout flow
- Payment: credit cards, Venmo, Zelle, crypto

---

## 4. Peptide Pros (peptidepros.net)

### Homepage Structure
- **Hero:** "Buy Peptides, Research Chemicals and Liquid SARMS from the highest reviewed supplier"
- **Trust callouts:** "15,000+ five star verified reviews", "FREE PRIORITY SHIPPING over $150", "24 Hour Processing", "Delivery Guarantee", "Live Telephone Support: 1-888-391-1312"
- **Registration CTA:** "Register now to SAVE 25%"

### Navigation Taxonomy
```
- USA Catalog Peptides
- Diluents
- Blends & Kits
- SARMS and Liquids
- Wholesale Specials
```

**Key pattern:** "Blends & Kits" as a top-level category is a bundling strategy. "Wholesale Specials" as top-level indicates B2B/volume is a significant segment.

### PDP Anatomy
- Bulk discount noted: "*Bulk discount will be displayed in your shopping cart"
- Products include reconstitution requirements (sterile water)
- Research framing throughout

### Cart & Checkout
- Account registration incentivized (25% off)
- Bitcoin accepted via Blocknomics partnership

---

## 5. Loti Labs (lotilabs.com)

### Homepage Structure
- **Hero:** "Research Peptides & Liquids Made in USA"
- **Trust:** "14 years of industry experience", "clinical grade products", "third party testing"
- **Platform:** WooCommerce with Yotpo reviews integration

### Navigation Taxonomy
```
- Research Liquids
- Peptides
- Capsules
- Reta (GLP-3 products)
- Tirz (GLP-2 products)
- Thymosin Beta 4 (TB-500)
- Glutathione
```

**Key pattern:** GLP-1 products (Reta, Tirz) get their OWN top-level nav items — reflecting their dominance in current demand. Uses abbreviated names ("Reta", "Tirz") suggesting familiarity with audience. Individual compounds (TB-500, Glutathione) promoted to nav level.

### Cart & Checkout
- WooCommerce checkout
- Gate-checking / compliance mechanisms in JavaScript (age or disclaimer verification)

---

## 6. Direct Peptides (directpeptides.com)

### Homepage Structure
- **Hero:** "Order research peptides, direct from the lab"
- **Subheading:** "Batch produced, and tested in the USA"
- **Trust strip:** 24/7 Support, Manufactured in the USA, Batch Produced/Tested, Fast/Discreet Shipping, Affordable Pricing, Same-Day Fulfillment

### Navigation Taxonomy
```
- Products
- Blog
- COA (Certificates of Analysis)
```

**Key pattern:** Extremely minimal nav — just 3 items. Products, Blog, COA. This is the most stripped-down taxonomy observed. COA as a top-level item (same as STL) signals trust prioritization.

### Product Categories (within Products)
```
- Recovery Compounds (BPC-157, TB-500, BPC-157 + TB-500)
- Growth Compounds (CJC-1295 + Ipamorelin, Tesamorelin, Sermorelin)
- Other (GLP3-R, GLP2-T)
```

**Unique insight:** Uses function-based naming ("Recovery", "Growth") rather than chemical classification. Very small catalog — focused on best-sellers only.

### Contact
- SMS: +1 (972) 919-0219
- Email: support@directpeptides.com

---

## 7. Particle Peptides (particlepeptides.com)

### Homepage Structure
- **Hero:** "Highest quality research peptides" / "3rd party tested products"
- **Trust metrics:** "10 years on the market", "10,000+ satisfied customers", "4.9/5 out of 323 reviews"
- **Fraud warning banner:** "Beware of fake profiles and websites. We sell exclusively through this website"

### Navigation Taxonomy
```
- About us
- Buy Peptides
- COA Vault
- Peptide Calculator
- FAQ
- Blog
```

**Key pattern:** "COA Vault" is a distinctive name for their certificates page — implies a comprehensive, organized library. "Peptide Calculator" is a unique tool offering (dosage/reconstitution calculator).

### Product Categories
```
- Reproductive Health Research
- Longevity and Anti-aging Research
- Weight Loss Research
- Sleep Enhancement Research
- Immunity Enhancement Research
- Muscle Growth Research
- Cognitive Enhancement Research
- Healing and Regeneration Research
- Laboratory Equipment
```

**Key pattern:** Similar to Limitless Biotech — categorized by research area rather than compound name. Appends "Research" to every category name. Includes "Laboratory Equipment" as a supplies category.

---

## 8. Element SARMs (elementsarms.com)

### Homepage Structure
- **Hero:** "American Made - Highly Purified Products"
- **Trust strip:** "99%+ Purity Guaranteed", "Same Day Shipping", "Free Shipping over $200", "Delivery Guarantee"

### Navigation Taxonomy
```
- Sarms
- Stacks
- Research Liquids
- Research Peptides
- PDE5 Inhibitors
- Diluents
- GLP-1
```

**Key pattern:** GLP-1 as its own top-level nav item (same as Loti Labs). PDE5 Inhibitors called out separately (same as Peptide Pros). "Research Liquids" as distinct from "Research Peptides" — likely liquid-form non-peptide compounds.

### Products Featured
- SARMs: S4 Andarine, LGD-4033, MK-2866, GW-501516
- Peptides: BPC-157, CJC-1295, Melanotan 2, Semaglutide
- Stacks: Bridge, Cutting, PCT, Triple

---

## Cross-Site UX Pattern Summary

### Homepage Structure Archetype
```
┌──────────────────────────────────────┐
│  Logo + Nav + Search + Phone/Contact │
├──────────────────────────────────────┤
│  HERO: Headline + Trust Claims       │
│  (purity %, USA-made, testing)       │
├──────────────────────────────────────┤
│  TRUST BAR: 3-5 icon+text badges    │
│  (shipping, purity, guarantee, COA) │
├──────────────────────────────────────┤
│  CATEGORY GRID or PRODUCT GRID      │
│  (6-12 cards)                       │
├──────────────────────────────────────┤
│  FEATURED/POPULAR PRODUCTS          │
├──────────────────────────────────────┤
│  BITCOIN/CRYPTO CALLOUT (if offered)│
├──────────────────────────────────────┤
│  FOOTER: Disclaimer + Links + Legal │
└──────────────────────────────────────┘
```

### Navigation Taxonomy Patterns

**Pattern A — By Compound Type (most common):**
SARMs > Peptides > Research Liquids > Diluents > Stacks

**Pattern B — By Research Area (premium positioning):**
Cognitive > Metabolic > Healing > Longevity > Immune > etc.

**Pattern C — Hybrid:**
Top-level compound types, but hot products get own nav items (GLP-1, Reta, Tirz)

### PDP Must-Haves (based on competitor analysis)
1. Product name with both research and common name
2. CAS number, molecular weight, formula
3. Purity percentage
4. COA link/download (PDF)
5. "Research use only" disclaimer
6. Price with bulk discount indicator
7. Related/complementary products
8. Storage instructions

### Checkout Patterns
- **Guest checkout:** Available at most sites
- **Account REQUIRED:** Loti Labs is the strictest — users must create an account and certify they are a "qualified researcher" before they can even browse products. This is the strictest access gate in the competitive set.
- **Account incentive:** Some offer 10-25% off for registration (Peptide Pros: 25%)
- **Age gate:** No site implements a formal age gate popup. Loti Labs' account requirement is the closest equivalent.
- **RUO acknowledgment:** Limitless Biotech has a dedicated "Research Use Acknowledgment" page. Loti Labs builds RUO certification into account creation. No site uses a checkout checkbox.
- **Multi-payment display:** Sites offering crypto show it prominently with discount incentive (Limitless: 10% off crypto, 5% off CashApp/bank; Loti Labs: 2.5% off ACH)

### Unique UX Features Worth Noting
- **Loti Labs — Peptide Calculator:** Reconstitution/dosage calculator tool (lotilabs.com/peptide-calculator/) — unique in the competitive set
- **Loti Labs — VIP Program:** Membership/loyalty program for repeat buyers
- **Loti Labs — Advanced Search:** Dedicated advanced search page beyond basic search bar
- **Limitless Biotech — Dual Taxonomy:** "Shop by Type" AND "Shop by Research Category" — most sophisticated nav
- **Sports Technology Labs — "How To Pay" page:** Dedicated page explaining payment options — reduces checkout friction
- **Swole AF Labs — Experience-Level Taxonomy:** Products categorized as Beginner/Intermediate/Advanced — unique approach
- **Core Peptides — Customizable Orders:** Custom peptide orders as a service offering

### Mobile
- All observed sites are responsive (WordPress/WooCommerce responsive themes)
- Hamburger menu is standard
- Product grids collapse to single column
- None observed with dedicated mobile apps

---

Sources:
- [Limitless Biotech](https://limitlesslifenootropics.com)
- [Sports Technology Labs](https://sportstechnologylabs.com) + [FAQ](https://sportstechnologylabs.com/faqs/)
- [Core Peptides](https://www.corepeptides.com)
- [Peptide Pros](https://www.peptidepros.net)
- [Loti Labs](https://www.lotilabs.com)
- [Direct Peptides](https://directpeptides.com)
- [Particle Peptides](https://particlepeptides.com/en/)
- [Element SARMs](https://www.elementsarms.com)
