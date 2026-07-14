# McNeely Family Poodles

Full-stack site for a boutique miniature poodle program: public pages, **breeder admin**, and **customer portal** — Next.js, TypeScript, Tailwind, **PostgreSQL**, Prisma.

See **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** for the confirmed feature list, domain model, and phases.

## Brand

Good Dog–inspired clean UI (public, admin, portal):

| Role | Use | Hex / note |
|------|-----|------------|
| Background | Page chrome | White `#FFFFFF` |
| Lettering | Headings & body emphasis | Near-black `#111111` |
| Links / nav (not active) | Grayscale | Gray `#6B7280` → black on hover/active |
| Fields / labels (unhighlighted) | Grayscale | Gray labels, light borders |
| Primary CTA | Black pill/button | Black fill, white text |
| Color | Status badges only | Soft green/amber/etc. |

Source of truth: `src/lib/constants.ts` (`BRAND`) and `src/app/globals.css`.

## Feature highlights

- **Public:** Lander, Sires/Dams, Puppies by litter (links to sire/dam), About, Technical articles, Application, Social, Shop
- **Admin:** Dog CRUD, status/price/specs, phone camera photos (hero + gallery), medical records (admin-only)
- **Portal:** Google/Facebook login, applications, deposit requests (Venmo/Zelle/PayPal), post-adoption documents
- **Security:** Role separation, Cloudflare Turnstile for email signup (OAuth skips captcha)
- **Mobile:** Responsive for iPhone and Android

## Stack

- Next.js 16 (App Router) + React 19
- PostgreSQL + Prisma 7
- Auth.js (admin credentials + Google/Facebook for customers)
- Zod + Cloudflare Turnstile (planned)

## Quick start

```bash
npm install
cp .env.example .env
# set DATABASE_URL and AUTH_SECRET
npx prisma migrate dev
npm run db:seed
npm run db:smoke   # print row counts + sample data
npm run db:studio  # GUI at http://localhost:5555
npm run dev
```

### Database notes

- Phase 1 was verified against a temporary **Prisma Postgres** (`create-db`) cloud instance.
- Migration: `prisma/migrations/20260711000249_init`
- Seed creates admin + sample Froggie/Arsibalt litter + Pepper.
- Temporary DBs expire unless claimed; for lasting local use install Postgres/Docker and point `DATABASE_URL` there.


## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run db:migrate` | Migrations |
| `npm run db:seed` | Seed admin + sample data |
| `npm run db:studio` | Prisma Studio |

## Layout

```
src/app/(public)/   Lander, puppies, parents, about, articles, apply, shop, social
src/app/portal/     Customer dashboard, applications, deposits, my dogs
src/app/admin/      Breeder CMS + medical
prisma/schema.prisma
docs/ARCHITECTURE.md
```

## Legacy

Predecessor: [McBrideFamilyPoodles](https://github.com/PrintinghouseImp/McBrideFamilyPoodles) (static). This repo is a clean rebuild under **McNeely Family Poodles**.
