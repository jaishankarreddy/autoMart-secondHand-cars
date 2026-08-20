# AutoMart — Database Design & Project Guide (MongoDB + Express + Angular)

> This document reflects the **current, implemented** backend (`backend/`), not a hypothetical design. It
> covers every MongoDB collection/model, the Mongoose schemas, the REST endpoints, the seed/data
> pipeline, how to run the project, and the front-end architecture & tech stack.

---

## 1. Project Overview

AutoMart is a **second-hand car & bike marketplace for Karnataka, India**. It is a full-stack app:

- **Front end**: Angular 20 (standalone components, signals), Tailwind CSS 4, Lucide icons.
- **Back end**: Node.js + Express + Mongoose, backed by **MongoDB Atlas**.
- **Storage**: vehicle images uploaded via **Multer** to a local `uploads/` folder, served over HTTP.

### User-facing (public) flows
- **Home**: hero, featured cars & bikes, popular brands, stats, testimonials, FAQs, search box.
- **Cars / Bikes listing**: filter (brand, fuel, transmission, body type, color, price, year, owners,
  district, CC/ABS/mileage for bikes), keyword search, sort, and **server-side pagination (20 per page)**.
- **Vehicle detail**: gallery, specs, description, feature groups, seller, make-an-offer form.
- **Search page**: keyword + type (car/bike) + brand + budget + fuel.
- **Compare**: up to 3 vehicles; **Wishlist**: saved cars & bikes.
- **Contact**: enquiry form; **About** pages.

### Admin flows
- Dashboard (totals, brand bar chart, recent offers/contacts), vehicle listing CRUD (create/edit/delete with
  image upload), offers status, contacts status.

---

## 2. Tech Stack

| Layer       | Technology                                  | Notes |
|-------------|---------------------------------------------|-------|
| Frontend    | **Angular 20**                              | standalone components, signals |
| Styling     | **Tailwind CSS 4** (via `@tailwindcss/postcss`) | utility-first, no TSX |
| Icons       | **@lucide/angular**                         | `1.28.x` |
| Backend     | **Node.js + Express 4**                     | |
| ORM/ODM     | **Mongoose 8**                              | schema validation + indexes |
| Database    | **MongoDB Atlas** (shared replica set)      | direct TCP connection (non-SRV) |
| Uploads     | **Multer 2** (disk storage)                 | local `backend/uploads/` |
| Auth deps   | **bcryptjs**, **jsonwebtoken**              | installed; JWT auth not yet wired (see §10) |
| Dev server  | **nodemon**                                 | backend auto-reload |
| Dev proxy   | **Vite dev server** (`proxy.conf.json`)     | Angular dev server -> Express |

**Direct (non-SRV) MongoDB connection** is required when the Node runtime cannot resolve `mongodb+srv://`
SRV records. The connection string in `backend/.env` therefore lists the replica-set host endpoints
explicitly with `?ssl=true&replicaSet=...&authSource=admin`.

---

## 3. How to Run the Project

### Prerequisites
- Node.js v18+ (18 recommended), npm
- A MongoDB database (local or Atlas) reachable via the URI in `.env`

### A. Configure environment
Create `backend/.env` (copy from `.env.sample` if present):

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/automart
# or a direct (non-SRV) Atlas URI, e.g.
# mongodb://USER:PASS@host-00...:27017,host-01...:27017/?ssl=true&replicaSet=REPL&authSource=admin&appName=automart
JWT_SECRET=change-me-in-production
JWT_EXPIRES_IN=7d
CLIENT_ORIGIN=http://localhost:4200
```

### B. Install dependencies
```bash
# backend
cd backend && npm install

# frontend
npm install        # at project root
```

### C. Seed the database
```bash
cd backend
npm run seed        # upsert (idempotent) - safe to re-run
npm run seed:drop   # wipe the collections first, then seed
```
Seeding is *idempotent*: it uses `findOneAndUpdate(..., { upsert: true })` so you can re-run it freely; use
`seed:drop` only when you want a clean slate. **Demo credentials are printed at the end of seeding** (see §6).

### D. Start the API
```bash
cd backend
npm run dev        # nodemon (auto-reload) - recommended for development
npm start          # plain node
```
After connecting to MongoDB the API listens on **`http://localhost:5000`** (or `PORT` from `.env`).

