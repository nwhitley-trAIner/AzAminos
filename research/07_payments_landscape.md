# 07 — Payments Landscape

> **This is the highest-risk item in the entire build.** If Stripe is a no-go, it changes the whole architecture. Spoiler: Stripe is a no-go.

---

## 1. Stripe's Policy — Definitively Off the Table

### Verbatim from Stripe's Restricted Businesses Page

Stripe's [Prohibited and Restricted Businesses](https://stripe.com/legal/restricted-businesses) list explicitly prohibits:

```
"Pseudo-pharmaceuticals or nutraceuticals that are not safe or make harmful claims"
```

```
"Research chemicals"
— listed under "Illegal weapons, explosives, and dangerous materials"
```

```
"Toxic, flammable, combustible, or radioactive materials"
```

```
"Equipment and items intended to be used for making or using drugs"
```

Additionally, as a restricted (not prohibited) category requiring additional due diligence:

```
"Card-not-present prescription-only products and pharmaceuticals"
```

### Key Finding

**There is no documented exception pathway, "prior written approval" language, or carve-out for legitimate research use** in Stripe's policy for research chemicals. The restriction appears absolute.

### Enforcement Reality

Per [Shopify community reports](https://community.shopify.com/t/stripe-restricted-businesses-list-you-gotta-see-this-list/167773) and [Paycron](https://www.paycron.com/blog/high-risk-merchant-accounts-for-peptide-businesses-in-the-us/):

> "Standard platforms like PayPal, Stripe, and Square routinely shut down peptide accounts once they detect research chemical transactions, and even compliant merchants often lose access without warning."

**Verdict: Stripe, PayPal, and Square are all off the table. Do not attempt.**

Sources:
- [Stripe Restricted Businesses](https://stripe.com/legal/restricted-businesses)
- [Stripe Support — Prohibited & Restricted FAQ](https://support.stripe.com/questions/prohibited-and-restricted-businesses-list-faqs)
- [Wallid.co — Avoiding Shopify Bans for Peptides](https://wallid.co/blog/tpost/37ch13i9e1-how-to-avoid-shopify-account-bans-when-s)
- [PayKings — Stripe Prohibited Businesses](https://paykings.com/blog/stripe-prohibited-businesses/)

---

## 2. What Competitors Actually Use

| Competitor | Payment Methods Observed | Notes |
|-----------|-------------------------|-------|
| **Sports Technology Labs** | Credit cards, e-checks, Zelle, cryptocurrency (10% BTC discount) | Multiple rails; FAQ confirms all four |
| **Peptide Pros** | Credit cards, Bitcoin (Blocknomics) | Partnered with Blocknomics for BTC |
| **Swiss Chems** | Bitcoin, credit cards, Zelle | [How to Buy with Bitcoin guide](https://swisschems.is/how-to-buy-with-bitcoin/) |
| **Pure Rawz** | Crypto, Zelle, Venmo | No traditional credit card visible |
| **Limitless Biotech** | Credit cards, crypto, wire, Apple Pay | Most diverse payment stack observed |
| **Core Peptides** | Credit cards, Venmo, Zelle, crypto | Four payment rails |
| **Next Era Peptide** | BTC, ETH, USDC, USDT only | Crypto-only; "No banks, no card processors, no middlemen" |
| **Felix Chemical Supply** | Credit cards, CashApp, ACH | Includes P2P and bank transfer |
| **Ascension Peptides** | Credit cards, PayPal, Apple Pay, Venmo | PayPal presence is unusual — may be temporary |
| **LVLUP Health** | Credit cards, PayPal, Zip (BNPL) | PayPal + BNPL is uncommon in this space |
| **Peptidology** | Credit cards, bank transfer, crypto | Three rails |

### Pattern Analysis

- **Credit cards** are available at ~80% of vendors — but NOT through Stripe/PayPal/Square. They use high-risk merchant account providers (see Section 3).
- **Cryptocurrency** is accepted by ~70% of vendors. Bitcoin is universal; some offer ETH, USDC, USDT.
- **Zelle / Venmo / CashApp** appear at ~40% of vendors as supplementary P2P options.
- **E-check / ACH** is growing as a lower-fee alternative to credit cards.
- **Wire transfer** appears at enterprise/wholesale-tier vendors.
- **BNPL (Buy Now Pay Later)** is rare — only LVLUP Health observed with Zip.

---

## 3. High-Risk Merchant Account Providers

These are the processors that actually serve the peptide vertical. Data compiled from [onPoint Studio](https://onpoint.to/10-peptide-store-payment-gateways/), [Paycron](https://www.paycron.com/blog/high-risk-merchant-accounts-for-peptide-businesses-in-the-us/), [VERIFIED](https://verifiedcreditcardprocessing.com/research-peptides-guide/), and [Instabill](https://instabill.com/ecommerce-industries/peptides-merchant-accounts/).

### Tier 1: Peptide-Specialized Processors

| Provider | Type | Fees | WooCommerce? | Key Details |
|----------|------|------|-------------|-------------|
| **PeptiPay** | Peptide-specific processor | Varies | Yes (free plugin) | Purpose-built for peptide merchants. No LegitScript requirement. Underwriting tuned for research-only compliance framing. |
| **Corepay** | High-risk processor | Competitive | Via gateway partner | 24-72 hour pre-approval. Supports GLP-1s, semaglutides, retatrutides. Offshore account options. Fast funding, lower reserves. |
| **AllayPay** | High-risk processor | Varies | Via Authorize.net/NMI/FluidPay | Domestic US accounts for RUO peptide startups. eCheck processing. Rolling reserves ~10%, released after 3-6 months clean history. |

### Tier 2: General High-Risk Processors

| Provider | Type | Fees | WooCommerce? | Key Details |
|----------|------|------|-------------|-------------|
| **Easy Pay Direct** | High-risk processor | Varies | Via Authorize.net/NMI | Requires LegitScript certification. Offers 50% discount on LegitScript through partnership. Focused on long-term stability. |
| **PayFirmly** | High-risk processor | Varies | Via gateway partner | Smart routing auto-directs transactions to highest-approval processors. Multi-currency. Built for cross-border. |
| **Truevo** | EU-based acquirer + gateway | 2-6% per transaction | Yes (free plugin) | Licensed PSP. 150+ currencies, EUR/GBP/USD settlements. Next-day settlement. PCI DSS Level 1. |
| **VERIFIED (Verified-Pay)** | Broker + crypto hybrid | 4% flat (crypto path) | Yes | Matches merchants to peptide-friendly banks. "VERIFIED Crypto Checkout" routes card → USDC → wallet. |

### Tier 3: Gateway / ACH Specialists

| Provider | Type | Fees | WooCommerce? | Key Details |
|----------|------|------|-------------|-------------|
| **Authorize.net** | Gateway (via high-risk provider) | Varies by provider | Yes (official plugin) | Stable, well-documented. Available via AllayPay, Soar Payments, Durango. Supports CC, ACH, eCheck. |
| **Paycron** | eCheck/ACH only | Lower than CC rates | Yes | Claims 99% approval for peptide merchants. No credit card processing. Lower chargebacks than cards. |

### Additional Processors Mentioned Across Sources

From [VERIFIED guide](https://verifiedcreditcardprocessing.com/research-peptides-guide/): Payment Cloud, Maverick Payments, High Wire Payments, Beacon Payments, PayCompass, PayBright, North, PayArc, EMS/Kurv

### Fee Structure Reality

Exact fee numbers are closely guarded, but the pattern is:
- **Processing rate:** 3-6% per transaction (vs. Stripe's 2.9% + $0.30)
- **Monthly fees:** $25-$100/month gateway + account fees
- **Rolling reserve:** 5-10% of volume held for 3-6 months
- **Setup fees:** $0-$500 depending on provider
- **Chargeback fees:** $25-$100 per incident
- **Annual fees:** Some providers charge $100-$500/year

---

## 4. LegitScript Certification — The New Gatekeeper

LegitScript is becoming mandatory for the peptide vertical. Key details from [LegitScript](https://www.legitscript.com/high-risk-and-problematic-products/the-growing-risk-of-peptides-what-online-platforms-and-payment-processors-need-to-know/), [BabyBoomer.org](https://babyboomer.org/contributors/allen-kopelman/peptide-payments-legitscriptthe-path-to-merchant-account-compliance/), and [Corepay](https://corepay.net/articles/legitscript-certification-guide/):

- **Cost:** Registration fees $500-$950, plus $0.10/transaction + 10 bps on volume
- **Timeline:** Standard review 6-8 weeks; fast-tracked to ~1 week via processor partnerships
- **Requirement:** Google, Facebook, and Bing require LegitScript for peptide ads
- **NOT required** for research-only ecommerce (per VERIFIED guide) — but increasingly expected by payment processors
- **Required** for clinical, telehealth, and in-person healthcare models

**2025-2026 Industry Shift:** The peptide industry is moving toward a prescription-based model to satisfy FDA and card network requirements.

---

## 5. Crypto Payment Rails

### Gateway Comparison

| Gateway | Fees | Coins Supported | Self-Hosted? | WooCommerce? | Key Advantage |
|---------|------|----------------|--------------|-------------|---------------|
| **Coinbase Commerce** | Network fees only (0%) | BTC, ETH, USDC, USDT + others | No | Yes (free plugin) | Zero processing fees. Transitioning to Coinbase Business (March 2026 deadline). |
| **BTCPay Server** | Zero fees | BTC only | Yes (fully) | Yes | Completely free, self-hosted, no middleman. Best for BTC-focused. |
| **NOWPayments** | 0.5% (single currency), 1% (auto-convert) | 200+ tokens | No | Yes | Most coin options. Auto-conversion between tokens. |
| **BitPay** | 1% | BTC, ETH, stablecoins | No | Yes | Fiat settlement (daily bank deposits). Most "Stripe-like" crypto experience. |

Sources: [CoinCodex — 7 Best Crypto Payment Gateways 2026](https://coincodex.com/article/39025/best-crypto-payment-gateways/), [Aurpay — Crypto Gateway Comparison 2026](https://aurpay.net/aurspace/crypto-payment-gateway-comparison-2026/)

### Why Crypto Matters for This Vertical

Per [SeamlessChex](https://www.seamlesschex.com/blog/alternative-payment-methods-for-peptide-sellers):

> "Crypto payments eliminate chargebacks entirely (transactions are irreversible), require no merchant account approval, and work regardless of how banks classify products."

Competitors offering crypto discounts (Sports Technology Labs: 10% off for BTC) confirms this is a margin play — crypto saves the merchant 3-6% in processing fees, and they pass part of that saving to the customer.

---

## 6. Compliance Red Flags — Approval Killers

From [VERIFIED guide](https://verifiedcreditcardprocessing.com/research-peptides-guide/), the following will get a merchant account application denied:

- Human-use language anywhere on the site
- Wellness/performance promises
- Dosing instructions for people (not "research protocols")
- Testimonials implying personal use
- Missing refund/shipping policies
- Unclear sourcing documentation
- No COAs or assay data
- Inconsistent disclaimers (RUO on some pages, absent on others)

What processors WANT to see:
- Clear "For Research Purposes Only" and "Not for Human Consumption" language
- Certificates of Analysis verifying purity and assay data
- Professional product pages resembling scientific listings
- Clear refund/shipping policies
- Consistent research-only disclaimers across checkout

---

## 7. Recommended Payment Stack

### Primary Architecture: Three Simultaneous Payment Rails

Per [onPoint Studio's recommendation](https://onpoint.to/10-peptide-store-payment-gateways/), configure **three simultaneous payment methods** for resilience:

```
┌─────────────────────────────────────────────────┐
│                 CHECKOUT PAGE                     │
├─────────────────┬───────────────┬───────────────┤
│   RAIL 1 (CC)   │  RAIL 2 (CC)  │  RAIL 3       │
│   Primary HRP   │  Backup HRP   │  Crypto/ACH   │
│                 │  (hot standby) │               │
│  PeptiPay or    │  AllayPay or   │  Coinbase     │
│  Corepay via    │  Truevo via    │  Commerce +   │
│  Authorize.net  │  NMI/FluidPay  │  Paycron ACH  │
└─────────────────┴───────────────┴───────────────┘
```

### Recommended Stack (in priority order)

1. **Primary CC processor:** PeptiPay or Corepay
   - No LegitScript required for RUO model
   - Fast approval (24-72 hours for Corepay)
   - WooCommerce integration available

2. **Backup CC processor:** AllayPay or Truevo
   - Pre-configured as hot standby
   - Minute-level failover if primary terminates
   - Different acquiring bank for redundancy

3. **Crypto:** Coinbase Commerce (or BTCPay Server if you want self-hosted)
   - Zero processing fees
   - Zero chargebacks
   - Offer 5-10% discount to incentivize crypto payment
   - Supports BTC, ETH, USDC, USDT

4. **ACH/eCheck:** Paycron
   - Lower fees than credit cards
   - 99% approval rate for peptide merchants
   - Good for repeat customers comfortable with bank transfers

5. **P2P (optional):** Zelle / Venmo / CashApp
   - Manual reconciliation required
   - No API integration
   - Use only as last-resort fallback

### What This Means for the Build

- **Cannot use Shopify Payments, Stripe, PayPal, or Square** — must use a platform that supports custom payment gateway integration
- **WooCommerce (WordPress)** has the deepest ecosystem of high-risk processor plugins
- **Headless commerce (Medusa, Saleor, Vendure)** can integrate via Authorize.net or custom gateway APIs
- **Must implement multi-gateway failover logic** — this is not standard in most commerce platforms
- **Crypto checkout UX must be first-class**, not an afterthought — it may be 30-50% of transactions

---

Sources:
- [Stripe — Restricted Businesses](https://stripe.com/legal/restricted-businesses)
- [onPoint Studio — 10 Peptide Payment Gateways](https://onpoint.to/10-peptide-store-payment-gateways/)
- [VERIFIED — Research Peptides CC Processing Guide](https://verifiedcreditcardprocessing.com/research-peptides-guide/)
- [Paycron — High-Risk Merchant Accounts for Peptides](https://www.paycron.com/blog/high-risk-merchant-accounts-for-peptide-businesses-in-the-us/)
- [Instabill — Peptides Merchant Accounts](https://instabill.com/ecommerce-industries/peptides-merchant-accounts/)
- [SeamlessChex — Alternative Payment Methods for Peptides](https://www.seamlesschex.com/blog/alternative-payment-methods-for-peptide-sellers)
- [SanctusPay — CC Payments for Peptides](https://sanctuspay.com/can-you-accept-credit-card-payments-for-peptides-heres-what-you-need-to-know/)
- [LegitScript — Growing Risk of Peptides](https://www.legitscript.com/high-risk-and-problematic-products/the-growing-risk-of-peptides-what-online-platforms-and-payment-processors-need-to-know/)
- [CoinCodex — Best Crypto Payment Gateways 2026](https://coincodex.com/article/39025/best-crypto-payment-gateways/)
- [Aurpay — Crypto Payment Gateway Comparison 2026](https://aurpay.net/aurspace/crypto-payment-gateway-comparison-2026/)
