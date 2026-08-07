# AutoMart — Database Design (MongoDB + Node.js)

> Source of truth: reverse-engineered from the Angular front-end (`src/app/features`) and its models/data files.
> This document defines the MongoDB collections, document schemas (Mongoose format for a **Node.js + Express** API), field types, enums, indexes, relationships, and the REST endpoints the Node.js backend should expose.

---

## 1. Project Overview (what AutoMart does)

AutoMart is a **used car & bike marketplace for Karnataka, India**. The front-end is static (Angular + dummy data); the backend will be **Node.js (Express + Mongoose) API** backed by **MongoDB**.

### User-facing (public) flows
- **Home**: hero, featured cars & bikes, popular brands, stats, why-choose-us, testimonials, FAQs, search box.
- **Cars listing**: filter (brand, fuel, transmission, body type, colors, price, year, owners, district), search, pagination.
- **Bikes listing**: filter (brand, fuel, engine CC, ABS, mileage, price, year, owners, district), search, pagination.
- **Vehicle detail**: gallery, specs, description, feature groups, seller info, make-an-offer form.
- **Search page**: keyword, type (car/bike), getBrand, budget, fuel.
- **Compare**: compare up to 3 vehicles.
- **Wishlist**: saved cars & bikes (per user).
- **About / Contact**: contact/ enquiry form.
- **Auth**: user register + login (email + password).

### Admin (protected) pages
- **Login** (admin email + password).
- **Dashboard**: KPIs (total cars/bikes), pending offers, new contacts, recent offers, brand bar chart.
- **Vehicles / Cars / Bikes management**: list, search, add/edit/delete (CRUD), availability status.
- **Offers**: list offer status (Pending / Accepted / Countered / Rejected), change status.
- **Contacts**: view and mark contact enquiries as Replied.
- **Settings**: admin profile, notification toggles, security (change password), marketplace toggles, location/currency.

---

## 2. MongoDB Collections (21 total)

Two symmetric collections keep the vehicle data clean with documents that fit the UI filters exactly.

| # | Collection               | Purpose                                             |
|---|--------------------------|-----------------------------------------------------|
| 1 | `users`                  | Registered buyers/sellers; holds password + wishlist |
| 2 | `admins`                 | Admin login accounts                            |
| 3 | `brands`                 | Master list of vehicle brands                 |
| 4 | `vehicles`               | **Unified catalogue** of cars & bikes (discriminated by `type`) |
| 5 | `vehicle_offers`         | Buyer offers placed on a vehicle                       |
| 6 | `contact_messages`       | Contact/enquiry form submissions                      |
| 7 | `testimonials`           | Customer testimonials                              |
| 8 | `faqs`                   | FAQ entries                                      |
| 9 | `statistics_home`        | Home hero/section counters                        |
| 10 | `wishlists`              | User ↔ vehicle wishlist mapping                   |
| 11 | `comparison_sessions`    | Compare-session per anonymous/user (max 3)        |
| 12 | `admin_notifications`    | Alerts for admins                                |
| 13 | `admins_settings`        | Per-admin preferences                       |
| 14 | `products` / `banners`   | Homepage content blocks / featured carousel       |
| 15 | `site_content`           | Generic CMS text (why-choose-us, footer, hero)    |
| 16 | `audit_logs`             | Admin actions log (optional)                     |

> The two most important collections are **`vehicles`** (the catalogue) and **`offers`**. Everything else is supporting/user/has-configuration data.

---

## 3. Collection Schemas (Mongoose JSON)

### 3.1 `users`
App users (buyers/sellers on the public site).

