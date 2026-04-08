# 10 — Tech Stack Recommendation

> Synthesized from files 01-09. Concrete recommended stack with alternatives.

---

## Recommended Stack

| Layer | Primary Choice | Alternative | Justification |
|-------|---------------|-------------|---------------|
| **Frontend** | Next.js 14+ (App Router) | Remix | SSR/SSG, React ecosystem, Medusa has official Next.js starter |
| **Commerce Engine** | Medusa.js v2 | WooCommerce (if payment plugins are blockers) | TypeScript, modular, self-hosted, no GMV fees, strongest momentum |
| **Database** | PostgreSQL 16 | - | Medusa's default; ACID compliant; row-level locking for stock enforcement |
| **Cache / Sessions** | Redis | - | Session store, rate limiting, cart reservation TTLs |
| **Hosting (App)** | Railway or Render | AWS ECS, DigitalOcean App Platform | Easy deploys, auto-scaling, affordable for early stage |
| **Hosting (Frontend)** | Vercel | Cloudflare Pages | Optimal for Next.js; edge functions; preview deploys |
| **CDN / WAF** | Cloudflare Pro ($20/mo) | - | DDoS protection, WAF, bot management, SSL, DNS |
| **Primary Payment** | PeptiPay or Corepay (via Authorize.net) | AllayPay, Truevo | Peptide-specialized high-risk processor; fast approval |
| **Backup Payment** | AllayPay or Truevo | Easy Pay Direct | Different acquiring bank for redundancy |
| **Crypto Payment** | Coinbase Commerce | BTCPay Server (self-hosted) | Zero processing fees; BTC/ETH/USDC/USDT; WooCommerce + custom Medusa module |
| **ACH/eCheck** | Paycron | - | 99% approval for peptide merchants; lower fees than CC |
| **CMS (Content)** | Medusa's built-in content or Sanity.io | Contentful, Strapi | Blog, educational content, shipping/returns policies |
| **Email (Transactional)** | Resend | Postmark, SendGrid | Modern API, React email templates, great DX |
| **Email (Marketing)** | Loops or Resend Audiences | Mailchimp, ConvertKit | Segmentation, drip campaigns, product launch announcements |
| **Analytics** | Plausible or PostHog | Google Analytics 4 | Privacy-friendly (no cookie banner needed); PostHog for product analytics |
| **Error Monitoring** | Sentry | - | Real-time error tracking, performance monitoring, source maps |
| **Uptime Monitoring** | BetterUptime or UptimeRobot | - | Alert on downtime; status page for customers |
| **CI/CD** | GitHub Actions | - | Test, lint, build, deploy on push; Dependabot for dependency updates |
| **Secret Management** | Doppler or Infisical | Railway env vars (basic) | Centralized secrets; team access control; rotation |
| **File Storage** | Cloudflare R2 or AWS S3 | - | COA PDFs, product images; R2 has zero egress fees |
| **Search** | Meilisearch | Algolia, Typesense | Self-hosted, fast, typo-tolerant; free for self-hosted |

---

## Architecture Diagram

```mermaid
graph TB
    subgraph "User Facing"
        Browser["Browser / Mobile"]
    end

    subgraph "Edge Layer"
        CF["Cloudflare<br/>WAF + DDoS + CDN + SSL"]
    end

    subgraph "Frontend — Vercel"
        Next["Next.js 14+<br/>App Router<br/>Server Components"]
    end

    subgraph "Backend — Railway"
        Medusa["Medusa.js v2<br/>Commerce Engine<br/>REST API"]
        Workers["Background Workers<br/>- Cart TTL cleanup<br/>- Low-stock alerts<br/>- Order webhooks"]
    end

    subgraph "Data Layer"
        PG["PostgreSQL 16<br/>- Products<br/>- Orders<br/>- Inventory<br/>- Audit Logs"]
        Redis["Redis<br/>- Sessions<br/>- Rate Limits<br/>- Cart Reservations"]
        R2["Cloudflare R2<br/>- Product Images<br/>- COA PDFs"]
    end

    subgraph "Payment Rails"
        HRP1["Primary CC<br/>PeptiPay / Corepay<br/>(via Authorize.net)"]
        HRP2["Backup CC<br/>AllayPay / Truevo"]
        Crypto["Coinbase Commerce<br/>BTC, ETH, USDC, USDT"]
        ACH["Paycron<br/>eCheck / ACH"]
    end

    subgraph "Services"
        Email["Resend<br/>Transactional Email"]
        Search["Meilisearch<br/>Product Search"]
        Sentry["Sentry<br/>Error Monitoring"]
        Analytics["Plausible / PostHog<br/>Analytics"]
        Shipping["Shippo / Pirate Ship<br/>Labels + Tracking"]
    end

    subgraph "Admin"
        Admin["Admin Panel<br/>Next.js<br/>IP Allowlisted<br/>2FA Required"]
    end

    Browser --> CF
    CF --> Next
    CF --> Admin
    Next --> Medusa
    Admin --> Medusa
    Medusa --> PG
    Medusa --> Redis
    Medusa --> R2
    Medusa --> HRP1
    Medusa --> HRP2
    Medusa --> Crypto
    Medusa --> ACH
    Medusa --> Email
    Medusa --> Shipping
    Workers --> PG
    Workers --> Redis
    Workers --> Email
    Next --> Search
    Next --> Analytics
    Next --> Sentry
```

