# 09 — Security Model

> "Impenetrable" is the stated goal. This document maps the actual threat model, controls per threat, data minimization strategy, and compliance checklist.

---

## 1. Threat Model

| # | Threat | Likelihood | Impact | Risk | Description |
|---|--------|-----------|--------|------|-------------|
| T1 | **Card fraud / stolen cards** | High | High | Critical | Research chemicals are high-value, shippable goods — prime target for card testing and fraud rings |
| T2 | **Chargeback abuse** | High | High | Critical | Customers claiming non-receipt or unauthorized purchase. Industry chargeback rates are elevated. |
| T3 | **Account takeover (customer)** | Medium | Medium | High | Credential stuffing to access saved payment methods or order history |
| T4 | **Admin compromise** | Low | Critical | Critical | If admin is compromised, attacker controls inventory, pricing, orders, customer data |
| T5 | **Inventory manipulation** | Low | High | High | Changing stock levels, prices, or batch numbers via admin or API exploit |
| T6 | **SQLi on product/search pages** | Low | Critical | High | Product descriptions, search queries, and filter parameters as injection vectors |
| T7 | **XSS on PDPs** | Medium | Medium | Medium | User-generated content (reviews, if added) or admin-entered product descriptions |
| T8 | **Bot scraping / price scraping** | High | Low | Medium | Competitors scraping catalog, pricing, and stock levels |
| T9 | **Credential stuffing** | High | Medium | High | Automated login attempts using breach databases |
| T10 | **DDoS** | Medium | High | High | Volumetric or application-layer attack taking site offline |
| T11 | **Payment data theft** | Low | Critical | Critical | Interception or storage of card numbers |
| T12 | **Supply chain attack (dependencies)** | Low | High | Medium | Malicious npm package or compromised dependency |
| T13 | **Email/phishing impersonation** | Medium | Medium | Medium | Fake order confirmations, phishing for customer credentials |

---

## 2. Controls Per Threat

### T1: Card Fraud

| Control | Implementation | Priority |
|---------|---------------|----------|
| **AVS (Address Verification)** | Required by payment processor — ensure billing address matches card | P0 |
| **CVV required** | Always require CVV; never store it | P0 |
| **3D Secure (3DS)** | Enable via payment processor (Authorize.net supports this) | P0 |
| **Velocity checks** | Max 3 orders per email per 24 hours; max 2 payment attempts per card per hour | P0 |
| **High-risk order flags** | Flag orders where billing ≠ shipping, first-time buyers with >$300 orders, international cards on domestic shipping | P1 |
| **Manual review queue** | Orders flagged by risk rules go to manual review before fulfillment | P1 |
| **Device fingerprinting** | Use processor's fraud tools or Fingerprint.js to detect suspicious devices | P2 |

### T2: Chargeback Abuse

| Control | Implementation | Priority |
|---------|---------------|----------|
| **Clear billing descriptor** | "AZAMINOS" or similar recognizable name on card statement | P0 |
| **Order confirmation emails** | Immediate confirmation with order details, shipping policy, refund policy | P0 |
| **Tracking numbers on all orders** | Proof of delivery is the #1 chargeback defense | P0 |
| **Delivery confirmation / signature** | Required for orders >$200 (competitors use $500 threshold) | P0 |
| **RUO acknowledgment logging** | Log timestamp + IP of research-use-only checkbox acceptance | P0 |
| **Chargeback alert service** | Ethoca/Verifi alert services to catch chargebacks early and offer refunds before they escalate | P1 |

### T3 + T9: Account Takeover / Credential Stuffing

| Control | Implementation | Priority |
|---------|---------------|----------|
| **Rate limiting on login** | 5 attempts per 15 minutes per IP; exponential backoff | P0 |
| **CAPTCHA on login** | Cloudflare Turnstile (privacy-friendly) after 3 failed attempts | P0 |
| **Breach detection** | Check passwords against HaveIBeenPwned API on registration/change | P1 |
| **Optional customer 2FA** | Offer TOTP 2FA for customer accounts (not required — UX friction) | P2 |
| **Account lockout notifications** | Email alert on lockout or login from new device/IP | P1 |

