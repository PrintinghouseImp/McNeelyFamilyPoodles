# McNeely Family Poodles — Architecture Plan

Full-stack rebuild for a boutique miniature poodle breeding business. Mobile-first (iPhone & Android), PostgreSQL-backed, with **public site**, **breeder admin**, and **customer portal**.

## Goals

- Public brochure + inventory site with clear litter → puppy → sire/dam navigation
- Admin tools so the breeder manages dogs, photos, status, and medical data without code
- Customer accounts (Google / Facebook) for applications, deposits, and future dog documents
- Responsive UI that works well with phone cameras and touch
- Bot protection and secure role separation (public / customer / admin)
- Brand: **Good Dog–inspired** — white background, black lettering, grayscale nav/links and unhighlighted fields (see `BRAND` in `src/lib/constants.ts` and `src/app/globals.css`)

---

## Confirmed feature list

### Public pages (anyone)

| Page | Purpose |
|------|---------|
| **Lander** | Home / marketing hero, CTAs to puppies & apply |
| **Sires / Dams** | Breeding dogs; profiles link to their litters |
| **Puppies** | Organized **by litter**; each puppy links **back to sire & dam** |
| **About Us** | Family / ranch story |
| **Technical articles** | Informational content (genetics, care, breeding topics) |
| **Application** | Puppy application entry point (portal login may be required to submit) |
| **Social** | Instagram & Facebook links; optional post feed (see notes) |
| **Shop** | Sponsored links (e.g. Amazon) and/or items the breeder sells |
| **Forever Homes** | Alumni photo grid + testimonials |

**Header nav** (prospective clients): Home, Puppies, Parents, About, Apply — `HEADER_NAV` in `src/lib/constants.ts`.

**Footer** (Good Dog–style full map): same Explore links + Forever Homes, Articles, Shop, Social + Customer/Admin portal — `FOOTER_MORE_LINKS` / `FOOTER_ACCOUNT_LINKS`.

### Mobile (iPhone & Android)

- Fully responsive layout (mobile-first Tailwind)
- Touch-friendly admin forms and galleries
- **Camera capture** for admin photo upload (`capture` + file input / Web Share patterns)
- No native App Store apps required in v1 — progressive web app (PWA) optional later for “Add to Home Screen”

### Admin (breeder only)

- Secure **admin login** (email/password; separate from customer OAuth)
- **Add / remove** dogs (parents and puppies)
- Edit **specs**, **price**, **adoption / availability status**
- Upload photos from **phone camera** or gallery
- Designate **one hero shot** + additional **gallery** photos
- **Admin-only medical records** pages (not visible to public or customers)
- Review applications, deposit requests, and customer document grants

### Customer portal (Google or Facebook login)

| Capability | Notes |
|------------|--------|
| **OAuth login** | Google + Facebook via Auth.js |
| **Application for a dog** | Linked to account + optional specific puppy |
| **Deposit / reserve request** | Choose **Venmo**, **Zelle**, or **PayPal**; records request for breeder to confirm (not full payment processor in v1) |
| **Post-purchase documents** (future-ready) | After adoption is confirmed, customer sees **their** dog’s files: vet record, vaccination history, pedigree, AKC (if upgrade paid) |

### Security

- Role-based access: `ADMIN` vs `CUSTOMER`
- Admin medical routes never exposed in public nav
- Customer documents scoped to dogs they own / are granted
- **Bot protection** on email/password account creation: **Cloudflare Turnstile** (free) — skipped for Google/Facebook OAuth
- Rate limiting on auth and form endpoints
- HTTPS only in production; secrets in env

---

## Visual design (brand)

Match a **Good Dog (gooddog.com)** clean marketplace feel on **all** public, admin, and portal surfaces:

| Role | Use | Treatment |
|------|-----|-----------|
| Background | Page chrome | White `#FFFFFF` (optional `#F9FAFB` for soft bands) |
| Lettering | Headings, strong body | Near-black `#111111` |
| Nav & links (default) | Not highlighted | Grayscale (`#6B7280`); black on hover/active |
| Labels / unhighlighted fields | Spec labels, meta | Gray type + light gray borders |
| Primary CTA | Main actions | Black button / pill, white text |
| Color | Exception only | Status badges (available/reserved/etc.) |

**Do not** use full navy/gold/burgundy chrome for base UI. Tokens: `src/lib/constants.ts` (`BRAND`), `src/app/globals.css`.

## Recommended stack

