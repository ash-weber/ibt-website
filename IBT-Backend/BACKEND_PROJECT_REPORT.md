# IBT Website — Backend Project Report

> **Project:** I-BACUS-TECH (IBT) Corporate Website Backend  
> **Report Date:** April 28, 2026  
> **Stack:** Node.js · TypeScript · Express.js v5 · Prisma ORM v7 · PostgreSQL · Socket.io · Zod · Multer

---

## Table of Contents

1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Architecture & Design Patterns](#architecture--design-patterns)
5. [Database Schema](#database-schema)
6. [API Modules — Detailed Analysis](#api-modules--detailed-analysis)
   - [Authentication](#1-authentication-module)
   - [Blogs](#2-blog-module)
   - [Services](#3-service-module)
   - [Lab Projects](#4-lab-project-module)
   - [Branches & Members](#5-branch--member-module)
   - [Partners](#6-partner-module)
   - [Clients](#7-client-module)
   - [Testimonials](#8-testimonial-module)
   - [Stats](#9-stat-module)
   - [Contacts](#10-contact-module)
   - [Social Links](#11-social-link-module)
   - [Terms](#12-terms-module)
   - [Settings](#13-settings-module)
   - [Audit Logs](#14-audit-log-module)
   - [File Uploads](#15-file-upload-module)
   - [Dashboard](#16-dashboard-module)
   - [Public API](#17-public-api-module)
7. [Middleware Layer](#middleware-layer)
8. [Real-Time (Socket.io)](#real-time-socketio)
9. [Utility Layer](#utility-layer)
10. [Validation Layer (Zod)](#validation-layer-zod)
11. [Configuration & Environment](#configuration--environment)
12. [Security Analysis](#security-analysis)
13. [API Route Summary Table](#api-route-summary-table)
14. [Observations & Recommendations](#observations--recommendations)

---

## Overview

The IBT Website backend is a **RESTful API server** built for managing the complete content of the I-BACUS-TECH corporate website. It supports two distinct consumer audiences:

- **Admin / CMS Panel** — Authenticated users (ADMIN / MANAGER roles) who manage all website content.
- **Public Website** — Unauthenticated visitors consuming published content via the Public API.

The backend follows a clean **layered architecture**: Routes → Controllers → Services → Prisma ORM → PostgreSQL. All mutation operations are tracked through a built-in **audit log system**. Site settings changes are propagated in real-time via **Socket.io**.

---

## Technology Stack

| Category | Technology | Version |
|---|---|---|
| Runtime | Node.js | Current LTS |
| Language | TypeScript | ^6.0.2 |
| Framework | Express.js | ^5.2.1 |
| ORM | Prisma | ^7.5.0 |
| Database | PostgreSQL | — |
| Postgres Adapter | `@prisma/adapter-pg` | ^7.5.0 |
| Schema Validation | Zod | ^4.3.6 |
| Authentication | JSON Web Tokens (jsonwebtoken) | ^9.0.3 |
| Password Hashing | bcrypt | ^6.0.0 |
| File Uploads | Multer | ^2.1.1 |
| Real-Time | Socket.io | ^4.8.3 |
| Dev Server | tsx watch | ^4.21.0 |
| Environment | dotenv | ^17.3.1 |
| Type Safety | TypeScript types for all libs | — |

---

## Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma          # Database schema (15 models, 6 enums)
│   └── seed.ts                # Database seeder
├── src/
│   ├── server.ts              # App entry point — Express + Socket.io init
│   ├── config/
│   │   └── env.ts             # Typed environment variables
│   ├── lib/
│   │   └── prisma.ts          # PrismaClient singleton (with pg adapter)
│   ├── types/
│   │   └── settings.ts        # Setting key constants and SettingKey type
│   ├── middlewares/
│   │   ├── auth.middleware.ts        # JWT verification → req.user
│   │   ├── role.middleware.ts        # Role-based authorization
│   │   ├── multer.middleware.ts      # File upload handling (category-aware)
│   │   ├── validate.middleware.ts    # Zod body validation
│   │   └── error.middleware.ts       # Global error handler
│   ├── utils/
│   │   ├── jwt.ts             # generateToken / verifyToken
│   │   ├── httpError.ts       # Status-coded error factory
│   │   ├── asyncHandler.ts    # Async route wrapper
│   │   ├── apiResponse.ts     # Standardized response builder
│   │   └── logAction.ts       # Audit log writer (sanitizes passwords)
│   ├── realtime/
│   │   ├── socket.ts          # Socket.io server setup + emitters
│   │   └── socket.events.ts   # Event name constants + payload types
│   ├── validators/            # Zod schemas — one file per module
│   ├── controllers/           # HTTP handlers — thin (call services)
│   ├── services/              # Business logic — one file per module
│   └── routes/                # Express routers — one file per module
├── uploads/                   # Static file storage (served at /uploads/*)
│   ├── blogs/, clients/, labs/, members/, partners/, services/, testimonials/
├── generated/
│   └── prisma/                # Auto-generated Prisma Client
├── package.json
├── tsconfig.json
└── prisma.config.ts
```

---

## Architecture & Design Patterns

### Layered Architecture (MVC-S)

```
Request → Router → Middleware → Controller → Service → Prisma → PostgreSQL
                                                    ↓
                                         AuditLog (side-effect)
                                                    ↓
                                        Socket.io Emit (if realtime key)
```

- **Routes** register HTTP verbs, apply middleware chains, and delegate to controllers.
- **Middlewares** handle cross-cutting concerns (auth, validation, errors, rate of upload).
- **Controllers** are thin — they parse request data and pass it to services.
- **Services** contain all business logic: ordering algorithms, status rules, existence checks, conflict detection, and audit logging.
- **Prisma** is the only database abstraction layer; raw SQL is avoided except for a single health-check `SELECT 1`.

### Order Management Pattern

Every ordered entity (`Branch`, `Member-in-Branch`, `Partner`, `Client`, `Testimonial`, `Stat`, `Service`, `LabProject`) uses a **contiguous integer order** system managed transactionally:

- **Create:** shifts all items at `order >= desiredOrder` up by 1, then inserts.
- **Update:** uses a 3-step transaction — temporarily set to 0, shift affected range, then set final order.
- **Delete:** shifts all items at `order > deletedOrder` down by 1 to close the gap.

This ensures order is always gapless and collision-free across concurrent operations.

### Pagination Pattern

All list endpoints support **optional pagination** using a consistent pattern:
- If neither `page` nor `limit` is provided → returns the full list.
- If both are provided → returns paginated result with a `meta` object: `{ page, limit, total, totalPages, hasNext, hasPrev }`.
- Both must be provided together (validated via a Zod `.refine()` rule).

### Audit Logging Pattern

Every `CREATE`, `UPDATE`, and `DELETE` operation across all modules calls `logAction()`. The `logAction` utility:
1. Sanitizes `oldData` and `newData` to strip passwords.
2. Writes to the `AuditLog` table, linking optionally to the authenticated user.
3. Fails silently (`.catch(console.error)`) to prevent audit failures from breaking the main request.

---

## Database Schema

The database is managed by Prisma with PostgreSQL. It contains **15 models** and **6 enums**.

### Enums

| Enum | Values |
|---|---|
| `Role` | `USER`, `MANAGER`, `ADMIN` |
| `BlogStatus` | `DRAFT`, `PUBLISHED`, `ARCHIVED` |
| `BranchType` | `HEADQUARTERS`, `REGIONAL`, `INTERNATIONAL` |
| `LabStatus` | `ONGOING`, `COMPLETED`, `ARCHIVED` |
| `ContactType` | `PHONE`, `EMAIL`, `ADDRESS` |
| `AuditAction` | `CREATE`, `UPDATE`, `DELETE`, `LOGIN` |

### Models

| Model | Key Fields | Notes |
|---|---|---|
| `User` | `id`, `email`, `password`, `name`, `role`, `isActive` | Auth accounts; roles enforced at middleware |
| `Blog` | `id`, `title`, `slug`, `content`, `imageUrl`, `status`, `featured`, `category`, `publishedAt` | Slug unique index; status/featured business rules enforced in service |
| `Service` | `id`, `title`, `slug`, `description`, `imageUrl`, `tags[]`, `order` | `@@index([order])` |
| `LabProject` | `id`, `title`, `slug`, `description`, `content?`, `imageUrl?`, `gallery[]`, `tags[]`, `techStack[]`, `projectUrl?`, `repoUrl?`, `status`, `featured`, `order?` | Rich project data with gallery and tech stack arrays |
| `Branch` | `id`, `name`, `location`, `type`, `order` | `@@unique([order])`; relations to `BranchMember` |
| `Member` | `id`, `name`, `role`, `avatarUrl`, `email`, `phone` | Unique email + phone; M:M with Branch via `BranchMember` |
| `BranchMember` | `id`, `branchId`, `memberId`, `order` | Junction table; `@@unique([branchId, order])` |
| `Partner` | `id`, `name`, `logoUrl`, `website?`, `order` | `@@index([order])` |
| `Client` | `id`, `name`, `logoUrl`, `order` | `@@index([order])` |
| `Testimonial` | `id`, `name`, `content`, `role?`, `company?`, `avatarUrl?`, `order` | `@@index([order])` |
| `Stat` | `id`, `label`, `value`, `category?`, `order` | Flexible key-value stats with category grouping |
| `Contact` | `id`, `type`, `value`, `order` | Typed contact info (PHONE/EMAIL/ADDRESS) |
| `SocialLink` | `id`, `platform`, `logoUrl`, `url`, `order` | `@@index([order])` |
| `Terms` | `id`, `content` | Most recent is the active terms |
| `Setting` | `id`, `key` (unique), `value` (Json) | Key-value store; schema validated per-key |
| `AuditLog` | `id`, `userId?`, `action`, `entity`, `entityId`, `oldData?`, `newData?`, `createdAt` | `@@index([userId], [entity], [entityId])` |

---

## API Modules — Detailed Analysis

All routes are prefixed with `/api/<resource>/v1`.

---

### 1. Authentication Module

**Route prefix:** `/api/auth/v1`  
**Files:** `auth.routes.ts`, `auth.controller.ts`, `auth.service.ts`, `auth.validator.ts`

#### Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/login` | Public | Login with email + password |

#### Business Logic

- Looks up user by email. If not found, logs a failed `LOGIN` audit event and throws 401.
- Compares password with bcrypt. If mismatch, logs a failed audit and throws 401.
- Checks `isActive` flag; inactive users get a 403.
- On success, generates a signed JWT with `{ sub: userId, role }` payload.
- Logs a successful `LOGIN` audit event.
- **Security:** The failed-login timing is consistent whether user exists or not (mitigates user enumeration).

#### Token Structure

```json
{
  "sub": "<userId>",
  "role": "ADMIN | MANAGER | USER",
  "iat": ...,
  "exp": ...
}
```

---

### 2. Blog Module

**Route prefix:** `/api/blogs/v1`  
**Files:** `blog.routes.ts`, `blog.controller.ts`, `blog.service.ts`, `blog.validator.ts`

#### Endpoints

| Method | Path | Auth | Roles | Description |
|---|---|---|---|---|
| `GET` | `/` | Public | — | List all blogs (filterable, paginated) |
| `GET` | `/slug/:slug` | Public | — | Get a single blog by slug |
| `POST` | `/` | ✅ | ADMIN, MANAGER | Create a new blog |
| `PATCH` | `/:blogId` | ✅ | ADMIN, MANAGER | Update a blog |
| `DELETE` | `/:blogId` | ✅ | ADMIN, MANAGER | Delete a blog |

#### Business Logic & Rules

1. **Status ↔ Featured constraint:** `featured: true` is only allowed when `status === PUBLISHED`.
2. **publishedAt resolution:**
   - On `CREATE`: if status is `PUBLISHED` and no `publishedAt` is provided, defaults to `now()`. If status is not `PUBLISHED`, `publishedAt` is forced to `null`.
   - On `UPDATE`: if transitioning to `PUBLISHED` without an explicit `publishedAt`, defaults to `now()` (unless already published).
3. **Unique slug enforcement:** Prisma `P2002` errors are caught and surfaced as HTTP 409.
4. **Full-text search** across `title`, `content`, and `category` using case-insensitive `contains`.
5. **Audit logging** on every mutation with `oldData`/`newData` diff.

#### Validation Schema Fields (Create)

| Field | Type | Rules |
|---|---|---|
| `title` | string | required, max 220 |
| `slug` | string | required, 2–160 chars, `kebab-case` regex |
| `content` | string | required, max 50,000 chars |
| `imageUrl` | string? | max 500 chars |
| `status` | `BlogStatus`? | enum value |
| `featured` | boolean? | — |
| `category` | string? | max 80 chars |
| `publishedAt` | Date? | preprocessed from string/number |

---

### 3. Service Module

**Route prefix:** `/api/services/v1`  
**Files:** `service.routes.ts`, `service.controller.ts`, `service.service.ts`, `service.validator.ts`

#### Endpoints

| Method | Path | Auth | Roles | Description |
|---|---|---|---|---|
| `GET` | `/` | Public | — | List all services (filterable, paginated) |
| `GET` | `/slug/:slug` | Public | — | Get service by slug |
| `POST` | `/` | ✅ | ADMIN, MANAGER | Create service |
| `PATCH` | `/:serviceId` | ✅ | ADMIN, MANAGER | Update service |
| `DELETE` | `/:serviceId` | ✅ | ADMIN, MANAGER | Delete service |

#### Key Features

- Services have `tags[]` (string array) for tag-based filtering.
- `order` is managed with the contiguous-order algorithm.
- `slug` is unique and validated with a kebab-case regex.

---

### 4. Lab Project Module

**Route prefix:** `/api/lab-projects/v1`  
**Files:** `labproject.routes.ts`, `labproject.controller.ts`, `labproject.service.ts`, `labproject.validator.ts`

#### Endpoints

| Method | Path | Auth | Roles | Description |
|---|---|---|---|---|
| `GET` | `/` | Public | — | List all lab projects (filterable, paginated) |
| `GET` | `/slug/:slug` | Public | — | Get project by slug |
| `POST` | `/` | ✅ | ADMIN, MANAGER | Create project |
| `PATCH` | `/:labProjectId` | ✅ | ADMIN, MANAGER | Update project |
| `DELETE` | `/:labProjectId` | ✅ | ADMIN, MANAGER | Delete project |

#### Key Features

- Richest content model: supports `gallery[]`, `tags[]`, `techStack[]`, `projectUrl`, `repoUrl`, `content`, `imageUrl`.
- Array fields are **normalized**: trimmed, lowercased, and de-duplicated.
- Filter by `tag` (exact array element match), `tech` (exact stack match), `status`, `featured`, and free-text search.
- Order is optional (nullable); items without an order appear after ordered items.
- Status transitions: `ONGOING → COMPLETED → ARCHIVED`.

---

### 5. Branch & Member Module

**Route prefix:** `/api/branches/v1`, `/api/members/v1`  
**Files:** `branch.routes.ts`, `branch.controller.ts`, `branch.service.ts`, `branch.validator.ts` + member equivalents

#### Branch Endpoints

| Method | Path | Auth | Roles | Description |
|---|---|---|---|---|
| `GET` | `/` | Public | — | List all branches |
| `GET` | `/:branchId` | Public | — | Get branch by ID |
| `GET` | `/:branchId/members` | Public | — | List members of a branch |
| `POST` | `/` | ✅ | ADMIN, MANAGER | Create branch |
| `PATCH` | `/:branchId` | ✅ | ADMIN, MANAGER | Update branch |
| `DELETE` | `/:branchId` | ✅ | ADMIN, MANAGER | Delete branch |
| `POST` | `/:branchId/members` | ✅ | ADMIN, MANAGER | Assign member to branch |
| `PATCH` | `/:branchId/members/:memberId` | ✅ | ADMIN, MANAGER | Update member order in branch |
| `DELETE` | `/:branchId/members/:memberId` | ✅ | ADMIN, MANAGER | Remove member from branch |

#### Member Endpoints

| Method | Path | Auth | Roles | Description |
|---|---|---|---|---|
| `GET` | `/` | Public | — | List all members |
| `POST` | `/` | ✅ | ADMIN, MANAGER | Create member |
| `PATCH` | `/:memberId` | ✅ | ADMIN, MANAGER | Update member |
| `DELETE` | `/:memberId` | ✅ | ADMIN, MANAGER | Delete member |

#### Key Features

- `Branch` and `Member` are **M:M** through the `BranchMember` junction table with its own `order` field per branch.
- A member can belong to multiple branches with independent ordering in each.
- Cascade delete: deleting a branch/member cascades to `BranchMember` rows (set via Prisma `onDelete: Cascade`).
- Branch list responses include `_count.teamMembers` for UI display.
- `BranchType` enum: `HEADQUARTERS`, `REGIONAL`, `INTERNATIONAL`.

---

### 6. Partner Module

**Route prefix:** `/api/partners/v1`  
**Files:** `partner.routes.ts`, `partner.controller.ts`, `partner.service.ts`, `partner.validator.ts`

| Method | Path | Auth | Roles | Description |
|---|---|---|---|---|
| `GET` | `/` | Public | — | List all partners (paginated) |
| `POST` | `/` | ✅ | ADMIN, MANAGER | Create partner |
| `PATCH` | `/:partnerId` | ✅ | ADMIN, MANAGER | Update partner |
| `DELETE` | `/:partnerId` | ✅ | ADMIN, MANAGER | Delete partner |

Fields: `name`, `logoUrl`, `website?`, `order`. Ordered with the standard contiguous algorithm.

---

### 7. Client Module

**Route prefix:** `/api/clients/v1`  
**Files:** `client.routes.ts`, `client.controller.ts`, `client.service.ts`, `client.validator.ts`

| Method | Path | Auth | Roles | Description |
|---|---|---|---|---|
| `GET` | `/` | Public | — | List all clients (paginated) |
| `POST` | `/` | ✅ | ADMIN, MANAGER | Create client |
| `PATCH` | `/:clientId` | ✅ | ADMIN, MANAGER | Update client |
| `DELETE` | `/:clientId` | ✅ | ADMIN, MANAGER | Delete client |

Fields: `name`, `logoUrl`, `order`. Minimal model for logo carousel on front-end.

---

### 8. Testimonial Module

**Route prefix:** `/api/testimonials/v1`  
**Files:** `testimonial.routes.ts`, `testimonial.controller.ts`, `testimonial.service.ts`, `testimonial.validator.ts`

| Method | Path | Auth | Roles | Description |
|---|---|---|---|---|
| `GET` | `/` | Public | — | List testimonials (paginated) |
| `POST` | `/` | ✅ | ADMIN, MANAGER | Create testimonial |
| `PATCH` | `/:testimonialId` | ✅ | ADMIN, MANAGER | Update testimonial |
| `DELETE` | `/:testimonialId` | ✅ | ADMIN, MANAGER | Delete testimonial |

Fields: `name`, `content`, `role?`, `company?`, `avatarUrl?`, `order`.

---

### 9. Stat Module

**Route prefix:** `/api/stats/v1`  
**Files:** `stat.routes.ts`, `stat.controller.ts`, `stat.service.ts`, `stat.validator.ts`

| Method | Path | Auth | Roles | Description |
|---|---|---|---|---|
| `GET` | `/` | Public | — | List stats (filterable by category, paginated) |
| `POST` | `/` | ✅ | ADMIN, MANAGER | Create stat |
| `PATCH` | `/:statId` | ✅ | ADMIN, MANAGER | Update stat |
| `DELETE` | `/:statId` | ✅ | ADMIN, MANAGER | Delete stat |

Fields: `label`, `value`, `category?`, `order`. The `category` field enables grouping (e.g., "company", "projects").

---

### 10. Contact Module

**Route prefix:** `/api/contacts/v1`  
**Files:** `contact.routes.ts`, `contact.controller.ts`, `contact.service.ts`, `contact.validator.ts`

| Method | Path | Auth | Roles | Description |
|---|---|---|---|---|
| `GET` | `/` | Public | — | List contacts (filterable by type) |
| `POST` | `/` | ✅ | ADMIN, MANAGER | Create contact |
| `PATCH` | `/:contactId` | ✅ | ADMIN, MANAGER | Update contact |
| `DELETE` | `/:contactId` | ✅ | ADMIN, MANAGER | Delete contact |

Fields: `type` (PHONE / EMAIL / ADDRESS), `value`, `order`. Type-based filtering enables front-end to show phone numbers separately from emails.

---

### 11. Social Link Module

**Route prefix:** `/api/social-links/v1`  
**Files:** `sociallink.routes.ts`, `sociallink.controller.ts`, `sociallink.service.ts`, `sociallink.validator.ts`

| Method | Path | Auth | Roles | Description |
|---|---|---|---|---|
| `GET` | `/` | Public | — | List social links (paginated) |
| `POST` | `/` | ✅ | ADMIN, MANAGER | Create social link |
| `PATCH` | `/:socialLinkId` | ✅ | ADMIN, MANAGER | Update social link |
| `DELETE` | `/:socialLinkId` | ✅ | ADMIN, MANAGER | Delete social link |

Fields: `platform`, `logoUrl`, `url`, `order`.

---

### 12. Terms Module

**Route prefix:** `/api/terms/v1`  
**Files:** `terms.routes.ts`, `terms.controller.ts`, `terms.service.ts`, `terms.validator.ts`

| Method | Path | Auth | Roles | Description |
|---|---|---|---|---|
| `GET` | `/` | Public | — | List all terms versions |
| `GET` | `/current` | Public | — | Get the most recently updated terms |
| `POST` | `/` | ✅ | ADMIN | Create new terms version |

The `Terms` model stores multiple versions; the latest `updatedAt` is always considered current, supporting version history.

---

### 13. Settings Module

**Route prefix:** `/api/settings/v1`  
**Files:** `setting.routes.ts`, `setting.controller.ts`, `setting.service.ts`, `setting.validator.ts`

| Method | Path | Auth | Roles | Description |
|---|---|---|---|---|
| `GET` | `/` | Public | — | Get all settings |
| `GET` | `/:key` | Public | — | Get setting by key |
| `POST` | `/` | ✅ | ADMIN | Upsert a setting |
| `DELETE` | `/:key` | ✅ | ADMIN | Delete a setting |

#### Key Features

- Settings are a **key-value store** with a `Json` value type.
- Each key has an associated **per-key Zod schema** defined in `setting.validator.ts`.
- Currently 3 supported keys (all realtime-capable):
  - `maintenance_mode` (boolean)
  - `maintenance_message` (string, max 255)
  - `maintenance_end_time` (string, valid date format)
- **Real-time propagation:** When a realtime-capable key is upserted or deleted, the service calls `emitSiteSettingsUpdated()` which broadcasts to all connected Socket.io clients in the `site-settings` channel.
- Write endpoint is restricted to **ADMIN** only (stricter than most other modules).

---

### 14. Audit Log Module

**Route prefix:** `/api/audit-logs/v1`  
**Files:** `auditlog.routes.ts`, `auditlog.controller.ts`, `auditlog.service.ts`, `auditlog.validator.ts`

| Method | Path | Auth | Roles | Description |
|---|---|---|---|---|
| `GET` | `/` | ✅ | ADMIN | List audit logs (filterable, paginated) |
| `GET` | `/:auditLogId` | ✅ | ADMIN | Get single audit log by ID |

#### Filter Capabilities

| Filter | Type | Behavior |
|---|---|---|
| `action` | `AuditAction` enum | Exact match |
| `entity` | string | Case-insensitive contains |
| `entityId` | string | Case-insensitive contains |
| `userId` | string | Exact match |
| `search` | string | Searches entity, entityId, user email, user name |
| `from` | Date | `createdAt >= from` |
| `to` | Date | `createdAt <= to` |
| `page`, `limit` | number | Pagination |

All audit logs include the linked `User` (id, email, name, role) when available.

---

### 15. File Upload Module

**Route prefix:** `/api/uploads/v1`  
**Files:** `upload.routes.ts`, `upload.controller.ts`, `multer.middleware.ts`

| Method | Path | Auth | Roles | Description |
|---|---|---|---|---|
| `POST` | `/:category` | ✅ | ADMIN, MANAGER | Upload a file to a category folder |

#### Upload Categories

`members`, `partners`, `clients`, `services`, `blogs`, `pages`, `labs`, `testimonials`, `misc`

#### Multer Configuration

| Setting | Value |
|---|---|
| Storage | `diskStorage` → `uploads/<category>/` |
| Max File Size | `UPLOAD_MAX_FILE_SIZE` env var (default: 5 MB) |
| Allowed MIME Types | `image/jpeg`, `image/png`, `image/webp`, `image/gif`, `image/svg+xml`, `application/pdf` |
| File Naming | `<sanitized-basename>-<timestamp>-<random>.ext` (max 60 chars base) |

Uploaded files are primarily stored and served via **Cloudinary**. The response includes the Cloudinary URL (as `absoluteUrl` and `relativeUrl`). If Cloudinary is disabled or fails, the system is designed to fallback to local static storage at `/uploads/<category>/<filename>`.

Local files are served statically from the `/uploads` directory. The absolute URL is constructed using `BACKEND_BASE_URL` (if set), otherwise derived from `req.protocol + req.host`.

---

### 16. Dashboard Module

**Route prefix:** `/api/dashboard/v1`  
**Files:** `dashboard.routes.ts`, `dashboard.controller.ts`, `dashboard.service.ts`, `dashboard.validator.ts`

| Method | Path | Auth | Roles | Description |
|---|---|---|---|---|
| `GET` | `/overview` | ✅ | ADMIN, MANAGER | Get admin dashboard overview |

#### Response Structure

```json
{
  "summary": {
    "counts": {
      "services": 5, "stats": 12, "testimonials": 8,
      "partners": 10, "clients": 7, "branches": 3,
      "members": 24, "contacts": 5, "blogs": 42, "labProjects": 15
    },
    "status": {
      "blogsByStatus": { "DRAFT": 5, "PUBLISHED": 35, "ARCHIVED": 2 },
      "labProjectsByStatus": { "ONGOING": 8, "COMPLETED": 6, "ARCHIVED": 1 }
    },
    "featured": { "blogs": 3, "labProjects": 4 }
  },
  "activity": {
    "recentAuditLogs": [...],
    "summary": {
      "totalRecent": 20,
      "byAction": { "CREATE": 5, "UPDATE": 12, "DELETE": 2, "LOGIN": 1 },
      "topEntities": [{ "entity": "Blog", "count": 8 }, ...]
    }
  },
  "trends": [
    { "date": "2026-04-22", "label": "Apr 22", "blogsCreated": 2, "projectsCreated": 1, "totalCreated": 3 },
    ...
  ],
  "health": {
    "dbConnected": true,
    "serverTime": "2026-04-28T05:42:00.000Z"
  }
}
```

#### Key Features

- All 17 database queries run **concurrently** via `Promise.all()`.
- Configurable `recentLimit` (recent audit logs count) and `trendDays` (trend window) via query params.
- **Trend series** is built in-memory without a GROUP BY query — raw `createdAt` values are fetched and bucketed into a date map for O(n) performance.
- **DB health check** uses `$queryRawUnsafe("SELECT 1")` to verify connectivity in real time.

---

### 17. Public API Module

**Route prefix:** `/api/public/v1`  
**Files:** `public.routes.ts`, `public.controller.ts`, `public.service.ts`, `public.validator.ts`

All endpoints are **unauthenticated**. They expose only safe, curated public data.

| Method | Path | Description |
|---|---|---|
| `GET` | `/home` | Single mega-query for homepage data |
| `GET` | `/blogs` | Published blog list (search, category, featured, paginated) |
| `GET` | `/featured-blogs` | Featured published blogs |
| `GET` | `/blogs/slug/:slug` | Single published blog by slug |
| `GET` | `/projects` | Lab projects list (search, tag, tech, status, paginated) |
| `GET` | `/featured-projects` | Featured lab projects |
| `GET` | `/projects/slug/:slug` | Single project by slug |
| `GET` | `/services` | Service list (search, tag, paginated) |
| `GET` | `/services/slug/:slug` | Single service by slug |
| `GET` | `/team` | Members list (search, branchId filter, paginated) |
| `GET` | `/branches` | Branch list (search, paginated) |
| `GET` | `/branches/:branchId/members` | Members in a specific branch |
| `GET` | `/testimonials` | Testimonial list (paginated) |
| `GET` | `/partners` | Partner list (paginated) |
| `GET` | `/clients` | Client list (paginated) |
| `GET` | `/stats` | Stats (category filter, paginated) |
| `GET` | `/social-links` | Social link list |
| `GET` | `/contacts` | Contacts (type filter, paginated) |
| `GET` | `/terms` | All terms versions |
| `GET` | `/terms/current` | Most recent terms |
| `GET` | `/settings` | Public-facing settings only |
| `GET` | `/settings/current` | Current public site config |
| `GET` | `/site-config` | Site configuration object |

#### `GET /home` — Homepage Aggregate

The homepage endpoint is the most powerful query: it fires **12 database queries in parallel** and returns a single unified JSON response containing:

```
services (top 6) · stats · testimonials (top 12) · partners (top 12) ·
clients (top 12) · socialLinks · contacts · featuredBlogs (top 3) ·
featuredProjects (top 6) · terms (latest) · team (top 8) · branches · 
maintenanceMode settings
```

This design minimizes round-trips for the public website's initial page load.

#### Blog Filtering for Public

- Only returns blogs with `status === PUBLISHED` and `publishedAt <= now()`.
- List items map `content` to an auto-generated 180-character `excerpt` (no client processing needed).

#### Project Filtering for Public

- Only returns projects with `status IN [ONGOING, COMPLETED]` (hides ARCHIVED).
- Supports array-element filtering: `?tag=ai` or `?tech=nextjs`.

---

## Middleware Layer

| Middleware | File | Purpose |
|---|---|---|
| `authenticate` | `auth.middleware.ts` | Verifies Bearer JWT, attaches `req.user` |
| `authorize(...roles)` | `role.middleware.ts` | Role-based access control, curried factory |
| `upload` | `multer.middleware.ts` | Category-aware disk storage, MIME validation, size limit |
| `validate(schema)` | `validate.middleware.ts` | Parses and validates `req.body` via Zod; throws on failure |
| `errorMiddleware` | `error.middleware.ts` | Global Express 5 error handler |

### Error Handler Behavior

The global error middleware handles three error types distinctly:

1. **`ZodError`** → HTTP 400 with first issue message + flattened errors object.
2. **`MulterError`** → HTTP 400 with human-readable message (special case for `LIMIT_FILE_SIZE`).
3. **Any other error** → Uses `err.status` if present (from `httpError()`), otherwise HTTP 500.

---

## Real-Time (Socket.io)

The server runs Socket.io alongside Express using a shared `http.Server` instance.

### Architecture

```
Express App → http.createServer(app) → Socket.io.Server(httpServer)
```

### Events

| Event | Direction | Description |
|---|---|---|
| `connection:ready` | Server → Client | Emitted on new connection with `{ socketId, timestamp }` |
| `site-settings:updated` | Server → Client | Emitted when a realtime setting is changed |

### Channel

All clients automatically join the `site-settings` room on connection. The `site-settings:updated` event broadcasts the full site configuration (maintenance mode, message, end time) whenever a relevant setting changes.

### Trigger

`setting.service.ts` calls `emitSiteSettingsUpdated()` after any upsert or delete of `maintenance_mode`, `maintenance_message`, or `maintenance_end_time`.

---

## Utility Layer

| Utility | File | Purpose |
|---|---|---|
| `generateToken(payload)` | `jwt.ts` | Signs a JWT with `JWT_SECRET` and `JWT_EXPIRES_IN` |
| `verifyToken(token)` | `jwt.ts` | Verifies a token |
| `httpError(status, message)` | `httpError.ts` | Creates an error with `.status` property for the error handler |
| `asyncHandler(fn)` | `asyncHandler.ts` | Wraps async route handlers to forward errors to Express |
| `apiResponse` | `apiResponse.ts` | Standardized success response builder |
| `logAction(params)` | `logAction.ts` | Writes audit log; strips passwords from data; fails silently |

---

## Validation Layer (Zod)

Every module has a dedicated `*.validator.ts` file with Zod schemas for:

- **Create** input — all required fields with strict rules.
- **Update** input — all fields optional; requires at least one field (`refine`).
- **List/query** params — pagination, search, filters with coercion (numbers from query strings).
- **ID params** — UUID format enforcement.

### Common Validation Patterns

```typescript
// Slug — kebab-case enforced
/^[a-z0-9]+(?:-[a-z0-9]+)*$/

// Pagination — both or neither required
.refine((data) => (data.page === undefined) === (data.limit === undefined))

// Boolean from query string — preprocess strings "true"/"false"
z.preprocess(parseBoolean, z.boolean().optional())

// Date from string/number — e.g. ISO strings from API requests
z.preprocess(parseDate, z.date().optional())
```

---

## Configuration & Environment

Environment variables are centralized in `src/config/env.ts` and loaded via `dotenv`.

| Variable | Default | Description |
|---|---|---|
| `PORT` | `5000` | HTTP server port |
| `DATABASE_URL` | required | PostgreSQL connection string |
| `JWT_SECRET` | required | JWT signing secret |
| `JWT_EXPIRES_IN` | required | JWT expiry duration (e.g. `"7d"`) |
| `MAIL_HOST` | — | SMTP host (configured, not yet wired to a service) |
| `MAIL_PORT` | — | SMTP port |
| `MAIL_USER` | — | SMTP username |
| `MAIL_PASS` | — | SMTP password |
| `MAIL_FROM` | — | Email "from" address |
| `BACKEND_BASE_URL` | — | Overrides auto-detected base URL for upload responses |
| `UPLOAD_DIR` | `"uploads"` | Base directory for uploaded files |
| `UPLOAD_MAX_FILE_SIZE` | `5242880` (5 MB) | Max upload size in bytes |

---

## Security Analysis

| Area | Implementation | Status |
|---|---|---|
| Authentication | JWT Bearer tokens | ✅ Implemented |
| Password Storage | bcrypt hashing | ✅ Implemented |
| Role-Based Authorization | 3-tier role system (USER/MANAGER/ADMIN) | ✅ Implemented |
| Input Validation | Zod on all POST/PATCH bodies | ✅ Implemented |
| User Enumeration Prevention | Consistent timing on failed login | ✅ Implemented |
| Audit Trail | logAction() on all mutations | ✅ Implemented |
| Password Leakage Prevention | Passwords stripped from audit logs | ✅ Implemented |
| File Upload Restrictions | MIME type whitelist + size limit | ✅ Implemented |
| CORS | `cors()` middleware (currently `origin: "*"`) | ⚠️ Open — should be restricted in production |
| Rate Limiting | None | ❌ Not implemented |
| Helmet (Security Headers) | None | ❌ Not implemented |
| CORS Socket.io | `origin: "*"` | ⚠️ Open — should be restricted in production |
| Input Sanitization (XSS) | Not implemented | ❌ Blog `content` field accepts raw HTML/rich text |
| SQL Injection | Prevented by Prisma ORM | ✅ Safe |

---

## API Route Summary Table

| Module | Prefix | Public Routes | Protected Routes | Auth Level |
|---|---|---|---|---|
| Auth | `/api/auth/v1` | `POST /login` | — | — |
| Blogs | `/api/blogs/v1` | `GET /`, `GET /slug/:slug` | `POST`, `PATCH`, `DELETE` | ADMIN, MANAGER |
| Services | `/api/services/v1` | `GET /`, `GET /slug/:slug` | `POST`, `PATCH`, `DELETE` | ADMIN, MANAGER |
| Lab Projects | `/api/lab-projects/v1` | `GET /`, `GET /slug/:slug` | `POST`, `PATCH`, `DELETE` | ADMIN, MANAGER |
| Branches | `/api/branches/v1` | `GET /`, `GET /:id`, `GET /:id/members` | `POST`, `PATCH`, `DELETE`, member ops | ADMIN, MANAGER |
| Members | `/api/members/v1` | `GET /` | `POST`, `PATCH`, `DELETE` | ADMIN, MANAGER |
| Partners | `/api/partners/v1` | `GET /` | `POST`, `PATCH`, `DELETE` | ADMIN, MANAGER |
| Clients | `/api/clients/v1` | `GET /` | `POST`, `PATCH`, `DELETE` | ADMIN, MANAGER |
| Testimonials | `/api/testimonials/v1` | `GET /` | `POST`, `PATCH`, `DELETE` | ADMIN, MANAGER |
| Stats | `/api/stats/v1` | `GET /` | `POST`, `PATCH`, `DELETE` | ADMIN, MANAGER |
| Contacts | `/api/contacts/v1` | `GET /` | `POST`, `PATCH`, `DELETE` | ADMIN, MANAGER |
| Social Links | `/api/social-links/v1` | `GET /` | `POST`, `PATCH`, `DELETE` | ADMIN, MANAGER |
| Terms | `/api/terms/v1` | `GET /`, `GET /current` | `POST` | ADMIN |
| Settings | `/api/settings/v1` | `GET /`, `GET /:key` | `POST`, `DELETE` | ADMIN |
| Audit Logs | `/api/audit-logs/v1` | — | `GET /`, `GET /:id` | ADMIN |
| Uploads | `/api/uploads/v1` | — | `POST /:category` | ADMIN, MANAGER |
| Dashboard | `/api/dashboard/v1` | — | `GET /overview` | ADMIN, MANAGER |
| Public API | `/api/public/v1` | All 21 routes | — | None |

**Total routes:** ~75+ distinct API endpoints across 18 route files.

---

## Observations & Recommendations

### Strengths

1. **Very clean architecture** — consistent layering throughout; each module follows the exact same pattern.
2. **Robust ordering system** — transactional, gapless order management is well-implemented.
3. **Powerful public homepage API** — single endpoint for all homepage data minimizes client round-trips.
4. **Comprehensive audit trail** — all mutations are tracked with old/new diffs.
5. **Dashboard with trends** — in-memory trend bucketing is efficient and avoids slow GROUP BY queries.
6. **Real-time maintenance mode** — Socket.io integration for live site config updates is clean.
7. **Type safety** — Zod validators, TypeScript throughout, and Prisma-generated types.

### Areas for Improvement

1. **CORS restriction** — Both `express cors()` and Socket.io are set to `origin: "*"`. In production, this should be locked to allowed frontend origins.
2. **No rate limiting** — The `/api/auth/v1/login` endpoint is vulnerable to brute force. `express-rate-limit` should be added.
3. **No Helmet.js** — Security headers (CSP, HSTS, X-Frame-Options, etc.) are not set.
4. **Mail service unconfigured** — SMTP env vars are present but no Nodemailer service is wired into any module. Email notifications (e.g., contact form, password reset) are not functional.
5. **No password reset / registration API** — Only login is implemented; user creation must be done via seed or Prisma Studio.
6. **Blog content XSS risk** — The `content` field stores rich text (HTML). If rendered directly, XSS sanitization should be applied (e.g., `DOMPurify` on the frontend, or server-side with `sanitize-html`).
7. **No refresh token** — JWTs eventually expire with no rotation mechanism.
8. **No API versioning strategy** — All routes use `v1` suffix but there is no mechanism for version migration.
9. **`Socket.io` room is open** — All clients join `site-settings` on connection with no auth check, meaning unauthenticated users receive maintenance mode broadcasts (likely acceptable).
10. **`USER` role is unused** — The `USER` enum value exists in the DB but no route currently uses it; could be leveraged for future authenticated public-user features.

---

*Report generated by automated backend analysis — April 28, 2026*
