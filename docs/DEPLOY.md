# Deploy: Netlify + Cloudflare DNS

Target production hostnames:

| Hostname | Purpose |
|----------|---------|
| `https://mcneelyfamilypoodles.com` | Next.js app (Netlify) |
| `https://www.mcneelyfamilypoodles.com` | Redirect → apex |
| `https://images.mcneelyfamilypoodles.com` | Cloudflare R2 media only (not Netlify) |

Repo: [PrintinghouseImp/McNeelyFamilyPoodles](https://github.com/PrintinghouseImp/McNeelyFamilyPoodles)

---

## Part 1 — Netlify (connect GitHub & first deploy)

### 1. Create the site

1. Sign in at [app.netlify.com](https://app.netlify.com).
2. **Add new site → Import an existing project → GitHub**.
3. Authorize Netlify for `PrintinghouseImp/McNeelyFamilyPoodles` if needed.
4. Select branch: **`main`**.
5. Build settings (usually auto-detected):

   | Setting | Value |
   |---------|--------|
   | Build command | `npm run build` |
   | Publish directory | *(leave default for Next.js / empty — runtime handles it)* |
   | Node | **22** (`netlify.toml` sets `NODE_VERSION`) |

6. **Do not deploy yet** until env vars are set (next step). If you already clicked Deploy and it failed, set env vars and **Retry deploy**.

### 2. Environment variables (Site configuration → Environment variables)

Add for **Production** (and Preview if you want PR previews to work).  
Never commit real values to git.

| Variable | Example / notes |
|----------|-----------------|
| `DATABASE_URL` | Supabase **Session or Transaction pooler** URI (`sslmode` as you use locally) |
| `AUTH_SECRET` | Long random string (`openssl rand -base64 32`) |
| `AUTH_URL` | First deploy: `https://<site-name>.netlify.app` — then change to `https://mcneelyfamilypoodles.com` after DNS |
| `ADMIN_EMAIL` | Admin email used at seed time |
| `ADMIN_PASSWORD` | **Strong** password (not `password`) if you re-seed; live admin is already in DB after seed |
| `ADMIN_NAME` | Display name |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Google OAuth (update redirect URIs — Part 3) |
| `AUTH_FACEBOOK_ID` / `AUTH_FACEBOOK_SECRET` | Optional |
| `R2_ACCOUNT_ID` | Cloudflare account id |
| `R2_ACCESS_KEY_ID` | R2 API token |
| `R2_SECRET_ACCESS_KEY` | R2 API secret |
| `R2_BUCKET_NAME` | Bucket name |
| `R2_PUBLIC_URL` | `https://images.mcneelyfamilypoodles.com` |
| `VENMO_HANDLE` / `ZELLE_CONTACT` / `PAYPAL_ME_URL` | Deposit handles (optional at first) |

### 3. Trigger deploy

**Deploys → Trigger deploy → Deploy site**.

Success checklist:

- Build finishes green  
- `https://<site-name>.netlify.app` loads the home page  
- `/admin/login` loads (admin works only if DB + seed already applied against Supabase)

If the build fails, open **Deploy log** and search for `Error` / `Prisma` / `DATABASE_URL`.

### 4. Database on first production use

Migrations/seed already ran against Supabase from your machine if you completed that earlier. If the prod DB is empty:

```bash
# Locally, with production DATABASE_URL in .env
npx prisma migrate deploy
npm run db:seed
```

---

## Part 2 — Custom domain on Netlify

1. Netlify site → **Domain management → Add a domain**.
2. Enter `mcneelyfamilypoodles.com`.
3. Add `www.mcneelyfamilypoodles.com` as well (or let Netlify suggest www).
4. Netlify shows **DNS records to create**. Keep that tab open for Part 3.
5. Set **Primary domain** to `mcneelyfamilypoodles.com` (apex).
6. After HTTPS works, set env:

   ```env
   AUTH_URL=https://mcneelyfamilypoodles.com
   ```

   then **Trigger deploy** again so Auth.js cookies/callbacks use the real origin.

`netlify.toml` already includes a **301 www → apex** redirect once both hostnames are on the site.

---

## Part 3 — Cloudflare DNS

In [Cloudflare Dashboard](https://dash.cloudflare.com) → domain **mcneelyfamilypoodles.com** → **DNS → Records**.

### A. Website (Netlify)

Use the **exact** targets Netlify shows. Common pattern:

| Type | Name | Content | Proxy |
|------|------|---------|--------|
| **CNAME** | `www` | `<your-site>.netlify.app` | Proxied (orange cloud) **or** DNS only while debugging SSL |
| **CNAME** or **A/AAAA** | `@` (apex) | Netlify’s load balancer hostname **or** Netlify A records | See note below |

**Apex (`@`) options:**

1. **Preferred with Cloudflare:** CNAME flattening — CNAME `@` → `<your-site>.netlify.app` (Cloudflare supports CNAME at root).
2. **Or** Netlify’s documented **A** records (Netlify Domain management lists current IPs/hostname).

Do **not** point `@` at R2 or at `images.…`.

### B. Images (R2) — leave alone if already working

| Type | Name | Content |
|------|------|---------|
| *(managed by R2 custom domain)* | `images` | Already attached to R2 bucket |

If R2 custom domain is configured, Cloudflare may show a CNAME for `images` — **do not** repoint that to Netlify.

### C. SSL / TLS (Cloudflare)

| Setting | Recommended |
|---------|-------------|
| SSL/TLS mode | **Full (strict)** once Netlify cert is issued; use **Full** if you hit a temporary cert loop |
| Always Use HTTPS | On |
| Automatic HTTPS Rewrites | On |

If you see **redirect loops** or **525/526** errors, try:

1. Cloudflare SSL = **Full** (not Flexible — Flexible breaks Netlify).
2. Temporarily set DNS to **DNS only** (grey cloud) until Netlify issues the certificate, then re-enable proxy.

### D. Propagation

- DNS can take a few minutes (sometimes longer).
- Netlify → Domain management should show the domain as **Netlify DNS verified / HTTPS provisioned**.

---

## Part 4 — OAuth redirect URIs (Google / Facebook)

When the live domain works, add:

**Google Cloud Console → OAuth client → Authorized redirect URIs**

```text
https://mcneelyfamilypoodles.com/api/auth/callback/google
https://www.mcneelyfamilypoodles.com/api/auth/callback/google
```

(Also keep local `http://localhost:3000/api/auth/callback/google` for dev if needed.)

**Facebook** equivalent Valid OAuth Redirect URI:

```text
https://mcneelyfamilypoodles.com/api/auth/callback/facebook
```

Authorized JavaScript origins / site URL should include `https://mcneelyfamilypoodles.com`.

---

## Part 5 — Post-deploy smoke test

| Check | URL / action |
|-------|----------------|
| Home | `https://mcneelyfamilypoodles.com` |
| Puppies | `/puppies` |
| Admin login | `/admin/login` |
| Portal login | `/portal/login` |
| Image CDN | Open a photo URL on `images.mcneelyfamilypoodles.com` after an R2 upload |
| www redirect | `https://www.mcneelyfamilypoodles.com` → apex |

---

## Troubleshooting

| Symptom | Likely fix |
|---------|------------|
| Build: `DATABASE_URL is not set` | Add env var in Netlify; redeploy |
| Build: Prisma generate fails | Confirm `npm run build` includes `prisma generate`; Node 20+ |
| Site 404 on all routes | Next.js runtime not active — ensure project is Next.js (not “static only”) |
| Auth redirects to localhost | `AUTH_URL` still local — set to production URL and redeploy |
| Admin/portal: `nextHandler is not a function` | Next.js 16 `proxy.ts` breaks Netlify OpenNext. **Do not re-add edge/proxy middleware** for auth; layouts use `requireAdmin` / `requirePortalUser` instead. |
| OAuth error `redirect_uri_mismatch` | Add production callback URLs in Google/Facebook |
| Cloudflare 525/526 | SSL mode Full/Full strict; wait for Netlify cert; try grey-cloud briefly |
| Uploads fail on Netlify | R2 env vars missing; local `public/uploads` does not work on Netlify |
| DB connection timeout from Netlify | Use Supabase **pooler** URI (Transaction mode often best for serverless) |

---

## Local CLI (optional)

```bash
npm install -g netlify-cli
netlify login
netlify init          # link repo to site
netlify env:import .env   # careful: only if .env is production-safe
netlify deploy --prod
```

Prefer Git-connected deploys: push to `main` → Netlify builds automatically.