### T4: Admin Compromise

| Control | Implementation | Priority |
|---------|---------------|----------|
| **Mandatory 2FA (TOTP)** | No SMS fallback. Google Authenticator or Authy. | P0 |
| **IP allowlist** | Admin routes only accessible from pre-approved IPs or VPN | P0 |
| **Session management** | 30-min inactivity timeout; 8-hour absolute; no "remember me" on admin | P0 |
| **Audit log of ALL admin actions** | Every create/update/delete logged with actor, timestamp, IP, old/new values | P0 |
| **Role-based access** | Owner > Admin > Fulfillment > Read-only (see file 08) | P0 |
| **Admin panel on separate subdomain** | admin.azaminos.com with its own Cloudflare WAF rules | P1 |
| **Hardware key support** | WebAuthn / FIDO2 for admin authentication (YubiKey) | P2 |

### T5: Inventory Manipulation

| Control | Implementation | Priority |
|---------|---------------|----------|
| **Audit log on all inventory changes** | Stock level, price, batch number changes logged with before/after values | P0 |
| **Atomic stock decrement** | Database-level enforcement (see file 08 for patterns) | P0 |
| **API authentication** | All inventory APIs require admin-level auth; no public write APIs | P0 |
| **Alerting on anomalies** | Alert if stock changes by >50% in a single action; alert on price changes >20% | P1 |

### T6: SQL Injection

| Control | Implementation | Priority |
|---------|---------------|----------|
| **Parameterized queries / ORM** | Use Prisma or equivalent ORM — never concatenate user input into SQL | P0 |
| **Input validation** | Validate and sanitize all search queries, filter parameters, form inputs | P0 |
| **Principle of least privilege** | Database user for the app has only SELECT/INSERT/UPDATE on specific tables; no DROP/ALTER | P0 |
| **WAF SQL injection rules** | Cloudflare WAF managed ruleset catches common SQLi patterns | P0 |

### T7: XSS

| Control | Implementation | Priority |
|---------|---------------|----------|
| **Content Security Policy (CSP)** | Strict CSP headers; no inline scripts; nonce-based script loading | P0 |
| **Output encoding** | React/Next.js auto-escapes by default; never use `dangerouslySetInnerHTML` with user input | P0 |
| **Sanitize admin-entered HTML** | Product descriptions entered by admin go through DOMPurify or similar before rendering | P1 |
| **HttpOnly + Secure cookies** | Session cookies not accessible via JavaScript | P0 |

### T8: Bot Scraping

| Control | Implementation | Priority |
|---------|---------------|----------|
| **Cloudflare Bot Management** | Super Bot Fight Mode (included in Pro plan) | P1 |
| **Rate limiting** | 60 requests/minute per IP on product pages; 20/minute on API | P1 |
| **robots.txt** | Disallow aggressive crawlers; allow legitimate search engines | P1 |
| **No public API for catalog** | Catalog data served via server-rendered pages, not a public REST API | P2 |

### T10: DDoS

| Control | Implementation | Priority |
|---------|---------------|----------|
| **Cloudflare proxy** | All traffic through Cloudflare; origin IP never exposed | P0 |
| **Cloudflare DDoS protection** | Automatic L3/L4/L7 mitigation (included in all plans) | P0 |
| **Rate limiting** | Application-level rate limits as backup | P0 |
| **Auto-scaling** | If on Vercel/Railway, auto-scaling handles traffic spikes | P1 |
| **Challenge page** | Cloudflare "Under Attack Mode" as emergency toggle | P1 |

### T11: Payment Data Theft