```json
{
  "_id":   "ObjectId",
  "name":  { "type": "String", "required": true, "trim": true },
  "email": { "type": "String", "required": true, "unique": true, "lowercase": true },
  "phone": { "type": "String", "required": true, "unique": true },
  "passwordHash": { "type": "String", "required": true },
  "role":  { "type": "String", "enum": ["user"], "default": "user" },
  "emailVerified":  { "type": "Boolean", "default": false },
  "phoneVerified":  { "type": "Boolean", "default": false },
  "avatar":  { "type": "String", "default": "" },
  "preferences": { "notifyOffers": true, "notifyNewsletter": false },
  "createdAt": { "type": "Date", "default": "Date.now" },
  "updatedAt": { "type": "Date", "default": "Date.now" }
}
```
Indexes: `email` (unique), `phone` (unique).

---

### 3.2 `admins` — Admin accounts

| Field | Type | Notes |
|-------|------|-------|
| `name` | String | Admin display name (e.g. "Admin User") |
| `email` | String | **unique**, login identifier (e.g. `admin@automart.in`) |
| `passwordHash` | String | bcrypt hash |
| `role` | String | `enum: ["admin","super_admin"]`, default `admin` |
| `isActive` | Boolean | allow login |
| `lastLoginAt` | Date | |
| `createdAt`/`updatedAt` | Date | |

---

### 3.3 `vehicle` — Unified catalogue of cars & bikes  ⭐ core collection

Uses MongoDB **discriminator-like** `type` field. Fields are typed per `Car`/`Bike` model + rich `VehicleDetail` (all in the Angular front-end).

| Field            | Type        | Car | Bike | Required | Notes |
| ---------------- | ----------- | --- | ---- | -------- | ----- |
| `id`/`_id`        | ObjectId/Str| ✓  | ✓   | ✓        | slug/ref e.g. `car-01` |
| `vehicleType`     | String enum | `car` | `bike` | ✓       | discriminator |
| `brand`           | String      | ✓   | ✓     | ✓        | ref to brands.name(denormalised) |
| `model`           | String      | ✓   | ✓     | ✓        | |
| `variant`         | String      | ✓   | ✓     | ✓        | |
| `year`            | Number      | ✓   | ✓     | ✓        | |
| `priceInLakh`     | Number      | ✓   | ✓     | ✓        | ₹ value in lakhs (16.8) |
| `fuel`            | enum        | ✓   | ✓     | ✓        | `Petrol|Diesel|CNG|Electric|Hybrid` |
| `transmission`    | String      | ✓   | ✓     | ✓ (derived for bike) | `Manual|Automatic` |
| `mileage`         | Number      | ✓   | ✓ (bike: km/l or km/charge) | ✓ | |
| `kilometers`      | Number      | ✓   | ✓     | ✓        | odometer |
| `district`        | String      | ✓   | ✓     | ✓        | Karnataka district |
| `location`        | String      | ✓   | —     | ✓        | city/area display |
| `owners`          | Number      | ✓   | ✓     | ✓        | |
| `bodyType`        | String      | ✓   | ✓     | ✓        | car: SUV/Sedan/…; bike: Commuter/Scooter/… |
| `color`           |                          | ✓ | ✓ | ✓ |
| `image`           | String (URL)| ✓   | ✓     | ✓        | primary/hero image |
| `images`          | String[]    | ✓   | ✓     | ✓        | gallery (detail page) |
| `engineCC`        | Number      | —   | ✓     | —        | 0 for electric |
| `abs`             | Boolean     | —   | ✓     | —        | |
| `engine`          | String      | ✓   | ✓     | ✓        | display "1493 cc" |
| `power`           | String      | ✓   | ✓     | ✓        | "113 bhp" |
| `registration`    | String      | ✓   | ✓     | ✓        | "KA 01 MK 8214" |
| `insurance`       | String      | ✓   | ✓     | ✓        | "Valid till Mar 2027" |
| `availability`    | String      | ✓   | ✓     | ✓        | `available|reserved|sold` |
| `featured`        | Boolean     | ✓   | ✓     | ✓        | show on home |
| `rating`          | Number      | ✓   | ✓     | ✓        | 0–5 |
| `description`     | Array[String] | ✓ | ✓   | ✓        | paragraphs |
| `features`        | `FeatureGroup[]` | ✓ | ✓ | ✓      | key/icon/title + `items[]` |
| `seller`          | `SellerInfo` | ✓  | ✓     | ✓        | embedded doc (see §3.4) |
| `createdAt`/`updatedAt` | Date  | | | | |