### E. Start the frontend
```bash
npm start          # alias for `ng serve`  (runs on http://localhost:4200)
```
The dev server proxies `/api` and `/uploads` to `http://localhost:5000` (see `proxy.conf.json`).

### F. Production build (frontend)
```bash
npm run build      # `ng build`, outputs to dist/
```

---

## 4. MongoDB Collections (14 total)

> Mongoose collection names default to the **lowercased, pluralized** model name (e.g. `User` -> `users`,
> `Vehicle` -> `vehicles`).

| # | Collection          | Purpose                                 |
|---|---------------------|-----------------------------------------|
| 1 | `vehicles`          | **Unified catalogue** of cars & bikes (`vehicleType` discriminator) |
| 2 | `brands`            | Master list of vehicle brands        |
| 3 | `vehicleoffers`     | Buyer offers placed on a vehicle          |
| 4 | `contactmessages`   | Contact/enquiry form submissions          |
| 5 | `testimonials`      | Customer testimonials                     |
| 6 | `faqs`              | FAQ entries                              |
| 7 | `homepagestats`     | Home hero/stats numbers                   |
| 8 | `users`             | Registered buyers/sellers (wishlist-capable) |
| 9 | `admins`            | Admin login accounts                      |
| 10| `adminnotifications` | Alerts for admins                       |
| 11| `adminsettings`     | Per-admin preferences / Marketplace toggles |
| 12| `comparisons`       | Compare baskets (max 3 per user/session)   |
| 13| `auditlogs`         | Admin action log                           |
| 14| `wishlists`         | User <-> vehicle wishlist mapping          |

> **Heads-up on naming.** Mongoose auto-pluralises model names (lowercased, uncapitalised) for the
> physical collection — e.g. `Vehicle` -> `vehicles`, `VehicleOffer` -> `vehicleoffers`,
> `HomepageStat` -> `homepagestats`. No explicit `collection` option is set on any model. If you prefer
> conventional snake_case collection names, add `{ collection: 'vehicle_offers' }` etc. now.

### Relationships
```
brands        1--|< vehicles      (denormalised brand.NAME on vehicle)
vehicles      1--|< vehicleoffers   (vehicleId = vehicles.id, readable)
users         1--|< wishlists >--1 vehicles
users / guest 1--|< comparison      (max 3 vehicleIds)
admins        1--|< adminsettings, adminnotifications, auditlogs (hasMany)
```

**Design goals:** embedded sub-documents on the vehicle for data that is read-heavy and written once
(features, gallery, seller); separate collections for things that grow independently (offers, messages,
wishlists, audit).

---

## 5. Collection Schemas (Mongoose)

### 5.1 `Vehicle` (`vehicles`) - core, read-heavy
```js
const VEHICLE_TYPES = ['car','bike']
const FUEL_TYPES    = ['Petrol','Diesel','CNG','Electric','Hybrid']
const TRANSMISSIONS = ['Manual','Automatic']
const CAR_BODY_TYPES  = ['SUV','Sedan','Hatchback','MPV','Crossover']
const BIKE_BODY_TYPES = ['Commuter','Scooter','Sport','Street','Cruiser','Adventure','Streetfighter','Tourer','Electric Scooter']
const AVAILABILITIES  = ['available','reserved','sold']
```
| Field          | Type      | Notes                                   |
| -------------- | ----------|-----------------------------------------|
| `id`           | String    | required, **unique** - readable slug e.g. `car-01`, `bike-07` |
| `vehicleType`  | String    | required, `index` - `car` / `bike`        |
| `brand`        | String    | required, `index` - free text             |
| `model`        | String    | required                                 |
| `variant`      | String    | default ''                               |
| `year`         | Number    | required                                 |
| `price`       | Number    | required, `index` - INR in rupees (e.g. 1680000) |
| `rating`       | Number    | 0-5 default 0                            |
| `featured`     | Boolean   | default false, `index`                   |
| `availability` | String    | enum, default `available`, `index`      |
| `fuel`         | String    | enum, required, `index`                  |
| `transmission` | String    | enum default `Manual`                    |
| `mileage`      | Number    | default 0 - km/l (or km/charge for EV)  |
| `kilometers`   | Number    | default 0 - odometer                     |
| `district`     | String    | default '', `index`                      |
| `location`     | String    | default ''                               |
| `owners`       | Number    | default 1                                |
| `bodyType`     | String    | required, **validated per `vehicleType`** |
| `color`        | String    | default ''                               |
| `engineCC`     | Number    | default 0 - bike-only (0 = electric)    |
| `abs`          | Boolean   | default false - bike-only               |
| `engine`       | String    | default '' - "1493 cc"                  |
| `power`        | String    | default '' - "113 bhp"                  |
| `registration` | String    | default '' - "KA 01 MK 8214"            |
| `insurance`    | String    | default '' - "Valid till Mar 2027"      |
| `image`        | String    | default '' - primary/hero image         |
| `images`       | [String]  | default [] - gallery                     |
| `description`  | [String]  | default [] - paragraphs                 |
| `features`     | [FeatureGroup] | default [] - embedded doc           |
| `seller`       | Seller    | default () -> ({}) - embedded doc        |
| `createdAt`/`updatedAt` | Date | | `timestamps:true` |

