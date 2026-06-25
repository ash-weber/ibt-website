# IBT Website — Client-Side Project Report

> **Project:** I-BACUS-TECH (IBT) Corporate Website — Public-Facing Client  
> **Report Date:** April 28, 2026  
> **Stack:** Next.js 16 · React 19 · TypeScript 5 · Tailwind CSS v4 · Framer Motion · Socket.io Client · Axios

---

## Table of Contents

1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Architecture & Design Patterns](#architecture--design-patterns)
5. [Design System (CSS Variables)](#design-system-css-variables)
6. [Page Routes & Their Components](#page-routes--their-components)
   - [Homepage (`/`)](#1-homepage-)
   - [Services Page (`/services`)](#2-services-page-services)
   - [IBT Labs Page (`/ibt-labs`)](#3-ibt-labs-page-ibt-labs)
   - [Maintenance Page (`/maintenance`)](#4-maintenance-page-maintenance)
7. [Feature Modules — Detailed Analysis](#feature-modules--detailed-analysis)
   - [Home Feature](#1-home-feature-srcfeatureshome)
   - [Layout Feature](#2-layout-feature-srcfeatureslayout)
   - [Services Feature](#3-services-feature-srcfeaturesservices)
   - [Labs Feature](#4-labs-feature-srcfeatureslabs)
8. [API Layer](#api-layer-srcapi)
9. [Real-Time System (Socket.io)](#real-time-system-socketio)
10. [Shared UI Component Library](#shared-ui-component-library-srcsharedui)
11. [Providers & Context](#providers--context)
12. [Hooks](#hooks)
13. [Types](#types)
14. [Utilities](#utilities)
15. [Re-export Shim Layer (`src/components/`)](#re-export-shim-layer-srccomponents)
16. [Configuration & Environment](#configuration--environment)
17. [Observations & Recommendations](#observations--recommendations)

---

## Overview

The `client-side` application is the **public-facing corporate website** for I-BACUS-TECH. It is a Next.js 16 app using the **App Router** pattern, built entirely with **React Server Components (RSC)** where possible, supplemented by `'use client'` components for interactive sections.

The application has two primary responsibilities:

1. **Content Display** — Rendering dynamic website content (services, lab projects, stats, partners, clients, testimonials) fetched from the backend Public API.
2. **Maintenance Mode** — A real-time maintenance overlay/screen powered by Socket.io, which activates instantly when admins toggle maintenance mode from the CMS.

The site is designed with a **red brand theme** (`#e02525` primary) and uses CSS custom properties for all design tokens, making theming consistent and easy to modify.

---

## Technology Stack

| Category | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 16.2.3 |
| Language | TypeScript | ^5 |
| UI Library | React | 19.2.4 |
| Styling | Tailwind CSS | ^4.x |
| Animations | Framer Motion | ^12.38.0 |
| HTTP Client | Axios | ^1.15.1 |
| Icon Library | React Icons (Feather) | ^5.6.0 |
| Real-Time | Socket.io Client | ^4.8.3 |
| Fonts | Google Fonts — Geist Sans, Geist Mono | next/font |
| Linting | ESLint (Next.js config) | ^9 |

---

## Project Structure

```
client-side/
├── app/                            # Next.js App Router
│   ├── layout.tsx                  # Root layout (SSR + Socket provider)
│   ├── page.tsx                    # Homepage route (/)
│   ├── globals.css                 # CSS design tokens + global styles
│   ├── favicon.ico
│   ├── components/
│   │   └── page.tsx                # Showcase page for shared UI components
│   ├── services/
│   │   └── page.tsx                # /services route
│   ├── ibt-labs/
│   │   └── page.tsx                # /ibt-labs route
│   └── maintenance/
│       └── page.tsx                # /maintenance route
│
├── src/
│   ├── api/                        # HTTP + Socket.io client layer
│   │   ├── client.ts               # Class-based Axios API client (primary)
│   │   ├── public.ts               # Legacy fetch functions (deprecated)
│   │   ├── settings.ts             # Site settings fetcher
│   │   └── socketClient.ts         # Socket.io client singleton + subscriptions
│   │
│   ├── features/                   # Feature-based component grouping
│   │   ├── home/
│   │   │   └── components/
│   │   │       ├── LandingPage.tsx
│   │   │       ├── HomeSections.tsx
│   │   │       ├── ServicesSection.tsx
│   │   │       ├── PartnersClientsSection.tsx
│   │   │       ├── TestimonialsSection.tsx
│   │   │       └── index.ts
│   │   ├── layout/
│   │   │   └── components/
│   │   │       ├── SiteNavbar.tsx
│   │   │       ├── SiteFooter.tsx
│   │   │       ├── MaintenanceOverlay.tsx
│   │   │       ├── MaintenanceScreen.tsx
│   │   │       └── index.ts
│   │   ├── services/
│   │   │   └── components/
│   │   │       ├── AllServicesPage.tsx
│   │   │       └── index.ts
│   │   └── labs/
│   │       └── components/
│   │           ├── AllLabsPage.tsx
│   │           └── index.ts
│   │
│   ├── shared/
│   │   └── ui/                     # Reusable design system components
│   │       ├── ActionButton.tsx
│   │       ├── Badge.tsx
│   │       ├── Checkbox.tsx
│   │       ├── Input.tsx
│   │       ├── Loader.tsx
│   │       ├── Modal.tsx
│   │       ├── Pagination.tsx
│   │       ├── SiteButton.tsx
│   │       ├── Textarea.tsx
│   │       ├── Toast.tsx
│   │       └── index.ts
│   │
│   ├── providers/
│   │   └── SocketSettingsProvider.tsx   # React context for real-time settings
│   │
│   ├── hooks/
│   │   └── useSocketSiteSettings.ts     # Socket connection + settings state hook
│   │
│   ├── types/
│   │   ├── socket.ts               # Socket events, channels, payload types
│   │   └── ui.ts                   # UI types (ActionIntent, ComponentSize)
│   │
│   ├── utils/
│   │   ├── cx.ts                   # Class name composer utility
│   │   └── maintenance.ts          # Time formatting for maintenance UI
│   │
│   └── components/                 # Re-export shim pointing to shared/ui + features
│       ├── *.tsx       (thin re-export wrappers)
│       ├── index.ts
│       └── README.md
│
├── public/                         # Static assets (logo.png, ibt-logo.svg)
├── package.json
├── next.config.ts
├── tsconfig.json
└── .env / .env.local
```

---

## Architecture & Design Patterns

### App Router + RSC Strategy

```
app/layout.tsx  (Server Component — fetches initial settings from API)
    └── SocketSettingsProvider (Client Component — manages real-time state)
        └── MaintenanceOverlay (Client Component — reads context)
            └── SiteNavbar (Client Component — active link detection)
            └── <page content>
            └── SiteFooter (Client Component — fetches contacts)
```

- **`app/layout.tsx`** is an **async Server Component** that calls `getInitialSettings()` (an SSR fetch of `/api/public/v1/settings/current`) to hydrate maintenance state before the page renders. This avoids a flash of unmaintained content.
- Individual sections within pages are **`'use client'`** components that fetch their own data independently on mount via `useEffect`.

### Feature-Based Organization

Components are organized by **feature domain** under `src/features/`, keeping related components co-located:
- `features/home/` → Homepage sections
- `features/layout/` → Navbar, Footer, Maintenance
- `features/services/` → Services listing page
- `features/labs/` → IBT Labs listing page

### Data Fetching Pattern (Client-Side)

All client components follow the same structured loading pattern:

```typescript
const [data, setData]     = useState<T[]>([]);
const [meta, setMeta]     = useState<PaginationMeta>({});
const [loading, setLoading] = useState(true);
const [error, setError]   = useState<string | null>(null);
const loadingRef          = useRef(false); // prevents duplicate requests

const loadPage = useCallback(async (page: number) => {
  if (loadingRef.current) return;
  loadingRef.current = true;
  setLoading(true);
  setError(null);
  try {
    const result = await apiClient.getSomething(page, limit);
    setData(result.items);
    setMeta(result.meta ?? {});
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Failed to load');
  } finally {
    loadingRef.current = false;
    setLoading(false);
  }
}, []);

useEffect(() => { void loadPage(1); }, [loadPage]);
```

The `loadingRef` prevents double-fetching in React 18/19 Strict Mode's double-invocation of effects.

### Three-State UI Rendering

Every data section renders one of three states:
1. **Loading** — `<Loader />` spinner shown while data is being fetched.
2. **Error** — Error message shown if fetch fails and no existing data.
3. **Content** — Actual data rendered; existing data is shown even during re-fetches (no flicker).

### Framer Motion Animation Pattern

Feature pages use consistent Framer Motion variants:

```typescript
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};
```

Parent `motion.div` with `staggerChildren` orchestrates children entry animations, giving a cascading card reveal effect.

---

## Design System (CSS Variables)

Defined in `app/globals.css`. All components use these tokens — **no hardcoded colors** in any component file.

| Variable | Value | Purpose |
|---|---|---|
| `--ui-primary` | `#e02525` | Red brand color |
| `--ui-primary-strong` | `#c51d1d` | Darker red (hover states) |
| `--ui-primary-soft` | `#fee2e2` | Light red (soft backgrounds) |
| `--ui-primary-softer` | `#fecaca` | Even lighter red |
| `--ui-danger` | `#dc2626` | Danger/error red |
| `--ui-danger-strong` | `#b91c1c` | Dark danger |
| `--ui-neutral` | `#374151` | Gray neutral |
| `--ui-neutral-strong` | `#1f2937` | Dark gray |
| `--ui-surface` | `#ffffff` | Page background |
| `--ui-surface-muted` | `#f8fafc` | Subtle card/section bg |
| `--ui-border` | `#e5e7eb` | Default border color |
| `--ui-border-strong` | `#d1d5db` | Stronger border |
| `--ui-text` | `#111827` | Primary text |
| `--ui-muted` | `#6b7280` | Secondary/muted text |
| `--ui-radius-md` | `0.75rem` | Medium border radius |
| `--ui-radius-lg` | `1rem` | Large border radius |
| `--ui-shadow-md` | `0 10px 25px rgba(17,24,39,0.08)` | Medium shadow |
| `--ui-shadow-lg` | `0 25px 50px rgba(17,24,39,0.16)` | Large shadow |

**Typography:** Geist Sans and Geist Mono loaded via `next/font/google` with CSS variable injection (`--font-geist-sans`, `--font-geist-mono`).

**Custom Scrollbar:** Styled globally with 6px width, transparent track, gray thumb with hover state.

---

## Page Routes & Their Components

### 1. Homepage (`/`)

**File:** `app/page.tsx`

```tsx
<LandingPage />           // Hero section with CTA
<HomeSections />          // Stats section with pagination
<ServicesSection />        // Services grid preview
<PartnersClientsSection /> // Partners & Clients logo grids
<TestimonialsSection />    // Testimonials card grid
```

The homepage is a **Server Component** that simply composes the five home feature sections. All actual data fetching happens within individual `'use client'` section components.

---

### 2. Services Page (`/services`)

**File:** `app/services/page.tsx`

Renders: `<AllServicesPage />` — a full paginated services listing with modal detail view.

---

### 3. IBT Labs Page (`/ibt-labs`)

**File:** `app/ibt-labs/page.tsx`

Renders: `<AllLabsPage />` — a paginated lab projects grid with rich project cards and modal detail drawer.

---

### 4. Maintenance Page (`/maintenance`)

**File:** `app/maintenance/page.tsx`

A placeholder static route. The actual maintenance experience is handled by `<MaintenanceOverlay>` in the root layout, which wraps all pages. The `/maintenance` route itself is minimal.

---

## Feature Modules — Detailed Analysis

---

### 1. Home Feature (`src/features/home`)

#### `LandingPage.tsx`

The animated hero section. Entirely static content (no API call).

**Key Details:**
- `'use client'` component using Framer Motion `motion.div` with `staggerChildren` for sequenced text reveal.
- `Variants.fadeUp` animates elements from `{ opacity: 0, y: 24 }` to `{ opacity: 1, y: 0 }`.
- Three decorative radial gradient backgrounds + blur orbs create a premium ambient glow effect.
- Two CTA buttons: **"Get Started"** (primary, links to `/contact`) and **"Learn More"** (secondary, external link).
- Tagline pills responsive: comma-separated single line on desktop, individual badge pills on mobile.

---

#### `HomeSections.tsx`

The company statistics (achievements) section with client-side paginated loading.

**API:** `apiClient.getStats(page, 4)` — loads 4 stats at a time.

**Features:**
- Stats displayed in a 2×2 grid on mobile, 4-column grid on `lg`.
- Prev/Next arrow buttons appear only when `totalPages > 1`.
- `loadingRef` ref prevents duplicate concurrent requests.
- Each stat card shows: large `value` (in brand red), `label` below.

---

#### `ServicesSection.tsx`

Homepage preview of the top 4 services with **animated card grid** and a **detail modal**.

**API:** `apiClient.getServices(1, 4)` — loads the first 4 services only.

**Features:**
- `motion.div` container with viewport-triggered animation (`whileInView`, `once: true, margin: "-100px"`).
- Each service card animates in with `itemVariants` (y-shift + fade).
- Hover effects: card lifts (`-translate-y-2`), image zooms (`scale-110`), gradient overlay fades in with "View Details" text.
- Clicking a card opens `<Modal>` with service image and description.
- **"View All Services"** button visible only when there are more services than shown (`hasMore`).

---

#### `PartnersClientsSection.tsx`

Displays both **Partners** and **Clients** logo grids, each independently paginated.

**API:** 
- `apiClient.getPartners(page, 10)` 
- `apiClient.getClients(page, 10)`

**Features:**
- Separate state, loading, error, and pagination for Partners vs Clients.
- Two `loadingRef` refs prevent concurrent double-fetches independently.
- `<LogoGrid>` sub-component renders a responsive grid with adaptive column count (1–5 columns based on item count).
- Partners with a `website` field render as `<a>` links (with `noopener noreferrer`); others are `<div>`.
- Hover: logo scales up (`scale-110`), name badge appears at bottom with blur backdrop.

---

#### `TestimonialsSection.tsx`

Three-column testimonial card grid with page-by-page navigation.

**API:** `apiClient.getTestimonials(page, 3)` — loads 3 per page.

**Features:**
- Each card features a top gradient accent bar, avatar/initials circle, name, role•company, and quote.
- Initials generated from name splitting: takes first letter of each word, max 2 letters.
- Prev/Next buttons with `page / totalPages` counter between them.
- Hover: card lifts, border brightens, internal glow blur activates.

---

### 2. Layout Feature (`src/features/layout`)

#### `SiteNavbar.tsx`

Responsive sticky navigation header with a desktop pill nav and mobile drawer.

**Key Details:**
- `'use client'` — uses `usePathname()` to detect the active route and apply active styles.
- **Desktop nav:** pill-shaped link group with rounded active indicator (red bg + shadow).
- **Mobile nav:** slide-in `<aside>` drawer (right-to-left) with `aria-modal="true"` and backdrop overlay.
- Drawer auto-closes on route change (`useEffect` on `pathname`).
- `Escape` key closes the mobile menu (keyboard listener on `window`).
- `document.body.style.overflow = 'hidden'` prevents scroll when drawer is open; restored on close.

**Nav items:** Home (/), Services (/services), IBT Labs (/ibt-labs), Blog (/blog)

---

#### `SiteFooter.tsx`

Footer with dynamic contact info fetched from the API plus static navigation links.

**API:** `apiClient.getContacts(1, 3)` — fetches top 3 contacts.

**Features:**
- Contact types map to icons: `PHONE → FiPhone`, `EMAIL → FiMail`, `ADDRESS → FiMapPin`.
- Phone and email generate `tel:` and `mailto:` hrefs; address renders as plain text.
- Three static link columns: Product (Services, IBT Labs, Blog), Company (About, Contact, Careers), Legal (Privacy, Terms, Sitemap).
- Copyright year auto-calculated: `new Date().getFullYear()`.
- Logo loaded from `public/ibt-logo.svg`.

---

#### `MaintenanceOverlay.tsx`

Thin wrapper that conditionally renders either `<MaintenanceScreen>` (fullscreen overlay) or `{children}` (normal site).

**Logic:** Reads `maintenanceMode` from `SocketSettingsContext`. If `true`, renders `<MaintenanceScreen />`; otherwise renders `children` (the rest of the site).

---

#### `MaintenanceScreen.tsx`

A full-screen, centered maintenance notification page shown when maintenance mode is active.

**Features:**
- `useSocketSettings()` hook provides: `maintenanceMode`, `maintenanceMessage`, `maintenanceEndTime`, `maintenanceTimeRemaining`, `socket.connected`.
- **Live countdown timer:** `maintenanceTimeRemaining` (seconds) displayed via `formatTimeRemaining()` utility.
- Formatted completion time via `formatDateTime()` utility.
- **Socket status indicator:** animated green pulse dot when connected, gray when reconnecting.
- Animated icon: pulsing wrench SVG icon.
- Only renders when `maintenanceMode === true`; returns `null` otherwise.

---

### 3. Services Feature (`src/features/services`)

#### `AllServicesPage.tsx`

Full-page services listing with pagination and a detail modal.

**API:** `apiClient.getServices(page, 10)` — 10 per page.

**Features:**
- Full `<Pagination>` component (page numbers + ellipsis) instead of simple prev/next.
- Each service card has `id={service.slug}` for anchor-link scrolling support.
- Same hover pattern as `ServicesSection`: lift, zoom, "View Details" overlay.
- Modal shows full-size image (h-72) + description in prose layout.
- Three-column grid on `lg`, two-column on `sm`.

---

### 4. Labs Feature (`src/features/labs`)

#### `AllLabsPage.tsx`

The most feature-rich page: a full IBT Lab Projects gallery with rich project cards and a detailed modal.

**API:** `apiClient.getProjects(page, 9)` — 9 per page (3×3 grid on XL).

**Project Card (`<ProjectCard>`):** Separate sub-component for clean separation:
- **Aspect-ratio image** with fallback gradient + `FiCode` icon.
- Gradient overlay from black/80 at bottom.
- **Status badge:** color-coded — `ONGOING` (amber), `COMPLETED` (emerald), `ARCHIVED` (slate).
- **Featured badge:** red badge with `FiStar` icon.
- **Tech stack preview tag** shown in top-right of card image.
- Title overlaid on image bottom.
- **Status-tinted arrow button** bottom-right, shifts right on hover.
- Description truncated to 150 chars.
- Up to 4 tags rendered as pills (merged from `techStack` + `tags`).
- Keyboard accessible: `tabIndex={0}`, `role="button"`, `Enter`/`Space` key handler.

**Modal Detail View:**
- Full-quality project image (aspect-video).
- Status + Featured badges.
- Full `content` field (or `description` as fallback) in `whitespace-pre-wrap`.
- Description + Project Focus info cards (2-column grid).
- Tech stack + tags displayed as separate pill groups.
- "Live Project" (`FiExternalLink`) and "Source Code" (`FiGithub`) action links.

---

## API Layer (`src/api/`)

### `client.ts` — Primary API Client

A **class-based Axios wrapper** (`class ApiClient`) that centralizes all API communication. Exported as a singleton: `export const apiClient = new ApiClient()`.

#### Configuration

| Setting | Value |
|---|---|
| Base URL | `NEXT_PUBLIC_API_URL` env var (normalized) |
| Fallback URL | `http://localhost:5000` |
| Timeout | 10,000 ms |
| Headers | `Content-Type: application/json` |

#### URL Normalization

Both the constructor and the root layout use a `normalizeBaseUrl()` function that:
1. Handles missing/empty values → uses fallback.
2. Prepends `http://` if no protocol detected.
3. Extracts `origin` from a parsed `URL` to strip paths.

#### Interceptors

- **Request interceptor:** Logs `[API Request] METHOD /path` to console.
- **Response interceptor:** Logs `[API Response] status /path`; re-throws errors.

#### Internal Methods

| Method | Purpose |
|---|---|
| `request<T>(path, prefix, params)` | Generic GET returning `T` |
| `requestPaginated<T>(path, prefix, params)` | Generic GET returning `PaginatedResult<T>` with normalized `totalItems`/`total` |

Both methods strip `undefined`/`null`/`''` values from query params before sending.

#### Public API Methods

| Method | Endpoint | Default Params |
|---|---|---|
| `getStats(page, limit)` | `GET /api/public/v1/stats` | page=1, limit=4 |
| `getServices(page, limit)` | `GET /api/public/v1/services` | page=1, limit=6 |
| `getProjects(page, limit)` | `GET /api/public/v1/projects` | page=1, limit=6 |
| `getPartners(page, limit)` | `GET /api/public/v1/partners` | page=1, limit=10 |
| `getClients(page, limit)` | `GET /api/public/v1/clients` | page=1, limit=10 |
| `getTestimonials(page, limit)` | `GET /api/public/v1/testimonials` | page=1, limit=6 |
| `getSettings()` | `GET /api/public/v1/settings/current` | — |

#### CMS API Methods (also in client)

| Method | Endpoint | Notes |
|---|---|---|
| `getContacts(page, limit)` | `GET /api/contacts/v1` | Uses CMS prefix |
| `getBlog(page, limit)` | `GET /api/blog/v1` | Currently unused on site |
| `getServices_CMS(page, limit)` | `GET /api/services/v1` | Currently unused on site |

#### TypeScript Types Defined in `client.ts`

| Type | Fields |
|---|---|
| `PublicStat` | id, label, value, category?, order? |
| `PublicService` | id, title, slug, description, imageUrl?, tags? |
| `PublicLabProject` | id, title, slug, description, content?, imageUrl?, gallery?, tags?, techStack?, projectUrl?, repoUrl?, status?, featured?, order? |
| `PublicContact` | id, type (PHONE/EMAIL/ADDRESS), value, order? |
| `PublicPartner` | id, name, logoUrl?, website?, order? |
| `PublicClient` | id, name, logoUrl?, order? |
| `PublicTestimonial` | id, name, content, role?, company?, avatarUrl?, order? |
| `PaginationMeta` | page?, limit?, totalPages?, totalItems?, total? |
| `PaginatedResult<T>` | items: T[], meta: PaginationMeta |

---

### `public.ts` — Legacy Functions (Deprecated)

An earlier fetch-based approach, now marked as **deprecated**. `fetchPublicStatsPage`, `fetchPublicServicesPage`, and `fetchPublicContactsPage` now internally delegate to `apiClient`. Retained only for backward compatibility — new code should not import from this file.

---

### `settings.ts` — Settings API Helper

A simple wrapper that calls `apiClient.getSettings()` and maps the result to `SiteSettingsRealtimePayload`, with a safe default fallback if the fetch fails.

```typescript
export const fetchSiteSettings = async (): Promise<SiteSettingsRealtimePayload>
```

Used by `useSocketSiteSettings` hook on initialization.

---

### `socketClient.ts` — Socket.io Client

Manages the Socket.io client instance as a **module-level singleton**.

#### Configuration

| Setting | Value |
|---|---|
| URL | `NEXT_PUBLIC_API_URL` (fallback: `http://localhost:3001`) |
| Reconnection | Enabled, up to 5 attempts |
| Reconnection delay | 1s initial, max 5s |
| Transports | `['websocket', 'polling']` |
| ACK timeout | 60s |

#### Exported Functions

| Function | Purpose |
|---|---|
| `getSocketClient()` | Returns existing connected socket or creates a new one |
| `disconnectSocket()` | Disconnects and clears the singleton |
| `isSocketConnected()` | Returns `boolean` connection status |
| `getCurrentSocket()` | Returns the raw socket or `null` |
| `subscribeSiteSettings(callback)` | Subscribes to `site-settings:updated` events; returns unsubscribe function |

---

## Real-Time System (Socket.io)

The maintenance mode system is real-time powered, ensuring that when an admin toggles maintenance mode in the CMS, all website visitors see the overlay appear/disappear **instantly** without a page refresh.

### Data Flow

```
Admin CMS Panel
      |
      | POST /api/settings/v1 { key: "maintenance_mode", value: true }
      |
Backend (setting.service.ts)
      |
      | emitSiteSettingsUpdated(payload)
      |
Socket.io Server (site-settings room)
      |
      | BROADCAST: "site-settings:updated" event
      |
socketClient.ts (client)
      |
      | handleSettingsUpdate(payload)
      |
useSocketSiteSettings hook
      |
      | setSettings(payload)
      |
SocketSettingsProvider (React Context)
      |
      | maintenanceMode = true → triggers MaintenanceOverlay
      |
MaintenanceScreen renders (full-screen takeover)
```

### Initialization Sequence

1. **SSR phase:** `app/layout.tsx` (Server Component) calls `getInitialSettings()` → fetches current settings from API → passes as `initialSettings` prop to `<SocketSettingsProvider>`.
2. **Client hydration:** `SocketSettingsProvider` mounts → `useSocketSiteSettings(initialSettings)` initializes with SSR settings.
3. **Effect runs:** Hook calls `fetchSiteSettings()` again to get fresh data → initializes Socket.io → subscribes to `site-settings:updated`.
4. **Updates:** Any backend change emits → hook updates state → context updates → `MaintenanceOverlay` re-renders.

### Countdown Timer

`SocketSettingsProvider` maintains a **1-second interval timer** when `maintenanceMode && maintenanceEndTime`:

```typescript
const interval = setInterval(() => {
  const remaining = new Date(maintenanceEndTime).getTime() - Date.now();
  setMaintenanceTimeRemaining(Math.ceil(remaining / 1000));
}, 1000);
```

`MaintenanceScreen` displays this via `formatTimeRemaining(seconds)`.

---

## Shared UI Component Library (`src/shared/ui/`)

A comprehensive set of reusable components written in TypeScript with full prop typing.

### `Modal`

**Purpose:** Accessible dialog overlay.

| Prop | Type | Default | Description |
|---|---|---|---|
| `isOpen` | boolean | — | Controls visibility |
| `title` | string | — | Header title |
| `onClose` | () => void | — | Close callback |
| `size` | 'sm'\|'md'\|'lg'\|'xl' | 'md' | Controls max-width |
| `closeOnOverlayClick` | boolean | true | Click backdrop to close |
| `closeOnEsc` | boolean | true | Escape key to close |
| `footer` | ReactNode? | — | Sticky footer content |

**Accessibility features:**
- `role="dialog"`, `aria-modal="true"`
- Focus trap: Tab cycles within modal; Shift+Tab reverses.
- Focus auto-moves to first focusable element on open.
- Focus restores to trigger element on close.
- `body.overflow = 'hidden'` prevents background scroll.
- Returns `null` when `isOpen === false` (no DOM presence).

**Size map:** `sm → max-w-md`, `md → max-w-2xl`, `lg → max-w-4xl`, `xl → max-w-6xl`

---

### `Pagination`

**Purpose:** Full page number pagination with ellipsis.

| Prop | Type | Description |
|---|---|---|
| `currentPage` | number | Active page number |
| `totalPages` | number | Total pages count |
| `onPageChange` | (page: number) => void | Callback |
| `disabled` | boolean? | Disables all buttons |

**Ellipsis algorithm:**
- ≤ 5 pages: all pages shown.
- Near start (≤ 3): `[1, 2, 3, 4, '...', total]`
- Near end (≥ total-2): `[1, '...', total-3, ..., total]`
- Middle: `[1, '...', current-1, current, current+1, '...', total]`

Returns `null` when `totalPages <= 1`.

---

### `SiteButton`

**Purpose:** Brand-consistent navigation/action button. Smart router between `<Link>`, `<a>`, and `<button>` based on `href`.

| Variant | Style |
|---|---|
| `primary` | Red bg, white text, shadow, hover lifts + darkens |
| `secondary` | White bg, border, shadow, hover lifts + border lightens |

| Size | Classes |
|---|---|
| `md` | `px-5 py-3 text-sm` |
| `lg` | `px-6 py-3.5 text-base` |

Smart routing logic:
- No `href` → `<button>`
- `href` starts with `/` → `<Link>` (Next.js routing)
- `href` is external → `<a>` with `target`/`rel` props

---

### `ActionButton`

Multi-intent button with pre-configured icons and loading states.

**Intents:** `save`, `update`, `delete`, `cancel`, `primary`, `secondary`, `ghost`

**Props:** `intent`, `size`, `loading`, `fullWidth`, `confirmDestructive` (shows confirmation dialog for destructive actions).

---

### `Input`

Forwarded ref text input with label, error state, helper text, start/end icons, and password visibility toggle.

---

### `Textarea`

Multi-line text area with label and error support. Inherits base Input styling.

---

### `Checkbox`

Accessible checkbox with label and error state.

---

### `Badge`

Status badge with 5 semantic variants: `primary`, `danger`, `neutral`, `success`, `warning`.

---

### `Loader`

Loading spinner with two modes:
- **Inline:** Spinner + optional label, sized (sm/md/lg or number px).
- **Fullscreen:** Centered fixed overlay.

---

### `Toast`

Auto-dismissing notification with:
- Variants: `success` (green), `error` (red).
- `durationMs` countdown (default 3600ms).
- Manual close button.

---

## Providers & Context

### `SocketSettingsProvider`

**File:** `src/providers/SocketSettingsProvider.tsx`

React Context that exposes real-time site settings to the entire app tree.

#### Context Value Shape

```typescript
{
  settings: SiteSettingsRealtimePayload;
  maintenanceMode: boolean;
  maintenanceMessage: string | null;
  maintenanceEndTime: string | null;
  socket: {
    connected: boolean;
    connecting: boolean;
    isReady: boolean;
    error: string | null;
  };
  loading: boolean;
  error: string | null;
  isMaintenanceActive: boolean;
  maintenanceTimeRemaining: number | null;  // seconds countdown
}
```

**Consumer hook:** `useSocketSettings()` — throws if used outside provider.

---

## Hooks

### `useSocketSiteSettings`

**File:** `src/hooks/useSocketSiteSettings.ts`

The core hook managing the entire real-time settings lifecycle.

**State managed:**
- `settings` — current `SiteSettingsRealtimePayload`
- `socketState` — `{ connected, connecting, isReady, error, lastUpdate }`
- `loading` — initialization loading state
- `error` — error message

**Lifecycle:**
1. Guard with `initializingRef` to prevent double-initialization (React Strict Mode).
2. Fetch fresh settings via `fetchSiteSettings()`.
3. Create socket via `getSocketClient()`.
4. Subscribe to `site-settings:updated` event.
5. Attach `connect`/`disconnect`/`error` listeners to update `socketState`.
6. Returns cleanup that unsubscribes the settings listener on unmount.

---

## Types

### `src/types/socket.ts`

| Export | Type | Description |
|---|---|---|
| `SOCKET_CHANNELS` | const | `{ SITE_SETTINGS: 'site-settings' }` |
| `SOCKET_EVENTS` | const | Connection, settings updated, error, disconnect, reconnect events |
| `SiteSettingsRealtimePayload` | interface | `{ maintenanceMode, maintenanceMessage, maintenanceEndTime, updatedAt }` |
| `SocketState` | interface | `{ connected, connecting, isReady, error, lastUpdate }` |
| `SiteSettingsState` | interface | Extends payload with `loading` and `error` |

### `src/types/ui.ts`

| Export | Type | Values |
|---|---|---|
| `ActionIntent` | type | `'save' \| 'update' \| 'delete' \| 'cancel' \| 'primary' \| 'secondary' \| 'ghost'` |
| `ComponentSize` | type | `'sm' \| 'md' \| 'lg'` |
| `LoaderSize` | type | `ComponentSize \| number` |

---

## Utilities

### `src/utils/cx.ts`

Dead-simple class name composer:

```typescript
export const cx = (...classes: Array<string | false | undefined>) =>
  classes.filter(Boolean).join(' ');
```

Used by `Modal`, `Pagination`, `SiteButton`, and other shared components.

---

### `src/utils/maintenance.ts`

Two pure functions for the maintenance screen:

| Function | Input | Output | Example |
|---|---|---|---|
| `formatTimeRemaining(seconds)` | `number \| null` | Human-readable string | `"2 hours and 30 minutes"` |
| `formatDateTime(dateString)` | `string \| null` | Formatted date | `"Apr 28, 2026, 11:30 PM"` |

`formatTimeRemaining` omits seconds when hours > 0 or minutes >= 2 (avoids verbose output).

---

## Re-export Shim Layer (`src/components/`)

The `src/components/` directory exists as a **thin re-export layer**. Each file like `HomeSections.tsx`, `ServicesSection.tsx`, etc. is a 1–3 line file that simply re-exports the actual implementation from `src/features/` or `src/shared/ui/`.

**Example:**
```typescript
// src/components/HomeSections.tsx
export { HomeSections } from '../features/home/components/HomeSections';
```

This layer is maintained for backward compatibility and allows consumers to import from a flat `@/src/components` path without knowing the feature folder structure. The `index.ts` aggregates all such re-exports.

---

## Configuration & Environment

### Environment Variables

| Variable | Usage | Fallback |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:5000` |

Both `client.ts` and `app/layout.tsx` implement the same `normalizeBaseUrl` logic to handle missing protocols and trailing slashes.

### `next.config.ts`

Minimal — no customizations beyond the default Next.js config object. No custom image domains, rewrites, or headers configured yet.

### `tsconfig.json`

Path alias configured:
```json
"@/*": ["./*"]
```

Enables `@/src/...`, `@/app/...` import patterns throughout the codebase.

---

## Observations & Recommendations

### Strengths

1. **SSR-first maintenance mode** — Fetching initial settings on the server prevents a flash of the wrong state on page load.
2. **Clean feature architecture** — Feature folder organization is consistent and easy to navigate.
3. **Solid data fetching pattern** — The `loadingRef` guard, three-state rendering, and `useCallback` + `useEffect` combination is robust.
4. **Real-time maintenance overlay** — Instant maintenance toggling via Socket.io without page reload.
5. **Accessible Modal** — Full focus trap, keyboard navigation, Escape close, and focus restoration implemented.
6. **Smart Pagination** — Ellipsis algorithm handles all edge cases cleanly.
7. **Type-safe API contracts** — All API return types are fully typed in `client.ts`.
8. **CSS variable theming** — Zero hardcoded colors; theme changes require only `globals.css` edits.

### Areas for Improvement

1. **`src/components/` shim is redundant** — The re-export layer adds indirection without benefit. Consumers should import directly from `src/features/` or `src/shared/ui/`. Consider removing the shim layer.
2. **`public.ts` is deprecated but not removed** — The legacy `fetchPublicData()` functions should be deleted since they internally call `apiClient` anyway.
3. **Console logging in production** — The Axios request/response interceptors log every HTTP request to the browser console. This should be gated behind `process.env.NODE_ENV === 'development'`.
4. **Missing pages (Blog, About, Contact)** — Navbar links to `/blog` and footer links to `/about`, `/contact`, `/careers`, `/privacy`, `/terms`, `/sitemap` — none of these routes exist yet.
5. **No error boundaries** — If a `'use client'` component throws during render, the entire page crashes without a graceful fallback. `<ErrorBoundary>` wrappers around feature sections would prevent cascade failures.
6. **Images use `<img>` not `next/image`** — Service, partner, lab project, testimonial images all render with native `<img>`, missing Next.js automatic image optimization (WebP conversion, lazy loading, blur placeholders, responsive `srcset`). Only the navbar logo uses `<Image>`.
7. **No `loading.tsx` or `Suspense`** — App Router supports `loading.tsx` segment files for automatic Suspense boundaries. Currently all loading states are managed manually with `useState`.
8. **No metadata per page** — Only the root `layout.tsx` sets `metadata`. Individual pages (`/services`, `/ibt-labs`) should define their own `export const metadata` for SEO optimization.
9. **Socket URL fallback mismatch** — `api/socketClient.ts` falls back to `http://localhost:3001` but the api client falls back to `http://localhost:5000`. These should be the same value.
10. **`useSocketSiteSettings` double-fetches settings** — The root layout fetches settings on the server and passes as `initialSettings`. Then the hook fetches again on mount. This is intentional (to ensure fresh data), but could be eliminated by trusting the SSR value for the initial render.
11. **No loading state during page navigation** — There is no `<NProgress>` or similar route-change indicator.

---

## Page & Component Summary Table

| Route | Page Component | Data Sources |
|---|---|---|
| `/` | `LandingPage` + `HomeSections` + `ServicesSection` + `PartnersClientsSection` + `TestimonialsSection` | Stats, Services (top 4), Partners, Clients, Testimonials |
| `/services` | `AllServicesPage` | Services (paginated, 10/page) |
| `/ibt-labs` | `AllLabsPage` | Lab Projects (paginated, 9/page) |
| `/maintenance` | _(static placeholder)_ | None |
| _(layout)_ | `SiteNavbar` + `SiteFooter` + `MaintenanceOverlay` | Contacts (footer), Settings (maintenance) |

---

*Report generated by automated codebase analysis — April 28, 2026*