**Enums:**
- `fuel`: `['Petrol','Diesel','CNG','Electric','Hybrid']`
- `transmission`: `['Manual','Automatic']`
- `carBodyType`: `['SUV','Sedan','Hatchback','MPV','Crossover']`
- `bikeBodyType`: `['Commuter','Scooter','Sport','Street','Cruiser','Adventure','Touring','Electric Scooter']`
- `availability`: `['available','reserved','sold']`

Indexes (for listing filters): `vehicleType`,`brand`,`year`,`fuel`,`transmission`,`bodyType`,`district`,`priceInLakh`,`featured`.

---

### 3.4 Embedded subdocuments (inside `vehicles`)

**`seller` (SellerInfo):**
```json
{
  "name": "AutoMart Certified",
  "verified": true,
  "hours": "9:00 AM – 8:00 PM",
  "location": "MG Road, Bengaluru",
  "phone": "+91 98765 43210",
  "whatsapp": "919876543210",
  "deals": 1200
}
```

**`features` (FeatureGroup[]):**
```json
{
  "key": "safety | comfort | exterior | interior | entertainment",
  "icon": "shieldCheck",
  "title": "Safety",
  "items": ["6 Airbags", "ABS with EBD"]
}
```

**`images[]`:** array of CDN image URLs.

---

### 3.5 `vehicleOffers` — Buyer offers on a vehicle ⭐

| Field           | Type     |                                   |
|-----------------|----------|---|
| `id`            | String/Obj| e.g. `O-1008` |
| `vehicleId`     | ref `Vehicles._id` | string id |
| `userId`        | ref `users._id` / null | guest offer allowed |
| `name`          | String   | buyer name (offer form) |
| `phone`         | String   | |
| `whatsapp`      | String   | (optional) |
| `offerPrice`    | Number   | ₹ amount |
| `askingPrice`   | Number   | snapshot of vehicle price at offer time |
| `message`       | String   | |
| `status`        | String   | `['Pending','Accepted','Countered','Rejected']` |
| `counterPrice`  | Number   | set when seller counters |
| `dealerNote`    | String   | internal note |
| `date`          | Date   | |
| timestamps | | |

Indexes: `status`,`vehicleId`,`createdAt`.

---

### 3.6 `contactMessages` — Contact/enquiry form

| Field        | Type    | Notes |
|--------------|---------|-------|
| `id`         | Str/Obj | e.g. `C-1006` |
| `name`       | String  | |
| `email`      | String  | |
| `phone`      | String  | |
| `subject`    | String  | e.g. "Test drive booking" |
| `message`    | String  | |
| `status`     | String  | `New|Replied` |
| `createdAt`  | Date    | |

---

### 3.7 `brands`

| Field   | Type    | Notes                 |
|---------|---------|-----------------------|
| `name`  | String  | unique, e.g. "Hyundai" |
| `code`  | String  | monogram "H" |
| `color` | String  | hex accent |
| `logo`  | String? | CDN URL           |
| `type`  | String  | `car|bike|both` |

---

### 3.8 `testimonials`

| Field   | Type    | Notes                    |
|---------|---------|--------------------------|
| `-id`   | ObjId   | |
| `name`  | String  | "Ravi Kumar" |
| `role`  | String  | "Bought Hyundai Creta · Bengaluru" |
| `quote` | String  | long text |
| `rating`| Number  | 1–5 |
| `color` | String  | hex avatar accent |
| `avatar`| String  | image URL (optional) |
| `isActive` | Boolean | show on home |

---

