# McNeely Family Poodles

Full-stack site for a boutique miniature poodle program: public pages, **breeder admin**, and **customer portal** — Next.js, TypeScript, Tailwind, **PostgreSQL (Supabase)**, Prisma.

See **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** for the confirmed feature list, domain model, and phases.

**Hosting direction:** Netlify as the visual storefront, **Supabase** as the secure Postgres “filing cabinet,” and **ImgBB** for public photo hosting (hotlinked URLs so large image libraries do not bloat the Netlify deploy).

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
- **Admin:** Dog CRUD, status/price/specs, phone camera photos (hero + gallery), medical records, ownership grants
- **Portal:** Google/Facebook login, applications, deposit requests (Venmo/Zelle/PayPal), post-adoption document vault (owned dogs’ medical files)
- **Security:** Role separation, Cloudflare Turnstile for email signup (OAuth skips captcha)
- **Mobile:** Responsive for iPhone and Android

## Stack

- Next.js 16 (App Router) + React 19
- **Supabase** (hosted PostgreSQL) + Prisma 7 — Prisma schema/client stay standard Postgres; only `DATABASE_URL` points at Supabase
- Auth.js (admin credentials + Google/Facebook for customers)
- **ImgBB** for public image hosting (API key in env; URLs stored in DB)
- Zod + Cloudflare Turnstile (planned)
- Deploy target: **Netlify** (storefront)

## Quick start

```bash
npm install
cp .env.example .env
# 1) Paste your Supabase Postgres URI into DATABASE_URL (see below)
# 2) Set AUTH_SECRET (and optionally IMGBB_API_KEY)
npx prisma migrate dev
npm run db:seed
npm run db:smoke   # print row counts + sample data
npm run db:studio  # GUI at http://localhost:5555
npm run dev
```

### Database: Supabase (required)

This app does **not** use a special Supabase client for core data. Prisma uses a normal Postgres connection string.

1. Create a project at [supabase.com](https://supabase.com) (or open an existing one).
2. Go to **Project Settings → Database**.
3. Under **Connection string**, select **URI**.
4. Copy the string (use the project database password when prompted).
5. Paste it into `.env` as:

   ```env
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres?sslmode=require"
   ```

6. **Special characters in the password** must be URL-encoded (example: `!` → `%21`). The Supabase UI “copy” flow after you enter the password usually produces a valid URI.
7. **Prefer the pooler URI on most home/Windows networks.** Supabase’s direct host `db.<project-ref>.supabase.co:5432` is often **IPv6-only**. If you see Prisma `P1001: Can't reach database server`, your PC likely has no working IPv6 path. Fix:
   - Supabase → **Project Settings → Database → Connection string**
   - Method: **Session pooler** (or **Transaction** for serverless)
   - Copy that URI into `DATABASE_URL` (username is often `postgres.<project-ref>`, host like `aws-0-….pooler.supabase.com`)
   - Keep `?sslmode=require` if not already present
8. Apply schema and seed (once per empty project):

   ```bash
   npx prisma migrate deploy
   npm run db:seed
   ```

Prisma stays unchanged: same `schema.prisma`, migrations, and client. Only the host behind `DATABASE_URL` is Supabase.

### ImgBB (public photos)

- Get a free API key at [api.imgbb.com](https://api.imgbb.com/).
- Set `IMGBB_API_KEY` in `.env` (see `.env.example`).
- Uploads will return a public `https://i.ibb.co/...` URL stored in the database; the site displays that URL so photo binaries are not stored in the Netlify deploy.

### Database notes (migrations)

- Migrations live under `prisma/migrations/` (`init`, `forever_homes`, …).
- Seed creates admin + sample Froggie/Arsibalt litter + Pepper (set a strong `ADMIN_PASSWORD` before seeding production).


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
