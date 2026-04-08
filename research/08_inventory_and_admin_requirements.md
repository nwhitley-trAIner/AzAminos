# 08 — Inventory & Admin Requirements

> Admin dashboard and inventory system spec, based on competitor analysis and vertical-specific needs.

---

## 1. Product CRUD Requirements

### Product Fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Name | string | Yes | Both research name and common name (e.g., "BPC-157 (Body Protection Compound-157)") |
| SKU | string | Yes | Unique. Format: `{CATEGORY}-{COMPOUND}-{DOSAGE}-{FORM}` e.g., `HEA-BPC157-5MG-VIA` |
| Category | enum/relation | Yes | Maps to taxonomy (GLP-1, Healing, GH, SARMs, Nootropic, Anti-Aging, Specialty, Stacks, Supplies) |
| Description | rich text | Yes | Supports markdown/HTML for scientific formatting |
| Short description | text | Yes | For product cards and search results |
| CAS Number | string | No | Chemical Abstracts Service number |
| Molecular Weight | string | No | e.g., "1419.53 g/mol" |
| Molecular Formula | string | No | e.g., "C62H98N16O22" |
| Sequence | text | No | Amino acid sequence for peptides |
| Purity | string | Yes | e.g., "≥99%" — displayed prominently |
| Dosage/Size | string | Yes | e.g., "5mg", "10mg/mL 30mL" |
| Form | enum | Yes | Lyophilized powder, Liquid, Capsule, Nasal spray, Cream, Tablet |
| Images | file[] | Yes | Multiple images; primary + gallery. White-background product photography. |
| COA PDF | file | Yes | Certificate of Analysis — PDF upload per batch |
| COA Lab Name | string | No | Name of testing laboratory |
| COA Date | date | No | Date of analysis |
| Price | decimal | Yes | Base price |
| Compare-at Price | decimal | No | Strike-through price for sales |
| Bulk pricing tiers | JSON | No | e.g., `[{qty: 3, price: 52.99}, {qty: 5, price: 49.99}]` |
| Weight (shipping) | decimal | Yes | For shipping calculations |
| Batch/Lot Number | string | Yes | Current batch on sale |
| Storage Instructions | text | No | e.g., "Store at -20°C, protect from light" |
| Shelf Life | string | No | e.g., "24 months from manufacture" |
| Related Products | relation[] | No | Cross-sell / complementary products |
| Tags | string[] | No | For search and filtering |
| Status | enum | Yes | Draft, Active, Out of Stock, Discontinued |
| RUO Disclaimer | text | Yes | Pre-filled default, editable per product |

### Product Variants

Some products need size variants (5mg vs 10mg) with different prices and stock levels. The system must support:
- Per-variant pricing
- Per-variant inventory tracking
- Per-variant SKU
- Shared description/images across variants

---

## 2. Inventory Management

### Hard Stock Enforcement — Critical Requirement

Products at 0 stock **MUST** be unpurchasable. This is non-negotiable for this vertical (you can't sell what you don't have — peptides are physical goods with specific batch numbers).

### Race-Condition-Safe Stock Decrement Patterns

| Pattern | How It Works | Pros | Cons | Recommendation |
|---------|-------------|------|------|----------------|
| **Optimistic Locking (version column)** | Each row has a `version` int. UPDATE sets `stock = stock - 1 WHERE id = X AND version = Y`. If 0 rows affected, retry. | Simple, no blocking | Retry overhead under contention | Good for moderate traffic |
| **Pessimistic Locking (SELECT FOR UPDATE)** | Lock the row during checkout: `SELECT stock FROM products WHERE id = X FOR UPDATE`. Check > 0, then decrement. | Guarantees correctness | Blocks concurrent reads; deadlock risk | Not recommended for web |
| **Atomic Decrement** | `UPDATE products SET stock = stock - 1 WHERE id = X AND stock > 0`. Check affected rows = 1. | Simple, fast, no locks | Hard to extend to multi-item carts | **Best for single-item** |
| **Reservation with TTL** | On "add to cart" or checkout start, create a reservation (stock_reservations table) with 15-min TTL. Background job releases expired reservations. | Best UX (holds item while user checks out) | Complexity; background job required | **Best for multi-item carts** |
| **Queue-based** | All stock decrements go through a FIFO queue (Redis/SQS). Single consumer processes sequentially. | Zero contention | Latency; single point of failure | Over-engineered for this scale |

**Recommended approach for AzAminos:**

```sql
-- Atomic decrement at checkout (within a transaction):
BEGIN;

-- For each item in cart:
UPDATE product_variants 
SET stock = stock - :qty 
WHERE id = :variant_id 
AND stock >= :qty;

-- Check affected rows = 1; if 0, abort with "out of stock" error
-- If all items succeed:
INSERT INTO orders (...) VALUES (...);

COMMIT;
```

