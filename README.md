# McNeely Family Poodles

Full-stack site for a boutique miniature poodle program: public pages, **breeder admin**, and **customer portal** — Next.js, TypeScript, Tailwind, **PostgreSQL (Supabase)**, Prisma.

See **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** for the confirmed feature list, domain model, and phases.

**Hosting direction:** Netlify as the visual storefront, **Supabase** as the secure Postgres “filing cabinet,” and **Cloudflare R2** for media at **`https://images.mcneelyfamilypoodles.com`** (hotlinked CDN URLs so large libraries do not bloat the Netlify deploy).

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
- **Cloudflare R2** for images/documents — public CDN `https://images.mcneelyfamilypoodles.com`
- Zod + Cloudflare Turnstile (planned)
- Deploy target: **Netlify** (storefront)

## Quick start

```bash
npm install
cp .env.example .env
# 1) Paste your Supabase Postgres URI into DATABASE_URL (see below)
# 2) Set AUTH_SECRET
# 3) Set Cloudflare R2 credentials + R2_PUBLIC_URL (see Media section)
npx prisma migrate deploy
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

### Media: Cloudflare R2 (`images.mcneelyfamilypoodles.com`)

All admin photo and document uploads use **Cloudflare R2** when R2 env vars are set. The app stores **only the public URL** in Postgres (Supabase); browsers load files from the CDN.

| Env var | Purpose |
|---------|---------|
| `R2_ACCOUNT_ID` | Cloudflare account id |
| `R2_ACCESS_KEY_ID` | R2 API token access key |
| `R2_SECRET_ACCESS_KEY` | R2 API token secret |
| `R2_BUCKET_NAME` | Bucket name |
| `R2_PUBLIC_URL` | `https://images.mcneelyfamilypoodles.com` (no trailing slash) |

**Dashboard setup**

1. Cloudflare → **R2** → create a bucket (e.g. `mcneely-media`).
2. Bucket → **Settings** → **Custom Domains** → attach `images.mcneelyfamilypoodles.com` (DNS is managed in Cloudflare).
3. **R2 → Manage R2 API Tokens** → create a token with **Object Read & Write** on that bucket.
4. Copy account id + keys into `.env` / Netlify environment variables (never commit secrets).

**Object key layout**

```text
https://images.mcneelyfamilypoodles.com/uploads/puppy/<id>/<timestamp>-<hash>.webp
https://images.mcneelyfamilypoodles.com/uploads/medical/<id>/<timestamp>-<hash>.pdf
```

**Behavior**

- **R2 configured:** upload → R2 `PutObject` → URL on `images.mcneelyfamilypoodles.com` saved in DB.
- **R2 not configured:** fallback to local `public/uploads/` (fine for quick local UI tests; not for production/Netlify).
- **Deletes** in admin remove the R2 object when the stored URL is on the CDN (or a local `/uploads/` path).

Code: `src/lib/r2.ts`, `src/lib/uploads.ts`, `MEDIA_CDN` in `src/lib/constants.ts`.

### Database notes (migrations)

- Migrations live under `prisma/migrations/` (`init`, `forever_homes`, …).
- Seed creates admin + sample Froggie/Arsibalt litter + Pepper (set a strong `ADMIN_PASSWORD` before seeding production).

### Deploy (Netlify + Cloudflare)

Production site: **`https://mcneelyfamilypoodles.com`**  
Media CDN: **`https://images.mcneelyfamilypoodles.com`** (R2)

Step-by-step (env vars, Netlify import, Cloudflare DNS, OAuth callbacks, SSL):

→ **[docs/DEPLOY.md](docs/DEPLOY.md)**

Config file: `netlify.toml` (Node 22, build command, www → apex redirect).


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