**Embedded `seller` (SellerSchema, `_id:false`):** `name` (required), `verified` (bool), `hours`,
`location`, `phone`, `whatsapp`, `deals` (number).

**Embedded `features` (FeatureGroupSchema, `_id:false`):** `key` (required, enum
`safety | comfort | exterior | interior | entertainment`), `icon`, `title` (required), `items[]`.

**Compound indexes** on the vehicle:
```js
{ vehicleType:1, brand:1 }    { vehicleType:1, fuel:1 }   { vehicleType:1, district:1 }
{ vehicleType:1, featured:1} { brand:1, model:1, variant:1 }
{ vehicleType:1, price:1} { vehicleType:1, year:-1 }
```

### 5.2 `Brand` (`brands`)
| Field | Type | Notes |
|-------|------|-------|
| `name`| String| required, **unique**, trim |
| `code`| String| monogram e.g. "H" |
| `color`| String| accent hex, default `#2563eb` |
| `logo`| String| CDN URL |
| `type`| String| enum `car`, `bike`, `both`, default `both` |
| `timestamps`| | |

### 5.3 `VehicleOffer` (`vehicleoffers`) - buyer offers
| Field | Type | Notes |
|-------|------|-------|
| `id`     | String   | `O-1008`, sparse unique |
| `vehicleId`| String (ref Vehicle) **required**, `index` | matches readable `vehicles.id` |
| `userId` | ObjectId (ref User), default null | guest allowed |
| `name`   | String **required** | buyer name |
| `phone`  | String **required** | |
| `whatsapp` | String | |
| `offerPrice` | Number **required, min 0** | ₹ |
| `askingPrice`| Number default null | snapshot of vehicle price |
| `message`| String | |
| `status` | String enum `Pending/Accepted/Countered/Rejected`, default `Pending`, `index` |
| `counterPrice` | Number default null | when countered |
| `dealerNote`| String | internal |
Index: `{ status:1, createdAt:-1 }`.

### 5.4 `ContactMessage` (`contactmessages`)
| Field | Type | Notes |
|-------|------|-------|
| `id`    | String | sparse unique, e.g. `C-1006` |
| `name`  | String **required** | |
| `email` | String **required**, lowercase | |
| `phone` | String default '' | |
| `subject`| String default '' | |
| `message`| String **required** | |
| `status`| String enum `New/Replied`, default `New`, `index` | |
| `repliedAt`| Date default null | |
Index `{ status:1, createdAt:-1 }`.

### 5.5 `Testimonial`
| Field | Type | Notes |
|-------|------|-------|
| `name` | String **required** | |
| `role` | String default '' | "Bought Hyundai Creta - Bengaluru" |
| `quote`| String **required** | |
| `rating`| Number default 5, 1-5 | |
| `color`| String default `#4f46e5` | |
| `avatar`| String default '' | |
| `isActive`| Boolean default true, `index` | |