| Layer | Choice | Why |
|--------|--------|-----|
| Framework | **Next.js 16** (App Router) | SEO, server components, API/route handlers, one deployable app |
| Language | **TypeScript** | Safe models for inventory, payments requests, documents |
| Styling | **Tailwind CSS v4** | Fast UI; mobile-first |
| Database | **PostgreSQL** | Relational litters/puppies/parents/users/docs |
| ORM | **Prisma 7** + `@prisma/adapter-pg` | Migrations + type-safe queries |
| Auth | **Auth.js (NextAuth v5)** | Google + Facebook for customers; credentials for admin |
| Validation | **Zod** | Forms and APIs |
| Captcha | **Cloudflare Turnstile** | Free, privacy-friendly bot check |
| Images | Upload → object storage (S3/R2) in prod; local in dev | Camera photos can be large |
| Email (later) | Resend / similar | Application + deposit notifications |

### Why PostgreSQL

- Litters, puppies, sires/dams, ownership, applications, deposits, and documents are all relational
- Strong constraints (unique slugs, foreign keys, status enums)
- Hosted easily (Neon, Supabase, Railway) or local Docker

### Social feed reality check

Instagram and Facebook **do not** allow unrestricted free “show all my posts” embeds for most business sites without Meta app review and tokens that expire.

**v1 approach (recommended):**

1. Store Instagram / Facebook profile URLs in `SiteSetting`
2. **Social** page: branded buttons + optional **curated** posts the admin pastes (URL + thumbnail + caption)
3. Optional: official Instagram oEmbed for individual posts

**v2 (optional):** Meta Graph API integration if the breeder completes Meta developer setup.

### Deposit payments (Venmo / Zelle / PayPal)

These are primarily **person-to-person** rails, not easy server-side charge APIs.

**v1:** Customer submits a **deposit request** (puppy, amount, method). UI shows the breeder’s Venmo/Zelle/PayPal handles. Admin marks request **confirmed** after they see the money.

**v2:** Optional PayPal Checkout / Stripe for card deposits if desired later.

---

## Domain model (PostgreSQL)

```
User (ADMIN | CUSTOMER)
  ├── OAuth Account / Session (Auth.js)
  ├── Application[]
  ├── DepositRequest[]
  └── DogOwnership[] ──► Puppy  (post-adoption access)

ParentDog (sire/dam)
  ├── litters as dam / sire
  ├── Photo[] (hero + gallery)
  └── MedicalRecord[]  (admin only)

Litter
  ├── dam, sire → ParentDog
  └── Puppy[]

Puppy
  ├── litter → Litter (implies sire/dam)
  ├── status, price, specs
  ├── Photo[] (hero + gallery)
  ├── MedicalRecord[]  (admin UI; also portal vault for owners of this puppy)
  ├── Application[]
  ├── DepositRequest[]
  ├── DogOwnership[]   (admin grants → customer vault)
  └── DogDocument[]    (optional extra docs model; Phase 9 vault uses MedicalRecord)

Article (technical articles)
ShopItem (affiliate / own products)
SocialPost (optional curated feed)
SiteSetting (social URLs, payment handles, ranch copy)
```

### Key enums

| Enum | Values |
|------|--------|
| `UserRole` | `ADMIN`, `CUSTOMER` |
| `Sex` | `MALE`, `FEMALE` |
| `PuppyStatus` | `AVAILABLE`, `RESERVED`, `SOLD`, `GUARDIANSHIP`, `UNAVAILABLE` |
| `ApplicationStatus` | `NEW`, `REVIEWING`, `APPROVED`, `DECLINED`, `WAITLISTED` |
| `DepositMethod` | `VENMO`, `ZELLE`, `PAYPAL` |
| `DepositStatus` | `REQUESTED`, `AWAITING_PAYMENT`, `PAID`, `CANCELLED`, `REFUNDED` |
| `DocumentType` | `VET_RECORD`, `VACCINATION`, `PEDIGREE`, `AKC`, `OTHER` |
| `ShopItemType` | `AFFILIATE`, `PRODUCT` |

---

## App structure & routing

```
src/app/
  (public)/
    page.tsx                 # Lander
    parents/                 # Sires / Dams
    parents/[slug]/
    puppies/                 # Grouped by litter
    puppies/[slug]/          # Links to sire & dam
    about/
    articles/                # Technical articles
    articles/[slug]/
    apply/                   # Application (redirect to portal if needed)
    social/
    shop/
  portal/                    # Customer (auth required)
    login/
    page.tsx                 # Dashboard
    applications/
    deposits/
    dogs/                    # Owned dogs + documents
  admin/                     # Admin only
    login/
    (dashboard)/
      puppies/ parents/ litters/
      medical/               # Medical records UI
      applications/
      deposits/
      articles/
      shop/
      social/
      media/
  api/auth/[...nextauth]/
```