| Control | Implementation | Priority |
|---------|---------------|----------|
| **Never touch card data** | Use hosted payment fields (Authorize.net Accept.js, or processor's hosted checkout) | P0 |
| **PCI DSS SAQ-A** | By using hosted fields, card data never hits our servers — SAQ-A is the simplest compliance tier | P0 |
| **TLS everywhere** | HTTPS only; HSTS preload; TLS 1.2+ minimum | P0 |
| **No card data in logs** | Application logging must never include card numbers, CVVs, or full tokens | P0 |

### T12: Supply Chain Attacks

| Control | Implementation | Priority |
|---------|---------------|----------|
| **Lock file** | package-lock.json or pnpm-lock.yaml committed; exact versions only | P0 |
| **Dependabot / Renovate** | Automated dependency update PRs with CI checks | P1 |
| **npm audit** | Run `npm audit` in CI; fail on critical/high vulnerabilities | P1 |
| **Minimal dependencies** | Resist adding packages for trivial functionality | P1 |
| **Subresource Integrity** | SRI hashes on any CDN-loaded scripts | P2 |

### T13: Email Impersonation

| Control | Implementation | Priority |
|---------|---------------|----------|
| **SPF + DKIM + DMARC** | Properly configured DNS records for sending domain | P0 |
| **Domain-based sending only** | All transactional email from @azaminos.com (or similar owned domain) | P0 |
| **Customer notification of suspicious activity** | Email on order, on login from new device, on password change | P1 |

---

## 3. Data Minimization

### What PII Do We Actually Need?

| Data | Need to Store? | Justification |
|------|---------------|---------------|
| **Name** | Yes | Shipping label, order reference |
| **Email** | Yes | Order confirmation, account, marketing (opt-in) |
| **Shipping address** | Yes | Fulfillment |
| **Billing address** | No — hand to processor | AVS handled by payment processor |
| **Phone number** | Optional | Carrier delivery issues; not required |
| **Card number** | **NEVER** | Hosted payment fields handle this; we never see or store card data |
| **CVV** | **NEVER** | Processor-side only |
| **Payment token** | Yes (processor token only) | For refunds; processor-issued token, not raw card data |
| **IP address** | Yes (hashed or truncated) | Fraud detection, rate limiting; truncate after 90 days |
| **Order history** | Yes | Customer account, support, analytics |
| **RUO acknowledgment** | Yes | Legal compliance — timestamp + IP of disclaimer acceptance |
| **Password** | Yes (bcrypt/argon2 hash only) | Authentication; never store plaintext |

### Retention Policy

| Data | Retention | Notes |
|------|-----------|-------|
| Order data | 7 years | Tax/accounting compliance |
| Customer PII | Until account deletion + 30 days | GDPR-like best practice |
| IP logs | 90 days | Fraud investigation window |
| Audit logs | 2 years | Admin action trail |
| Session data | 8 hours max | Auto-expire |
| Cart / reservation data | 24 hours | TTL cleanup |

---

## 4. Compliance Checklist

### PCI DSS SAQ-A (if using hosted payment fields)

- [ ] Card data never enters our environment — hosted fields / redirect checkout only
- [ ] TLS 1.2+ on all pages
- [ ] No card data in server logs, database, or error reports
- [ ] Payment page loaded over HTTPS
- [ ] Vendor (payment processor) is PCI DSS Level 1 certified
- [ ] Annual self-assessment questionnaire filed

### Age Verification

- [ ] Age verification checkbox at checkout ("I confirm I am 18 years or older")
- [ ] Logged with timestamp and IP
- [ ] Consider full age verification service (e.g., AgeChecker.net) if required by state law
- [ ] Note: Most competitors do NOT implement robust age verification beyond a checkbox or site-entry pop-up

### RUO Disclaimer Acknowledgment

- [ ] "I acknowledge these products are for laboratory research purposes only and are not intended for human consumption" checkbox at checkout
- [ ] Checkbox is NOT pre-checked (must be active consent)
- [ ] Logged with: timestamp, IP, order ID, user ID, exact disclaimer text version
- [ ] Disclaimer text versioned in database (if wording changes, old acknowledgments reference old version)

### Shipping Restrictions

- [ ] Identify states/countries with restrictions on specific compounds (some states restrict SARMs)
- [ ] Address validation at checkout blocks restricted destinations
- [ ] Maintain a restricted-destination table (state/country + compound category)
- [ ] Document restrictions clearly on shipping policy page

### GDPR-Like Best Practices (even if US-only initially)

- [ ] Privacy policy published and linked from checkout
- [ ] Cookie consent banner (if using analytics/tracking cookies)
- [ ] Account deletion flow ("right to be forgotten")
- [ ] Data export on request
- [ ] Marketing emails require explicit opt-in (not pre-checked)

---

## 5. Security Architecture Diagram

```
                    ┌──────────────────┐
                    │   CLOUDFLARE     │
                    │   - WAF          │
                    │   - DDoS Prot.   │
                    │   - Bot Mgmt     │
                    │   - Rate Limit   │
                    │   - SSL/TLS      │
                    └────────┬─────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
    ┌─────────┴────────┐       ┌───────────┴──────────┐
    │   STOREFRONT     │       │   ADMIN PANEL        │
    │   (Next.js)      │       │   (Next.js)          │
    │   - CSP headers  │       │   - IP allowlist     │
    │   - CSRF tokens  │       │   - 2FA mandatory    │
    │   - Input valid. │       │   - Session timeout  │
    │   - Rate limits  │       │   - Audit logging    │
    └─────────┬────────┘       └───────────┬──────────┘
              │                             │
              └──────────────┬──────────────┘
                             │
                    ┌────────┴─────────┐
                    │   API / MEDUSA   │
                    │   - Auth (JWT)   │
                    │   - RBAC         │
                    │   - Parameterized│
                    │     queries      │
                    │   - Input sanit. │
                    └────────┬─────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
    ┌─────────┴───┐  ┌──────┴──────┐  ┌───┴────────────┐
    │  PostgreSQL  │  │   Redis     │  │ Payment Procs  │
    │  - Encrypted │  │  - Sessions │  │ - Hosted Fields│
    │    at rest   │  │  - Rate lim │  │ - PCI Level 1  │
    │  - Least     │  │  - Cart/TTL │  │ - No card data │
    │    privilege  │  │             │  │   on our side  │
    │  - Backups   │  │             │  │                │
    └─────────────┘  └─────────────┘  └────────────────┘
```

---

## 6. Security Headers Checklist

```http
# Required headers for all responses:
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-{random}'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://*.payment-processor.com; frame-src https://*.payment-processor.com;
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
X-XSS-Protection: 0  # Deprecated but some scanners check for it
```

---

## 7. Incident Response Plan (Outline)

1. **Detection:** Monitoring alerts (error rates, unusual traffic, admin login anomalies)
2. **Containment:** Isolate affected system; revoke compromised credentials; enable Cloudflare "Under Attack Mode"
3. **Investigation:** Review audit logs; identify scope of breach; preserve evidence
4. **Notification:** Customer notification within 72 hours if PII affected; payment processor notification
5. **Recovery:** Patch vulnerability; rotate all secrets; restore from clean backup if needed
6. **Post-mortem:** Document timeline, root cause, remediation, and prevention measures

---

Sources:
- [Stripe PCI Documentation](https://stripe.com/docs/security)
- [OWASP Top 10 — 2021](https://owasp.org/www-project-top-ten/)
- [Cloudflare WAF Documentation](https://developers.cloudflare.com/waf/)
- [PCI DSS SAQ-A Requirements](https://www.pcisecuritystandards.org/document_library/)
- Competitor analysis (files 01-07) for industry-specific threat patterns