### 5.6 `Faq`
| Field | Type | Notes |
|-------|------|-------|
| `question`| String **required** | |
| `answer` | String **required** | |
| `order`  | Number default 0 | |
| `isActive`| Boolean default true | |
Index `{ order:1 }`.

### 5.7 `Homepage` (homepage stats)
| Field | Type | Notes |
|-------|------|-------|
| `key` | String **required**, unique | e.g. `hero_cars` |
| `value` | String **required** | "500" |
| `label`| String default '' | "Cars" |
| `section`| String enum `hero/section`, default `hero` | |
| `order`| Number default 0 | |

### 5.8 `User` (`users`)
| Field | Type | Notes |
|-------|------|-------|
| `name` | String **required**, trim | |
| `email`| String **required**, unique, lowercase, regex | |
| `phone`| String default '', unique sparse | |
| `passwordHash`| String **required** - **bcrypt-hashed in `pre('save')`** | |
| `role` | String enum `['user']`, default `user` | |
| `emailVerified`| Boolean default false | |
| `phoneVerified`| Boolean default false | |
| `avatar`| String default '' | |
| `preferences`| `{ notifyOffers:true, notifyNewsletter:false }` | |

**Hooks/methods:** `pre('save')` hashes `passwordHash` (bcrypt, 10 rounds); `comparePassword(candidate)`;
`toSafeJSON()` strips `passwordHash`.

### 5.9 `Admin` (`admins`)
| Field | Type | Notes |
|-------|------|-------|
| `name`| String **required** | |
| `email`| String **required**, unique, lowercase, regex | |
| `passwordHash`| String **required** (bcrypt pre-save) | |
| `role`| String enum `['admin','super_admin']`, default `admin` | |
| `isActive`| Boolean default true | |
| `lastLoginAt`| Date default null | |
Same bcrypt hook, `comparePassword`, `toSafeJSON` as `User`.

### 5.10 `AdminNotification`
| Field | Type | Notes |
|-------|------|-------|
| `id`| String sparse unique | e.g. `N-3` |
| `text`| String **required** | |
| `type`| String enum `offer/contact/listing/system`, default `system`, `index` | |
| `adminId`| ObjectId ref `Admin`, default null | null = broadcast |
| `unread`| Boolean default true, `index` | |
| `entityId`| String default '' | related offer/contact id |
Index `{ unread:1, createdAt:-1 }`.

### 5.11 `AdminSetting`
| Field | Type | Notes |
|-------|------|-------|
| `adminId`| ObjectId `ref Admin` **required unique** | |
| `profile`| `{ name, email, phone }` | |
| `notifications`| Map<String,Boolean> default toggles | offerAlerts, contactAlerts, weeklyDigest, listingUpdates |
| `marketplace`| Map<String,Boolean> default toggles | autoApprove, showDriveAwayPrices, whatsappOffers |
| `region`| `{ location:'Karnataka, India', currency:'₹ INR' }` | |
Exports toggle label lists (`NOTIFICATION_TOGGLES`, `MARKETPLACE_TOGGLES`) for use by the API/UI.

### 5.12 `Comparison`
| Field | Type | Notes |
|-------|------|-------|
| `userId`| ObjectId ref User, default null | |
| `sessionId`| String default null | guest basket |
| `vehicleIds`| [String], **max 3** | ref Vehicle |
Unique: `{userId:1}` (partial), `{sessionId:1}` (sparse), validator `array <= 3`.

### 5.13 `AuditLog`
| Field | Type | Notes |
|-------|------|-------|
| `adminId`| ObjectId ref Admin, default null | |
| `action` | String enum `create/update/delete/login/status_change`, required | |
| `resource`| String required, `index` | vehicle/offer/contact/brand |
| `entityId`| String default '' | |
| `payload`| Mixed default {} | |
| `ip`| String default '' | |
Index `{ createdAt:-1 }`.

### 5.14 `Wishlist`
| Field | Type | Notes |
|-------|------|-------|
| `userId`| ObjectId ref User, **required**, `index` | |
| `vehicleId`| String ref Vehicle, **required** | readable `vehicles.id` |
Unique compound `{ userId:1, vehicleId:1 }`.

