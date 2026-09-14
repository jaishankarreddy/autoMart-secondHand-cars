# Ayra Cars — Pre-Deploy Audit

**Date:** 2026-09-14
**Status:** NOT READY — Critical issues must be fixed before going live.

---

## CRITICAL (must fix before deploying)

| # | Issue | File(s) |
|---|-------|---------|
| 1 | **All admin API routes are unprotected** — anyone can create/update/delete vehicles, view contacts, modify offers. No `adminRequired` middleware exists. | `backend/src/server.js:670-849` |
| 2 | **Production API URL is wrong** — points to `https://automart-backend-6p87.onrender.com` (old name). Frontend can't reach backend in production. | `src/environments/environment.prod.ts:3` |
| 3 | **Dev API URL is empty** — `apiUrl: ''` with no proxy config. All API calls in `ng serve` fail. | `src/environments/environment.ts:3` |
| 4 | **JWT secret is placeholder** — `JWT_SECRET=change-me-in-production`. Anyone can forge tokens. | `backend/.env:3` |
| 5 | **`CLIENT_ORIGIN` references old Vercel URL** — `auto-mart-second-hand-cars.vercel.app`. CORS will reject requests from the new deployment. | `backend/.env:5` |

---

## HIGH (security)

| # | Issue | File(s) |
|---|-------|---------|
| 6 | **Regex injection (ReDoS)** — `new RegExp(req.query.q, 'i')` with raw user input. Can hang the Node process. | `backend/src/server.js:419` |
| 7 | **CORS wildcard fallback** — if `CLIENT_ORIGIN` isn't set, any website can make authenticated requests. | `backend/src/server.js:24` |
| 8 | **`render.yaml` regenerates JWT secret on every deploy** — `generateValue: true` invalidates all user sessions on redeploy. | `render.yaml` |

---

## MEDIUM (broken UX)

| # | Issue | File(s) |
|---|-------|---------|
| 9 | **Inventory page has no footer** — uses tiny inline `<footer>` instead of `<app-footer />`. No links, no contact info on most-visited pages. | `src/app/features/inventory/pages/inventory-page/inventory-page.component.html:245-248` |
| 10 | **Sell page has no footer** — missing `<app-footer />`. | `src/app/features/sell/pages/sell-page/` |
| 11 | **Coming-soon pages have no footer** — `/privacy` and `/terms` render no footer. | `src/app/features/common/pages/coming-soon/` |
| 12 | **Contact page shows wrong phone number** — displays placeholder `+91 98765 43210` instead of real numbers. | `src/app/features/contact/pages/contact.page.ts:60,78-79` |
| 13 | **Inventory footer dot color is wrong** — `#ef6e39` (old orange) instead of `#d7fa4c` (green). | `inventory-page.component.scss:24` |
| 14 | **Admin auth interceptor not wired** — `authInterceptor` only reads user token, not admin token. Admin API calls won't carry JWT. | `src/app/interceptors/auth.interceptor.ts` |
| 15 | **4 dead models** — `Wishlist`, `AdminNotification`, `AdminSetting`, `AuditLog` have schemas but zero API routes. | `backend/src/models/` |

---

## LOW (cleanup)

| # | Issue | File(s) |
|---|-------|---------|
| 16 | No 404 catch-all route on backend — unmatched routes get Express HTML error. | `backend/src/server.js` |
| 17 | `build.log` tracked in git — contains crash dumps. Add `*.log` to `.gitignore`. | root `.gitignore` |
| 18 | Stale `dist/automart/` directory — leftover from old project name. | `dist/automart/` |
| 19 | `JWT_EXPIRES_IN` env var defined but unused — code hardcodes `7d`/`12h`. | `backend/.env`, `server.js` |
| 20 | Verbose auth logging exposes user IDs and phone numbers in stdout. | `backend/src/server.js:142,180,200` |
| 21 | Weak seed admin password (`admin123`) likely in production. | `backend/src/seed/data/admin.data.js:37` |
| 22 | No rate limiting on login, register, or form endpoints. | `backend/src/server.js` |
| 23 | No token invalidation / logout mechanism. | `backend/src/server.js` |
| 24 | No admin registration endpoint — only seed script. | `backend/src/server.js` |
| 25 | No security headers (no `helmet`). | `backend/src/server.js` |

---

## Recommended Fix Order

### Phase 1 — Deploy Blockers (today)
1. Fix production API URL (#2) and generate a real JWT secret (#4)
2. Update `CLIENT_ORIGIN` in backend `.env` (#5)
3. Fix dev API URL or add proxy config (#3)
4. Add `adminRequired` middleware to all admin routes (#1)
5. Add footer to inventory, sell, and coming-soon pages (#9-11)
6. Fix contact page phone numbers (#12)

### Phase 2 — Security (before launch)
7. Escape user input in search regex (#6)
8. Fix CORS configuration (#7)
9. Fix render.yaml JWT secret handling (#8)
10. Add rate limiting (#22)
11. Add security headers (#25)

### Phase 3 — Cleanup (post-launch)
12. Remove dead models or wire them up (#15)
13. Add 404 catch-all route (#16)
14. Clean up stale files (#17, #18)
15. Add admin registration endpoint (#24)