Combined with a **reservation TTL** for the checkout flow:
- When user clicks "checkout," reserve stock for 15 minutes
- If checkout completes, convert reservation to order
- If checkout abandoned, background cron releases reservation
- Display "X left in stock" on product page (real stock minus active reservations)

### Inventory Features

| Feature | Priority | Notes |
|---------|----------|-------|
| Real-time stock levels | P0 | Decremented atomically at checkout |
| Low-stock alerts | P0 | Email/Slack notification when stock hits configurable threshold (e.g., 10 units) |
| Out-of-stock auto-unpublish | P0 | Product becomes unpurchasable; optional "notify me" email capture |
| Batch/lot tracking | P0 | Each product has a batch number; COA is per-batch |
| Bulk CSV import | P1 | Upload CSV to create/update products in bulk (name, sku, price, stock, batch) |
| Bulk CSV export | P1 | Export current inventory for accounting/reconciliation |
| Stock history log | P1 | Audit trail: who changed stock, when, by how much, why |
| Restock workflow | P1 | "Restock" action: enter new batch number, new stock qty, upload new COA |
| Multi-warehouse | P2 | Future: support multiple fulfillment locations |
| Expiry tracking | P2 | Alert when batch approaches shelf life expiry |

---

## 3. Order Management

### Order States

```
┌─────────┐     ┌───────────┐     ┌────────────┐     ┌──────────┐     ┌───────────┐
│ Pending  │────▶│ Confirmed │────▶│ Processing │────▶│ Shipped  │────▶│ Delivered │
└─────────┘     └───────────┘     └────────────┘     └──────────┘     └───────────┘
     │                                   │                                    │
     │ payment failed                    │ out of stock                       │
     ▼                                   ▼                                   ▼
┌─────────┐                     ┌────────────┐                      ┌───────────┐
│ Failed  │                     │ Backorder  │                      │ Completed │
└─────────┘                     └────────────┘                      └───────────┘
                                                                         │
                                                                         ▼
                                                                   ┌───────────┐
                                                                   │ Refunded  │
                                                                   └───────────┘
```

### Order Fields

| Field | Notes |
|-------|-------|
| Order number | Auto-incrementing, prefixed (e.g., AZ-10001) |
| Customer info | Name, email, shipping address, billing address |
| Line items | Product, variant, quantity, unit price, subtotal |
| Payment status | Pending, Authorized, Captured, Failed, Refunded |
| Payment method | Which rail (CC processor name, crypto tx hash, ACH ref) |
| Shipping method | Carrier + service level |
| Tracking number | From shipping label integration |
| RUO acknowledgment | Timestamp of disclaimer acceptance |
| Notes (internal) | Staff notes for fulfillment |
| Timeline | Audit log of all state changes with timestamps and actor |

---

## 4. Fulfillment & Shipping Integration

### Shipping Label Providers

| Provider | Pros | Cons | Pricing | Recommendation |
|----------|------|------|---------|----------------|
| **Shippo** | Multi-carrier (USPS, UPS, FedEx, DHL); REST API; pay-per-label; WooCommerce plugin | Less feature-rich than EasyPost for complex routing | Pay per label; no monthly fee for basic | **Best for startups** |
| **EasyPost** | Most carriers; insurance built-in; address verification; batch shipping | Higher volume minimums; more complex API | Free tier available; enterprise pricing at scale | Best for scale |
| **Pirate Ship** | Cheapest USPS/UPS rates (commercial pricing); simple UI | Limited API; primarily manual; USPS/UPS only | Free software; pay per label at discounted rates | **Best for bootstrapped** |
| **ShipStation** | Full order management; 100+ carrier integrations; automation rules | Monthly subscription ($9.99+); can be overkill | $9.99-$229.99/month | Best for high volume |

**Recommendation:** Start with **Pirate Ship** for cheapest rates and manual label printing. Move to **Shippo** API integration when order volume justifies automation (>50 orders/week).

### Packaging Requirements (Vertical-Specific)
- **Temperature control:** Cold packs for peptides during summer months
- **Discreet packaging:** No external branding indicating contents (per competitor standard: "Fast and Discreet Shipping")
- **Padding:** Vials are fragile — bubble wrap or foam inserts required
- **Packing slip:** Include batch/lot number matching the product label

---

## 5. Admin Authentication & Access Control

### Requirements

| Feature | Priority | Notes |
|---------|----------|-------|
| 2FA mandatory | P0 | TOTP (Google Authenticator / Authy). No SMS fallback (SIM-swap vulnerable). |
| IP allowlist | P0 | Admin panel only accessible from pre-approved IPs |
| Audit log | P0 | Every action logged: who, what, when, from where (IP), old value, new value |
| Session timeout | P0 | 30-minute inactivity timeout; 8-hour absolute timeout |
| Role-based access | P0 | See roles below |
| Login attempt limiting | P0 | 5 failed attempts → 15-min lockout → email alert to owner |
| Password policy | P1 | Min 12 chars, must use password manager (no common passwords) |