---

## 6. Seed Data & Demo Accounts

Seeder: `backend/src/seed/seed.js` (run `npm run seed` / `seed:drop`). Data sources under
`backend/src/seed/data/`: `cars.data.js`, `bikes.data.js`, `vehicle-details.data.js`, `brands.data.js`,
`home.data.js`, `admin.data.js`.

| Dataset       | Count | Notes |
|---------------|-------|-------|
| Vehicles (car)| 16    | `type=car` |
| Vehicles (bike)| 16   | `type=bike` |
| Vehicles total  | 32  | some marked `sold` |
| Brands         | 20   | |
| Homepage stats | 8    | |
| Testimonials   | 6    | |
| FAQs           | 6    | |
| Offers         | 8    | `O-1001..O-1008` |
| Contacts       | 6    | `C-1001..C-1006` |
| Notifications  | 3    | `N-1..N-3` |
| Demo users     | 2    | |

**Demo accounts (printed at end of seeding):**
```
Admin  -> admin@automart.in  / admin123    (role: admin)
User   -> ravi.kumar@example.com / password123
User   -> sneha.rao@example.com  / password123
```
Passwords are stored hashed (bcrypt) only.

---

## 7. REST API (implemented, from `server.js`)

All JSON unless noted. Auth/JWT is **not yet enforced** on any route (see §10).