| Audience | Example paths |
|----------|----------------|
| Public | `/`, `/puppies`, `/parents`, `/about`, `/articles`, `/apply`, `/social`, `/shop` |
| Customer | `/portal`, `/portal/applications`, `/portal/deposits`, `/portal/dogs` |
| Admin | `/admin/*`, `/admin/medical` |

Middleware enforces:

- `/admin/*` → `role === ADMIN`
- `/portal/*` (except login) → signed-in `CUSTOMER` or `ADMIN`
- Medical + raw document admin APIs → `ADMIN` only
- Customer document download → owner or admin

---

## Photo UX (admin, mobile camera)

1. Admin opens dog edit → **Add photo**
2. On phone: file input with `accept="image/*"` and `capture="environment"` (rear camera)
3. Upload to storage; create `Photo` row
4. Toggle **Set as hero** (`isPrimary: true`); others are gallery
5. Public pages show hero on cards; full gallery on detail + lightbox

---

## Auth matrix

| Action | Who | Method |
|--------|-----|--------|
| Browse public pages | Anyone | — |
| Admin CMS + medical | Admin | Email + password |
| Apply / deposit request | Customer | Google or Facebook OAuth |
| Email signup (if enabled) | Customer | Password + **Turnstile** captcha |
| View own dog documents | Customer (owner) | OAuth session after admin **ownership grant** |
| View puppy medical records (portal vault) | Customer (owner of that puppy) | Same Phase 4 `MedicalRecord` rows for that puppy |
| View any medical record (full admin UI) | Admin only | Admin session |
| Parent medical records | Admin only | Not exposed via ownership (owners are linked to puppies) |

---

## Implementation phases

| Phase | Deliverable |
|-------|-------------|
| **0** | Scaffold + schema aligned to this feature list |
| **1** | PostgreSQL migrate, seed admin, brand public shells |
| **2** | Public inventory: parents, litters, puppies (by litter, sire/dam links) |
| **3** | Admin auth + dog CRUD + mobile photo upload (hero/gallery) |
| **4** | Admin medical records: **titled/labeled** PDF + scan (image) uploads per parent/puppy; admin-only |
| **5** | Customer OAuth (Google/Facebook) + protected portal shell (dashboard counts) |
| **6** | Applications: portal-auth form submit → DB; admin review statuses (NEW→…); Turnstile later if password signup |
| **7** | Deposit requests: portal form → DB; show handles; admin mark PAID/etc. |
| **8** | Content CMS: admin CRUD for articles, shop, social (profiles + posts), forever homes; public pages load published rows |
| **9** | Dog ownership + customer document vault (grant owner → portal access to that puppy’s Phase 4 medical files) |
| **10** | Hardening: rate limits, audits, PWA optional |

---

## Environment (planned)

```env
DATABASE_URL=
AUTH_SECRET=
AUTH_URL=

# Customer OAuth
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
AUTH_FACEBOOK_ID=
AUTH_FACEBOOK_SECRET=

# Admin seed
ADMIN_EMAIL=
ADMIN_PASSWORD=

# Bot protection
TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=

# Public payment handles (also overridable in SiteSetting)
VENMO_HANDLE=
ZELLE_CONTACT=
PAYPAL_ME_URL=

# Image storage (production)
S3_BUCKET=
S3_REGION=
S3_ACCESS_KEY=
S3_SECRET_KEY=
```

---

## Migration notes from old static site

| Old | New |
|-----|-----|
| Static HTML pages | App Router routes above |
| Inline gallery JS | `Photo` with `isPrimary` + storage URLs |
| No auth | Admin credentials + customer OAuth |
| Formspree incomplete | Applications + deposits in PostgreSQL |
| Blog placeholders | `Article` CMS |
| localStorage view counts | Optional analytics later |

---

## Out of scope for early phases (explicit)

- Native iOS/Android store apps (web is the product; PWA optional)
- Automated charge of Venmo/Zelle from the server
- Live unrestricted Instagram/Facebook firehose without Meta API setup
- Full e-commerce cart/checkout (Shop is links + simple products first)

---

*Brand: **McNeely Family Poodles**. Content/images from the prior McBride static site can be migrated during content import.*