### 3.9 `faqs`

| Field      | Type    | Notes                                  |
|------------|---------|----------------------------------------|
| `question` | String  |                                        |
| `answer`   | String  |                                        |
| `order`    | Number  | sort                                   |
| `isActive` | Boolean |                                        |

---

### 3.10 `homepageStats` — Homepage hero/band numbers

| Field   | Type  | Notes                       |
|---------|-------|-----------------------------|
| `key`   | String| `hero_cars`,`hero_bikes`… |
| `value` | String| e.g. "500"                  |
| `label` | String| "Cars"                    |
| `section`| String| `hero`/`section`            |
| `order` | Number|                            |

*(These were hardcoded in the front-end: 500+ cars, 300+ bikes, 25+ brands, 31 districts.)*

---

### 3.11 `wishlists` — user ↔ vehicle

| Field       | Type   | Notes                                  |
|--------------|--------|----------------------------------------|
| `userId`    | ref users |                                        |
| `vehicleId` | ref vehicles |                                     |
| `createdAt` | Date  |                                        |

Index: compound unique `{ userId, vehicleId }`.

---

### 3.12 `comparison` — compare basket (max 3)

| Field       | Type        |                                                   |
|--------------|-------------|---------------------------------------------------|
| `sessionId` / `userId` | String | anonymous or logged-in           |
| `vehicleIds`| [String]    | up to 3 `vehicles._id`          |
| `updatedAt` | Date        |                                                            |

*(Note: comparison is client-side in the current app, so this is optional for MVP.)*

---

### 3.13 `adminNotifications`

| Field    | Type    | Notes                     |
|----------|---------|---------------------------|
| `text`   | String  | "New offer received on …" |
| `type`   | String  | `offer|contact|listing` |
| `time`   | Date    | display when relative      |
| `unread` | Boolean |                            |
| `adminId`| ref     | broadcast if unset        |

---

### 3.14 `adminSettings` (single doc per admin or site)

Embedded toggles & prefs:
```json
{
  "profile": { "name": "Admin User", "email": "admin@automart.in", "phone": "+91 98765 43210" },
  "notifications": { "offerAlerts": true, "contactAlerts": true, "weeklyDigest": false, "listingUpdates": true },
  "marketplace":  { "autoApprove": false, "showDriveAwayPrices": true, "whatsappOffers": true },
  "region": { "location": "Karnataka, India", "currency": "INR" }
}
```

---

### 3.15 `auditLogs` (recommended, admin CRUD)

| Field     | Type    | Notes |
|-----------|---------|-------|
| `adminId` | ref     | |
| `action`  | String  | `create/update/delete` |
| `resource`| String  | `vehicle/offer/contact` |
| `entityId`| String  | |
| `payload` | Mixed   | |
| `createdAt`| Date   | |

---

### 3.16 `banners` / `homeFeatured` (optional)

Featured vehicles shown on the home carousel — subset flagged with `featured: true` in `vehicles`, so no separate table strictly needed. If you want a manual carousel order, add a lightweight `banners` collection (`title`, `subtitle`, `imageUrl`, `ctaLink`, `href`, `order`).

---

## 4. Entity-Relationship map

```
admins 1───< adminSettings  (per-admin prefs)
 admins 1───< auditLogs
users  1───< wishlists >───1 vehicles
users  1───< vehicleOffers
vehicles 1───< vehicleOffers
vehicles 1───< wishlists
vehicle 1───< images (embedded array)
vehicle 1───< features (embedded array of groups)
vehicle 1───< seller (embedded)
brands 1───< vehicles (denormalised brand.name)
users / session ──< comparison (max 3)
```

**Key rules:**
- Vehicle **features, images, and seller are embedded** (read-heavy, dit by id — perfect for Mongo embedded docs).
- **Offers, messages, wishlists are separate collections** because they grow and are written independently.
- **Brand counts, homepage stats** are denormalised/cached.