### Role Separation

| Role | Permissions | Use Case |
|------|------------|----------|
| **Owner** | Full access: products, orders, users, settings, financial data, audit logs | Business owner |
| **Admin** | Products, orders, inventory, COA uploads. No user management or financial settings. | Operations manager |
| **Fulfillment** | View orders, update order status, print labels, add tracking numbers. No product/price editing. | Warehouse staff |
| **Read-only** | View products, orders, analytics. No edit capability. | Accountant, advisor |

---

## 6. Build vs. Buy Recommendation

### Option A: Headless Commerce (Medusa.js) — RECOMMENDED

**Medusa.js** is the strongest fit for this vertical. Justification:

| Factor | Medusa | Saleor | Vendure | WooCommerce |
|--------|--------|--------|---------|-------------|
| **Language** | TypeScript/Node.js | Python/Django | TypeScript/NestJS | PHP |
| **Frontend** | Next.js (official starter) | Next.js (official starter) | No official Next.js starter | WordPress themes |
| **Payment flexibility** | Custom payment modules; easy to add multiple gateways | GraphQL-based payment plugins | Payment integration via plugins | Deepest ecosystem of high-risk processor plugins |
| **Self-hosted** | Yes (full control) | Yes | Yes | Yes |
| **Custom fields** | Extensible product model | Attribute system | Custom fields via config | ACF/meta fields |
| **GitHub stars** | 30,970 (33% monthly growth) | 22,215 (2.1% growth) | Lower | N/A |
| **Pricing** | Free self-hosted; $29/mo cloud | Free self-hosted; $159/mo cloud (GMV fees) | Free self-hosted | Free; hosting costs |
| **API** | REST + custom | GraphQL | GraphQL | REST (WP REST API) |
| **COA/PDF upload** | Custom module (straightforward) | Custom via attributes | Custom module | Media library + ACF |
| **Multi-gateway failover** | Must build (plugin architecture supports it) | Must build | Must build | Plugins exist (onPoint recommends this) |

**Why Medusa wins:**
1. **TypeScript end-to-end** — same language for frontend (Next.js) and backend
2. **Modular architecture** — custom payment providers, product extensions, and workflow modules without forking core
3. **No GMV fees** — unlike Saleor's cloud offering
4. **Strongest community momentum** — 33% monthly growth in 2026
5. **"You own every line of code, every database row, and every API endpoint"** — per [MedusaJS comparison](https://www.linearloop.io/blog/medusa-js-vs-saleor-vs-vendure)

**Why NOT WooCommerce despite best plugin ecosystem:**
- PHP codebase when the team prefers TypeScript
- WordPress security surface area is larger
- Harder to build a fully custom, premium frontend
- However: WooCommerce has the most battle-tested high-risk payment integrations. If payment integration ease is the #1 priority, WooCommerce is the pragmatic choice.

**Decision needed:** If the founding team is comfortable with TypeScript/Next.js, go Medusa. If speed-to-market and payment plugin availability matter more, consider WooCommerce as a pragmatic alternative.

### Option B: WooCommerce — PRAGMATIC ALTERNATIVE

If payment processor integration is the bottleneck, WooCommerce has ready-made plugins for:
- PeptiPay (free WooCommerce plugin)
- Truevo (free WooCommerce plugin)
- VERIFIED Crypto Checkout
- Authorize.net (official WooCommerce plugin)
- Coinbase Commerce (free WooCommerce plugin)
- Paycron eCheck (WooCommerce plugin)

This is the path of least resistance for payments but trades off frontend quality and developer experience.

### Option C: Fully Custom (Next.js + Postgres + Prisma) — NOT RECOMMENDED FOR V1

Building from scratch gives maximum control but:
- 3-6 months longer to launch
- Must build cart, checkout, order management, inventory from zero
- No reason to reinvent commerce primitives when Medusa provides them

Save custom-build for V2 if Medusa proves limiting (unlikely for this scale).

---

Sources:
- [LinearLoop — Medusa vs Saleor vs Vendure](https://www.linearloop.io/blog/medusa-js-vs-saleor-vs-vendure)
- [Netguru — Saleor vs Medusa](https://www.netguru.com/blog/saleor-vs-medusa)
- [PkgPulse — Medusa vs Saleor vs Vendure 2026](https://www.pkgpulse.com/blog/medusa-vs-saleor-vs-vendure-headless-ecommerce-2026)
- [GitHub — MedusaJS Discussion #5136](https://github.com/medusajs/medusa/discussions/5136)
- [onPoint Studio — 10 Peptide Payment Gateways](https://onpoint.to/10-peptide-store-payment-gateways/)
- [Convesio — Peptide Website Hosting](https://convesio.com/peptide-website-hosting/)