### Public
| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/health` | `{ status:'ok', service:'automart-api' }` |
| GET | `/api/vehicles` | list with filters + pagination (see §7.1) |
| GET | `/api/vehicles/:id` | full detail (look-up by readable `id`) |
| GET | `/api/brands` | all brands sorted by name |
| GET | `/api/facets?type=car\|bike` | distinct filter options for sidebar (see §7.2) |
| GET | `/api/testimonials` | active testimonials |
| GET | `/api/faqs` | active FAQs ordered by `order` |
| GET | `/api/homestats?section=hero\|section` | homepage stats |
| POST| `/api/offers` | create offer (guest allowed; needs `vehicleId,name,phone,offerPrice`) |
| POST| `/api/contacts` | create contact message (needs `name,email,message`) |

### Admin `/api/admin/*`
| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/admin/dashboard` | `totalCars,totalBikes,totalVehicles,pendingOffers,newContacts` |
| GET | `/api/admin/offers` | offers with joined vehicle label, latest first |
| PATCH| `/api/admin/offers/:id` | update `status` and/or `counterPrice` |
| GET | `/api/admin/contacts` | contacts latest first |
| PATCH| `/api/admin/contacts/:id` | update `status` |
| POST| `/api/admin/vehicles` | **multipart** create (optional attribute; auto id `car-##`/`bike-##`) |
| PUT | `/api/admin/vehicles/:id` | **multipart** update (replaces image if present) |
| DELETE| `/api/admin/vehicles/:id` | deletes document + its uploaded image (if any) |

Lookups for PATCH/DELETE are by readable `id` (and also `_id` if the param is a 24-char hex ObjectId).

### 7.1 List/filter/pagination params (`GET /api/vehicles`)
```
type, brand, model, q, minPrice, maxPrice, fuel, transmission, bodyType,
district, color, owners, year, abs, engineCcMin, engineCcMax, mileageMax,
featured, sortBy, page, limit
```
- Repeated params (e.g. `?brand=A&brand=B`, `?owners=1&owners=2`) are collected into MongoDB `$in` queries.
- `abs`/`featured` treated as booleans; `engineCcMin/Max` (>= / <=), `mileageMax` (<=),
  `minPrice/maxPrice` on `price`, `minYear/maxYear` on `year`.
- `q` does a case-insensitive regex across `brand`, `model`, `variant`, `district`.
- `sortBy`: `price_asc`, `price_desc`, `year_desc`, `mileage_desc`, else `createdAt` desc.
- `page`/`limit` implement **skip + limit** pagination.
- Response: `{ items, total, page, limit, totalPages }`. Items omit heavy fields (`description`,
  `features`, `seller`, `images`) except on `/api/vehicles/:id`.

### 7.2 Facets endpoint (`GET /api/facets?type=car|bike`)
Runs `distinct()` queries + a `$min/$max` price aggregate in parallel, returning:
`brands`, `models`, `years`, `fuels`, `transmissions`, `owners`, `bodyTypes`, `districts`, `colors`,
`priceMin`, `priceMax`. This powers the filter sidebars without shipping the whole catalogue.

---

## 8. Image Upload Flow (Admin CRUD)
1. Angular admin form sets `multipart/form-data`.
2. `POST api/admin/vehicles`/`PUT api/admin/vehicles/:id` run `upload.single('image')` (Multer disk
   storage, 8MB limit, `image/*` only).
3. File written to `backend/uploads/` with a generated name `v-<timestamp>-<rand>.<ext>`.
4. Vehicle `image` is set to `/uploads/<filename>`.
5. `/uploads` is served as static by Express, and the Vite dev server proxies it.
6. On update/delete the old uploaded image is removed from disk (`cleanUpload`).

> The client compresses/resizes admin-uploaded images (canvas -> max 1600px, JPEG q0.8) before upload.

---

## 9. Frontend - server-side listing architecture
- **CatalogService** - lazy-loads the full catalogue (walking all API pages) into in-memory signals.
  Used by admin grids, wishlist, compare, vehicle detail, home featured.
- **CarsFilterService / BikesFilterService** - **server-side paginated** (20/page) listings. Only the
  current page is fetched per filter/sort/keyword/page change; stale responses dropped (request sequence);
  300 ms debounce on keyword typing. They load facets from `/api/facets`.
- Active-filters, search-bar, pagination bind to these signals.

Angular 20 uses **signals + computed** (`get effect`) throughout; in templates signals are invoked as
`signal()`.

---

## 10. Security & Gaps (current)
- `passwordHash` is bcrypt-hashed and hidden from JSON.
- `JWT_SECRET` / `jsonwebtoken` installed but **no auth middleware or `/api/auth/*` routes yet**; the
  `admin/*` routes are currently **public** (login page is cosmetic). Securing the admin with a real
  login + route guard is the next step.
- Add rate-limiting, CORS tightening and input validation before production.

---

## 11. NPM scripts cheat-sheet

```bash
# Frontend
npm run build        # production build (dist/, `ng build`)
npm start            # ng serve on :4200

# Backend
cd backend
npm run dev          # nodemon, :5000
npm start            # node
npm run seed         # idempotent upsert
npm run seed:drop    # wipe + seed
```

> Keep the two servers on separate terminals: **backend (`:5000`)** first, then **frontend (`:4200`)**.

---

## 12. Appendix - model->collection map & enum reference

| Model | Collection (default) | Primary key |
|-------|----------------------|-------------|
| Vehicle | vehicles | `id` (unique string) |
| User    | users    | `_id`, `email` unique |
| Admin   | admins   | `_id`, `email` unique |
| Brand     | brands          | `name` unique |
| VehicleOffer | vehicleoffers | `id`, `_id` |
| ContactMessage | contactmessages | `id`, `_id` |
| Testimonial | testimonials | `_id` |
| Faq       | faqs        | `_id` |
| HomepageStat | homepagestats | `key` unique |
| AdminNotification | adminnotifications | `id`, `_id` |
| AdminSetting | adminsettings | `adminId` unique |
| Comparison  | comparisons | `_id` |
| AuditLog    | auditlogs  | `_id` |
| Wishlist    | wishlists   | `_id` |

**Enums:**
```js
VEHICLE_TYPES    = ['car','bike']
FUEL_TYPES       = ['Petrol','Diesel','CNG','Electric','Hybrid']
TRANSMISSIONS    = ['Manual','Automatic']
CAR_BODY_TYPES   = ['SUV','Sedan','Hatchback','MPV','Crossover']
BIKE_BODY_TYPES  = ['Commuter','Scooter','Sport','Street','Cruiser','Adventure','Streetfighter','Tourer','Electric Scooter']
AVAILABILITIES   = ['available','reserved','sold']
OFFER_STATUSES   = ['Pending','Accepted','Countered','Rejected']
CONTACT_STATUSES = ['New','Replied']
```