---

## 5. Node.js API Routes (Express + Mongoose)

```txt
Auth
  POST   /api/auth/register
  POST   /api/auth/login
  GET    /api/auth/me         (JWT-protected)
  POST   /api/auth/refresh

Public
  GET    /api/brands                  → brand chips
  GET    /api/vehicles                → catalogue list (w/ filter+sort+pagination)
  GET    /api/vehicles/:id            → full detail (incl. features, gallery, seller)
  GET    /api/vehicles?featured=true  → front-page picks
  GET    /api/search                  → global keyword search on brand/model/variant/tags
  GET    /api/testimonials
  GET    /api/faqs
  GET    /api/home                   (hero, stats, why-us, sections)

Acquire
  POST   /api/offers                 (submit an offer → auth optional)
  GET    /api/vehicles/:id/similar
  GET    /api/wishlist               (auth)
  PUT    /api/wishlist/:id           (add/remove)

Admin  (JWT, `isAdmin`)
  GET    /api/admin/dashboard         (totals, brand counts, recent offers/contacts)
  GET/POST/PATCH/DELETE  /api/admin/vehicles/:id
  GET/PATCH /api/admin/offers
  GET/PATCH /api/admin/contacts
  GET/PUT    /api/admin/settings
  GET      /api/admin/notifications
  POST     /api/admin/brands
```

**Query params for the catalogue endpoint** (mirrors the Angular filter services):
```
type=car|bike, brand, q, minPrice, maxPrice, fuel, transmission, bodyType,
district, color, minYear, maxYear, owners, abs (bikes), engineCC (bikes),
featured, sort (=price_asc|price_desc|year|km), page, limit
```

---

## 6. MongoDB / Mongoose implementation notes

- **Timestamps**: add `{ timestamps: true }` to vehicles, offers, messages, testimonials, prefers.
- **Sanitisation**: use `bcrypt` for `passwordHash`; **never** return hashes.
- **Enums via mongoose**: use `enum` on enum fields + app validation.
- **Default data seeding**: write a seed script mapping the existing Angular static arrays (`cars.data.ts`, `bikes.data.ts`, `vehicle-details.data.ts`) into `vehicles`.
- **Denormalization**: store `brandName` on the vehicle for search/sort speed; avoid `$lookup` on brand for list queries.
- **Regions**: `district` indexed; there are 31 Karnataka districts.
- **Currency**: store `price` in a single unit (₹ Lakh, matching the front-end) to avoid float errors; convert only at render.

---

## 7. Migration / seed source map (Angular → Mongo)

| Angular file                             | Mongo collection           |
|------------------------------------------|----------------------------|
| `cars/models/car.model.ts` + `cars.data` | `vehicles` (type=car)      |
| `bikes/models/bike.model.ts` + `bikes.data` | `vehicles` (type=bike) |
| `vehicle-details/…/vehicle-detail.model` + `vehicle-details.data` | adds `./images`,`features`,`seller`,availability to `vehicles` |
| `home/data/vehicles.data.ts` (featured)   | `vehicles.featured = true`  |
| `home/data/brands.data.ts`                | `brands`                    |
| `home/data/home.data.ts` (stats/testimonials/faq/why-us) | `homepageStats`,`testimonials`,`faqs`,`siteContent` |
| `contact.page.ts` form                    | `contactMessages`           |
| `auth` register/login                     | `users` / `admins`          |
| `admin/data/admin.data.ts` (offers/contacts/notifications) | `vehicleOffers`,`contactMessages`,`adminNotifications` |
| `compare.service.ts`                      | `comparison` (optional)      |
| `wishlist` logic                          | `wishlists`                 |

---

> **Design goals:** 1 collection per top-level entity, embedded sub-docs for vehicle details, filters indexed for the exact listing pages, references where the data grows independently (offers/messages/wishlist), and denormalized fields to keep the heavy list reads fast in MongoDB.