---

## Cost Estimates (Monthly, at Launch Scale)

| Service | Plan | Monthly Cost |
|---------|------|-------------|
| Vercel | Pro | $20 |
| Railway (Medusa + Workers + PG + Redis) | Usage-based | $20-50 |
| Cloudflare Pro | Pro | $20 |
| Meilisearch (self-hosted on Railway) | Included in Railway | $0 |
| Resend | Pro | $20 |
| Sentry | Team | $26 |
| Plausible | Growth | $9 |
| Cloudflare R2 | Pay-as-you-go | $5-10 |
| Domain + DNS | Annual | ~$2/mo |
| **Total infrastructure** | | **~$120-160/mo** |
| | | |
| PeptiPay / Corepay | Per-transaction | 3-6% of revenue |
| Coinbase Commerce | Network fees only | ~0% |
| Paycron ACH | Per-transaction | ~1% |
| Shipping labels (Pirate Ship) | Per-label | ~$4-8/order |
| LegitScript (if needed later) | Annual | $950 + per-tx |

**Note:** This is pre-revenue infrastructure cost. The payment processing percentages are the real cost center — at $50K/mo revenue, expect $1,500-3,000/mo in processing fees.

---

## Why Not [X]?

| Rejected Option | Why |
|----------------|-----|
| **Shopify** | Shopify Payments = Stripe = prohibited for peptides. Third-party payment apps are limited. Shopify may also ban the store. |
| **Stripe** | Explicitly lists "research chemicals" as prohibited. See file 07. |
| **PayPal / Square** | Same restrictions as Stripe. Will shut down peptide accounts. |
| **Saleor** | Python/Django when team prefers TypeScript. $159/mo cloud with GMV fees. Lower momentum. |
| **Vendure** | No official Next.js starter. NestJS-based (heavier). Smaller community. |
| **Fully Custom** | 3-6 month time penalty. Commerce primitives (cart, checkout, inventory) already solved by Medusa. |
| **BigCommerce / Magento** | Monolithic; poor DX; payment restrictions similar to Shopify. |
| **Static site + Snipcart** | Too simple for inventory management, batch tracking, multi-gateway failover needs. |

---

## Implementation Priority (Phased)

### Phase 1: MVP (Weeks 1-6)
- Medusa v2 setup with PostgreSQL on Railway
- Next.js storefront on Vercel
- Product catalog with COA uploads
- Single payment gateway (PeptiPay or Corepay)
- Coinbase Commerce for crypto
- Basic admin (Medusa admin dashboard)
- Cloudflare for CDN/WAF
- Order email confirmations via Resend
- Manual shipping labels (Pirate Ship)

### Phase 2: Hardening (Weeks 7-10)
- Backup payment gateway (AllayPay/Truevo)
- Multi-gateway failover logic
- Paycron ACH integration
- Meilisearch for product search
- Stock reservation system (TTL-based)
- Admin IP allowlist + audit logging
- Sentry error monitoring
- RUO acknowledgment logging

### Phase 3: Growth (Weeks 11-16)
- Customer accounts with order history
- Low-stock alerts + restock workflow
- Bulk CSV import/export
- Blog / educational content via CMS
- Marketing email sequences (Loops/Resend)
- PostHog product analytics
- Shipping label automation (Shippo API)
- Review system (Judge.me or custom)

### Phase 4: Scale (Post-launch)
- LegitScript certification (if pursuing Google/Facebook ads)
- International shipping + multi-currency
- Subscription/auto-ship for repeat buyers
- Referral program
- Wholesale portal
- Mobile app (React Native or PWA)

---

Sources:
- [LinearLoop — Medusa vs Saleor vs Vendure](https://www.linearloop.io/blog/medusa-js-vs-saleor-vs-vendure)
- [PkgPulse — Headless E-Commerce 2026](https://www.pkgpulse.com/blog/medusa-vs-saleor-vs-vendure-headless-ecommerce-2026)
- [GitHub — MedusaJS](https://github.com/medusajs/medusa)
- [onPoint — 10 Peptide Payment Gateways](https://onpoint.to/10-peptide-store-payment-gateways/)
- [Convesio — Peptide Website Hosting](https://convesio.com/peptide-website-hosting/)
- [DesignRevision — Best Next.js Ecommerce Templates 2026](https://designrevision.com/blog/best-nextjs-ecommerce-templates)
- All research files 01-09
