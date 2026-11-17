# FA Fruits (fa-fruits-nuxt-v2) — Developer Handoff

Last updated: 2026-11-16

## 1. What the project is

An Arabic (RTL) luxury fruit-gift e-commerce platform for Kuwait, built with:

- **Nuxt 4.5 + Vue 3 + Pinia**, SSR enabled, deployed on **Vercel** (`nitro.preset: 'vercel'`)
- **Supabase** (Postgres + Storage) as the only backend/data store
- **Playwright** e2e test suite (`tests/`), ~26 tests committed
- No payment gateway — checkout creates an order; **WhatsApp** (`wa.me`) links are used for all team communication (chef/driver/customer notifications are generated messages, not automated sending)

Live target: `https://fafruits.vercel.app`

## 2. Architecture map

### Front-end (`app/` — Nuxt 4 directory structure)

- `app/pages/` — storefront:
  - `index.vue` (home), `collections.vue`, `occasions/[id].vue`, `styles/[id].vue`, `product/[id].vue`
  - `cart.vue`, `checkout.vue`, `success.vue`
  - `orders/index.vue`, `orders/[phone].vue`, `track/index.vue`, `track/[id].vue`
  - policy pages (`delivery`, `returns`), `favorites.vue`, `gift-finder.vue`
- `app/pages/dashboard/` — admin panel (role-gated):
  - `login.vue`, `index.vue` → `AdminOverview.vue` (admin) or redirect to `today.vue` (assistant)
  - `orders.vue`, `today.vue` (kitchen/prep board), `products/` (index, new, [id])
  - `availability.vue`, `reports.vue`, `settings.vue`, `team.vue`, `users.vue`
- `app/components/` — shared UI (`AppHeader/Footer/BottomNav/Search/Drawer/Button/DatePicker/Toast`), commerce (`ProductCard/Form/Gallery/EditDrawer`, `OrderCard`, `DashOrderCard`, `OrderDetailsDrawer`, `WhatsAppPreviewModal`, `VipModal`, `ConfirmModal`)
- `app/composables/` — data layer per domain: `useProducts`, `useStyles`, `useExtras`, `useCart`, `useFavorites`, `useAuth`, `useTeam`, `useSettings`, `useDashboardOrders`, `useDashboardStats`, `useTrackOrder`, `useCustomerOrders`, `useOrderMessages`, `useApiFetch`, `useSupabase`, `useToast`, `useInfiniteRail`
- `app/composables/useOrderMessages.ts` — builds all Arabic WhatsApp messages (Arabic numerals/dates, image URL building, `wa.me` link construction). Central to the notify flows.
- `app/middleware/dashboard-auth.global.ts` — client-side dashboard guard
- `app/utils/product.ts` — product title fallback logic; `app/utils/format.ts`
- `app/data/cities.ts` — Kuwait delivery cities/fees

### Server (`server/` — Nitro)

- `server/middleware/auth.ts` — API gatekeeper. Public paths (products, styles, extras, settings GET, order create, track/by-phone, login/logout) vs protected paths (orders GET, admin mutations, me). Session-based via cookie (bcrypt password hashing with `bcryptjs`).
- `server/utils/supabase.ts` — admin Supabase client (service key)
- `server/api/`:
  - `auth/team/` — login, logout, me, change-password
  - `orders/` — index (GET list / POST create), `[id]` GET + status actions: `start-preparation`, `go-on-way`, `deliver`, `notify-chef`, `notify-driver`, `mark-chef-sent`, `mark-driver-sent`, `track/[id]`, `by-phone/[phone]`
  - `products/` — list, `[id]` patch, `[id]/styles`
  - `styles/` — list, `[id]`, `[id]/styles` patch
  - `team/` — list, add (`notify.post.ts`), `[phone]` patch/delete, change-password, `my-phone`
  - `settings` (get/patch), `test-supabase`
- NOTE: product **create/delete** endpoints may be missing (only `[id].patch` exists) — verify; if so, ProductForm "new" flow is incomplete server-side.

### Data model (Supabase — inferred from code)

Tables referenced: `products`, `styles`, `extras`, `settings`, `orders`, `team` (staff with roles admin/assistant/chef/driver + hashed password). Storage bucket for product images (paths like `/images/products/P01.png`).
⚠️ **No migrations/schema folder exists in the repo** — the database schema lives only in Supabase. This must be recovered (supabase CLI dump) and version-controlled.

## 3. Current state

- Core storefront flow works end-to-end: browse → cart (localStorage, `fa_cart`) → checkout (delivery step with city/date picker, extras) → order creation → track by order ID / phone.
- Dashboard works: login, role-based views (admin vs assistant), orders board with WhatsApp notify actions, products CRUD UI, team management, settings.
- Uncommitted changes exist (`git status` shows 9 modified files: orders board, login, product page, WhatsApp modal, main.css, etc.) — **review, test, and commit these first**; they contain recent WhatsApp-message/order-board work.
- `app_backup/` contains an older copy of the app (old file structure) — kept for reference, should be deleted before shipping.
- A stray root-level `composables/useTeam.ts` duplicates `app/composables/useTeam.ts` — legacy leftover, remove.
- `.env` is committed with a **Supabase service key** — a security issue (see §5).

## 4. Known gaps / work needed (priority order)

### P0 — must do before launch

1. **Commit or discard the 9 modified files** after manual verification of the orders dashboard and WhatsApp preview flows.
2. **Secrets hygiene**: `.env` with `SUPABASE_SERVICE_KEY` is in the repo. Rotate the Supabase keys, add `.env` to `.gitignore`, and move secrets to Vercel env vars. Service key must never ship client-side.
3. **Capture & commit the Supabase schema** (tables, RLS policies, indexes, storage rules) as migrations. Add **RLS policies** so the anon key can't write orders/products directly — currently client-side Supabase may bypass the server middleware entirely.
4. **Verify payment/handoff story** — there is no payment integration (COD only?). Confirm with client; if online payment is needed (Knet/MyFatoorah/Tap), that is a new workstream.
5. Missing server endpoints if confirmed: product **create** & **delete**, order **cancel** by admin, availability endpoints (`dashboard/availability.vue` has no obvious `/api/availability` — verify how it persists data).

### P1 — quality

6. **Run the Playwright suite** (`npx playwright test`, see `playwright.config.ts` with `PLAYWRIGHT_TEST` flag) and fix failures; the 9 dirty files likely break some dashboard specs. Complete the empty suites: `tests/mobile/`, `tests/team/`, `tests/products/`, `tests/cart/`, `tests/checkout/` have only `.gitkeep` or partial coverage.
7. **README.md** is the default Nuxt starter — replace with real setup/run/test/deploy docs.
8. Duplicate/legacy cleanup: delete `app_backup/`, root `composables/`, and unused deps (`lucide` vs `lucide-vue-next` — likely only the latter is used; `pinia` stores appear unused, state is via `useState`).
9. `nuxt.config.ts` has a duplicated `enabled:` key in devtools (harmless but sloppy) — clean up.
10. Add error handling / loading skeletons consistently; check `useApiFetch` error surfacing on storefront.

### P2 — nice to have

11. Order notifications are **copy-and-paste into WhatsApp** today. Consider the WhatsApp Cloud API for auto-send.
12. SEO: sitemap, OG tags, `siteUrl` consistency, product structured data.
13. Admin `users.vue`, `reports.vue` — verify they're wired to real data, not stubs.
14. i18n: app is Arabic-only by design; confirm no English support needed.
15. Analytics (GA4/Meta pixel), favicon/manifest/pwa polish.

## 5. Security checklist for the next dev

- [ ] Rotate Supabase anon + service keys (committed in git history)
- [ ] Rotate team member passwords (bcrypt hashes in a client-reachable table?)
- [ ] Confirm RLS enabled on ALL tables; test anon-key writes with PostgREST
- [ ] Rate-limit `/api/auth/team/login` and `/api/orders` POST (currently open to spam)
- [ ] Validate/normalize phone numbers consistently server-side (Kuwait +965)
- [ ] Confirm `server/middleware/auth.ts` PROTECTED_PATHS covers every mutating route (e.g. is `/api/orders/[id]/start-preparation` protected? Only some actions are listed)

## 6. How to run

```bash
npm install
npm run dev        # http://localhost:3000
npx playwright test   # e2e (set PLAYWRIGHT_TEST=1 to disable devtools)
npm run build && npm run preview   # Vercel build
```

Env vars needed: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_KEY`, `NUXT_PUBLIC_SITE_URL`.

## 7. Key files to read first (onboarding path)

1. `nuxt.config.ts`, `package.json`
2. `server/middleware/auth.ts` — the API security model
3. `app/composables/useCart.ts` + `app/pages/checkout.vue` — the money path
4. `app/composables/useOrderMessages.ts` + `app/components/WhatsAppPreviewModal.vue` — notification engine
5. `app/pages/dashboard/orders.vue` + `server/api/orders/*` — admin core
6. `tests/helpers/*` — the test conventions used
