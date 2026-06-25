# IBT Website — Admin (Frontend) Project Report

> **Project:** I-BACUS-TECH (IBT) Admin Control Panel  
> **Report Date:** April 28, 2026  
> **Stack:** Vite · React 19 · TypeScript 5.8 · Tailwind CSS v4 · TanStack Query v5 · React Hook Form · Zod · dnd-kit · Socket.io Client · React Quill · Axios

---

## Table of Contents

1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Architecture & Design Patterns](#architecture--design-patterns)
5. [Design System (CSS Variables)](#design-system-css-variables)
6. [Routing & Route Protection](#routing--route-protection)
7. [Layout System](#layout-system)
8. [Page Inventory — All Routes](#page-inventory--all-routes)
9. [Page Modules — Detailed Analysis](#page-modules--detailed-analysis)
   - [Login Page](#1-login-page-login)
   - [Dashboard Page](#2-dashboard-page-admindashboard)
   - [Blogs Master Page](#3-blogs-master-page-adminmasterblogs)
   - [Blog Form Page](#4-blog-form-page-adminmasterblogscreate--blogidedit)
   - [Members Master Page](#5-members-master-page-adminmastermembers)
   - [Branches Master Pages](#6-branches-master-pages-adminmasterbranches)
   - [Services Master Pages](#7-services-master-pages-adminmasterservices)
   - [Lab Projects Master Pages](#8-lab-projects-master-pages-adminmasterlab-projects)
   - [Stats Master Pages](#9-stats-master-pages-adminmasterstats)
   - [Testimonials Master Pages](#10-testimonials-master-pages-adminmastertestimonials)
   - [Partners Master Pages](#11-partners-master-pages-adminmasterpartners)
   - [Clients Master Pages](#12-clients-master-pages-adminmasterclients)
   - [Contacts Master Pages](#13-contacts-master-pages-adminmastercontacts)
   - [Settings Page](#14-settings-page-adminsettings)
   - [Audit Logs Page](#15-audit-logs-page-adminaudit-logs)
   - [Components Showcase Page](#16-components-showcase-page-admincomponents)
10. [API Layer (`src/api/`)](#api-layer-srcapi)
11. [State Management — TanStack Query](#state-management--tanstack-query)
12. [Real-Time System (Socket.io)](#real-time-system-socketio)
13. [Shared Component Library (`src/component/`)](#shared-component-library-srccomponent)
14. [Auth Feature](#auth-feature-srcfeaturesauth)
15. [Settings Feature](#settings-feature-srcfeaturessettings)
16. [Hooks](#hooks)
17. [Types System](#types-system)
18. [Utilities & Library Files](#utilities--library-files)
19. [Configuration & Environment](#configuration--environment)
20. [Observations & Recommendations](#observations--recommendations)

---

## Overview

The `frontend` directory is the **IBT Admin Control Panel** — a fully client-rendered Single-Page Application (SPA) built with Vite + React. It provides authenticated CMS capabilities for managing all website content: blogs, services, lab projects, branches, members, partners, clients, testimonials, stats, contacts, settings, and audit logs.

Key characteristics:
- **Authentication-gated**: All admin routes require a JWT stored in `localStorage`. Unauthenticated users are redirected to `/login`.
- **React Query-driven**: All data fetching, caching, background refresh, and mutation management is done by TanStack Query — no Redux.
- **Drag-and-drop reordering**: Every ordered entity has a dedicated `/reorder` route powered by `dnd-kit`.
- **Real-time maintenance awareness**: Socket.io displays a live `MaintenanceStatusBanner` inside the admin layout when the public site is in maintenance mode.
- **Full CRUD + Reorder**: 13 content modules each have Create, Read, Update, Delete, and a separate reorder UI.

---

## Technology Stack

| Category | Technology | Version |
|---|---|---|
| Bundler | Vite | ^7.1.7 |
| Language | TypeScript | ~5.8.3 |
| UI Library | React | ^19.1.1 |
| Routing | React Router DOM | ^7.13.2 |
| Data Fetching | TanStack React Query | ^5.95.2 |
| Form Management | React Hook Form | ^7.72.0 |
| Schema Validation | Zod | ^4.3.6 |
| HTTP Client | Axios | ^1.13.6 |
| Styling | Tailwind CSS (v4) | ^4.2.2 |
| Drag & Drop | dnd-kit (core, sortable, modifiers, utilities) | ^6–^10 |
| Rich Text Editor | react-quill-new | ^3.8.3 |
| Real-Time | Socket.io Client | ^4.8.3 |
| Icon Library | React Icons (Feather) | ^5.6.0 |

---

## Project Structure

```
frontend/
├── index.html                      # Vite entry point
├── vite.config.ts                  # Vite config (@tailwindcss/vite plugin)
├── package.json
├── tsconfig.json / tsconfig.app.json / tsconfig.node.json
├── src/
│   ├── main.tsx                    # React root mount + QueryClientProvider
│   ├── App.tsx                     # Root: SocketSettingsProvider + BrowserRouter + AppRoutes
│   ├── App.css / index.css         # Global CSS + design tokens
│   ├── vite-env.d.ts
│   │
│   ├── api/                        # 16 typed API modules (one per resource)
│   │   ├── apiClient.ts            # Axios instance: auth header + 401 redirect
│   │   ├── auth.ts                 # login()
│   │   ├── blogsMaster.ts          # Blog CRUD + uploadBlogImage
│   │   ├── branchesMaster.ts       # Branch CRUD + member assignment + member ordering
│   │   ├── clientsMaster.ts        # Client CRUD + reorder
│   │   ├── contactsMaster.ts       # Contact CRUD + reorder
│   │   ├── dashboard.ts            # getDashboardOverview
│   │   ├── labProjectsMaster.ts    # Lab project CRUD + reorder
│   │   ├── membersMaster.ts        # Member CRUD
│   │   ├── partnersMaster.ts       # Partner CRUD + reorder
│   │   ├── servicesMaster.ts       # Service CRUD + reorder
│   │   ├── settings.ts             # getSettings / upsertSetting / saveSettings (diff-only)
│   │   ├── socketClient.ts         # Socket.io singleton + subscription utilities
│   │   ├── statsMaster.ts          # Stat CRUD + reorder
│   │   ├── testimonialsMaster.ts   # Testimonial CRUD + reorder
│   │   └── auditLogs.ts            # getAuditLogs / getAuditLogById
│   │
│   ├── component/                  # 13 shared UI components
│   │   ├── ActionButton.tsx        # Multi-intent button with icons + loading
│   │   ├── DeleteConfirmationModal.tsx
│   │   ├── Dropdown.tsx            # Single-select dropdown
│   │   ├── Input.tsx               # Labeled text input with error/helper
│   │   ├── Loader.tsx              # Spinner (inline + fullscreen)
│   │   ├── MaintenanceStatusBanner.tsx # Amber banner when maintenance mode is on
│   │   ├── Modal.tsx               # Accessible dialog with focus trap
│   │   ├── Pagination.tsx          # Page nav (hasPrev/hasNext based)
│   │   ├── RichTextEditor.tsx      # react-quill-new wrapper with toolbar config
│   │   ├── SearchBox.tsx           # Debounced search input
│   │   ├── Toast.tsx               # Auto-dismiss notification
│   │   ├── Tooltip.tsx             # Hover tooltip
│   │   └── index.ts                # Named re-exports
│   │
│   ├── features/
│   │   ├── auth/
│   │   │   ├── storage.ts          # localStorage token/user helpers (getAuthToken, isAuthenticated...)
│   │   │   └── validation.ts       # Zod loginSchema
│   │   ├── page/
│   │   │   └── sectionEditors/     # (empty – placeholder for future section editors)
│   │   └── settings/
│   │       └── validation.ts       # Zod settingsSchema
│   │
│   ├── hooks/
│   │   ├── useDebouncedValue.ts    # Generic debounce hook
│   │   └── useSocketSiteSettings.ts # Socket.io connection + settings state hook
│   │
│   ├── layouts/
│   │   ├── AdminLayout.tsx         # Sidebar + Navbar + MaintenanceStatusBanner + <Outlet>
│   │   └── admin/
│   │       ├── AdminSidebar.tsx    # Collapsible sidebar with nested nav, lock/pin
│   │       └── AdminNavbar.tsx     # Top header with breadcrumb + user menu
│   │
│   ├── lib/
│   │   └── queryClient.ts         # TanStack QueryClient singleton (global defaults)
│   │
│   ├── pages/
│   │   ├── auth/
│   │   │   └── LoginPage.tsx       # Split-screen login with Zod validation
│   │   └── admin/
│   │       ├── AdminDashboardPage.tsx
│   │       ├── AuditLogsPage.tsx
│   │       ├── BlogsMasterPage.tsx
│   │       ├── BlogFormPage.tsx     # Create + Edit (shared form)
│   │       ├── MembersMasterPage.tsx
│   │       ├── SettingsPage.tsx
│   │       ├── ComponentsPage.tsx   # UI component showcase
│   │       ├── components/          # Sub-components per page
│   │       │   ├── ImageUploadField.tsx
│   │       │   ├── audit/           # ActionBadge, AuditLogDetailContent
│   │       │   ├── blogs/           # BlogsMasterCard
│   │       │   ├── dashboard/       # KpiGrid, RecentActivity, StatusPanels
│   │       │   └── members/         # MembersMasterCard, MemberFormModal
│   │       └── master/              # One folder per ordered entity
│   │           ├── EmptyMasterSectionPage.tsx
│   │           ├── branch/          # BranchesMasterPage, BranchesReorderPage, BranchTeamPage, BranchTeamReorderPage + components
│   │           ├── services/        # ServicesMasterPage, ServicesReorderPage + components
│   │           ├── stats/           # StatsMasterPage, StatsReorderPage + components
│   │           ├── testimonials/    # TestimonialsMasterPage, TestimonialsReorderPage + components
│   │           ├── partners/        # PartnersMasterPage, PartnersReorderPage + components
│   │           ├── clients/         # ClientsMasterPage, ClientsReorderPage + components
│   │           ├── contacts/        # ContactsMasterPage, ContactsReorderPage + components
│   │           └── labprojects/     # LabProjectsMasterPage, LabProjectsReorderPage + components
│   │
│   ├── providers/
│   │   └── SocketSettingsProvider.tsx # React context: settings + connection + countdown
│   │
│   ├── routes/
│   │   ├── AppRoutes.tsx           # Declarative route tree
│   │   └── ProtectedRoute.tsx      # Auth guard (redirects to /login)
│   │
│   ├── store/                      # (empty — no Zustand/Redux used)
│   │
│   ├── types/                      # 16 TypeScript type definition files
│   │   ├── auth.ts
│   │   ├── blogsMaster.ts
│   │   ├── branchesMaster.ts
│   │   ├── clientsMaster.ts
│   │   ├── contactsMaster.ts
│   │   ├── dashboard.ts
│   │   ├── labProjectsMaster.ts
│   │   ├── membersMaster.ts
│   │   ├── partnersMaster.ts
│   │   ├── servicesMaster.ts
│   │   ├── settings.ts
│   │   ├── socket.ts
│   │   ├── statsMaster.ts
│   │   ├── testimonialsMaster.ts
│   │   ├── auditLogs.ts
│   │   └── ui.ts
│   │
│   └── utils/
│       └── cx.ts                   # Class name composer
│
└── public/                         # Static assets (SVG illustrations, favicons)
```

---

## Architecture & Design Patterns

### App Composition

```
main.tsx
  └── <QueryClientProvider client={queryClient}>
        └── <App>
              └── <SocketSettingsProvider>   ← Real-time settings context
                    └── <BrowserRouter>
                          └── <AppRoutes>
                                ├── /login → <LoginPage>
                                └── <ProtectedRoute>
                                      └── <AdminLayout>
                                            ├── <AdminSidebar>
                                            ├── <AdminNavbar>
                                            ├── <MaintenanceStatusBanner>  (inside main)
                                            └── <Outlet>                   ← page content
```

### TanStack Query Data Flow

All admin pages use TanStack Query for data. The standard pattern per page is:

```typescript
// Read
const query = useQuery({
  queryKey: ['resource-name', page, limit, search, ...filters],
  queryFn: () => apiFunction({ page, limit, search }),
  staleTime: 0,
  refetchOnMount: 'always',
})

// Mutate
const mutation = useMutation({
  mutationFn: deleteApiFunction,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['resource-name'] })
    showSuccessToast()
  },
  onError: (err) => showErrorToast(err),
})
```

### Navigation State Messaging Pattern

When a form page (e.g., `BlogFormPage`) completes a create/update operation, it calls:

```typescript
navigate('/admin/master/blogs', {
  state: { toastMessage: 'Blog created successfully.', toastVariant: 'success' },
})
```

The list page (`BlogsMasterPage`) reads this on mount via `useLocation().state` and shows the Toast. It then clears the state with `window.history.replaceState({})` to prevent re-showing on refresh.

### Reorder Page Pattern

Every ordered entity has a dedicated `/reorder` route using **dnd-kit**:
1. Loads the entire ordered list.
2. Renders a drag-sortable list where each item is wrapped in `<SortableContext>`.
3. On `DragEndEvent`, recalculates order positions.
4. Calls the reorder API (`PATCH /<entity>/:id` with new `order` value).
5. **Optimistic updates** are applied locally; errors roll back.

---

## Design System (CSS Variables)

Defined in `src/index.css`. Shared **exactly** with the client-side app — identical CSS variable names and values, ensuring consistent branding across both apps.

| Variable | Value | Purpose |
|---|---|---|
| `--ui-primary` | `#e02525` | Red brand color |
| `--ui-primary-strong` | `#c51d1d` | Darker red (hover/active) |
| `--ui-primary-soft` | `#fee2e2` | Light red (active nav bg) |
| `--ui-primary-softer` | `#fecaca` | Even lighter red |
| `--ui-danger` | `#dc2626` | Danger/error |
| `--ui-danger-strong` | `#b91c1c` | Dark danger |
| `--ui-neutral` | `#374151` | Gray neutral |
| `--ui-neutral-strong` | `#1f2937` | Dark gray |
| `--ui-surface` | `#ffffff` | Background |
| `--ui-surface-muted` | `#f8fafc` | Subtle section bg |
| `--ui-border` | `#e5e7eb` | Default borders |
| `--ui-border-strong` | `#d1d5db` | Stronger borders |
| `--ui-text` | `#111827` | Primary text |
| `--ui-muted` | `#6b7280` | Secondary text |
| `--ui-radius-md` | `0.75rem` | Medium rounding |
| `--ui-radius-lg` | `1rem` | Large rounding |
| `--ui-shadow-md` | `0 10px 25px rgba(17,24,39,0.08)` | Medium shadow |
| `--ui-shadow-lg` | `0 25px 50px rgba(17,24,39,0.16)` | Large shadow |

---

## Routing & Route Protection

### Route Tree

| Path | Component | Auth Required |
|---|---|---|
| `/` | `Navigate → /admin/dashboard` or `/login` | — |
| `/login` | `LoginPage` | Public (redirect if authed) |
| `/admin` | `AdminLayout` (via `ProtectedRoute`) | ✅ |
| `/admin/dashboard` | `AdminDashboardPage` | ✅ |
| `/admin/components` | `ComponentsPage` | ✅ |
| `/admin/audit-logs` | `AuditLogsPage` | ✅ |
| `/admin/master` | `Navigate → /admin/master/services` | ✅ |
| `/admin/master/services` | `ServicesMasterPage` | ✅ |
| `/admin/master/services/reorder` | `ServicesReorderPage` | ✅ |
| `/admin/master/stats` | `StatsMasterPage` | ✅ |
| `/admin/master/stats/reorder` | `StatsReorderPage` | ✅ |
| `/admin/master/testimonials` | `TestimonialsMasterPage` | ✅ |
| `/admin/master/testimonials/reorder` | `TestimonialsReorderPage` | ✅ |
| `/admin/master/partners` | `PartnersMasterPage` | ✅ |
| `/admin/master/partners/reorder` | `PartnersReorderPage` | ✅ |
| `/admin/master/branches` | `BranchesMasterPage` | ✅ |
| `/admin/master/branches/reorder` | `BranchesReorderPage` | ✅ |
| `/admin/master/branches/:branchId/team` | `BranchTeamPage` | ✅ |
| `/admin/master/branches/:branchId/team/reorder` | `BranchTeamReorderPage` | ✅ |
| `/admin/master/clients` | `ClientsMasterPage` | ✅ |
| `/admin/master/clients/reorder` | `ClientsReorderPage` | ✅ |
| `/admin/master/members` | `MembersMasterPage` | ✅ |
| `/admin/master/contacts` | `ContactsMasterPage` | ✅ |
| `/admin/master/contacts/reorder` | `ContactsReorderPage` | ✅ |
| `/admin/master/blogs` | `BlogsMasterPage` | ✅ |
| `/admin/master/blogs/create` | `BlogFormPage` (Create mode) | ✅ |
| `/admin/master/blogs/:blogId/edit` | `BlogFormPage` (Edit mode) | ✅ |
| `/admin/master/lab-projects` | `LabProjectsMasterPage` | ✅ |
| `/admin/master/lab-projects/reorder` | `LabProjectsReorderPage` | ✅ |
| `/admin/settings` | `SettingsPage` | ✅ |
| `*` | `Navigate → default` | — |

**Total routes: 30+** including nested and dynamic segments.

### `ProtectedRoute`

Reads `isAuthenticated()` (checks `localStorage` for a JWT token). If not authenticated, renders `<Navigate to="/login" state={{ from: currentPath }} replace />`. The login page reads `state.from` to redirect back after login.

---

## Layout System

### `AdminLayout.tsx`

The shell for all admin pages. Manages three sidebar states:

```
collapsed (boolean) — default: true (icon-only sidebar)
hovered (boolean)   — sidebar auto-expands on mouseenter via DOM event listener
locked (boolean)    — user can "pin" sidebar open permanently
```

```
sidebarExpanded = locked || hovered
lgPaddingLeft  = sidebarExpanded ? 'lg:pl-64' : 'lg:pl-18'
```

The sidebar DOM `ref` is used for mouseenter/mouseleave events to avoid re-renders from React synthetic events on every mouse move.

**Layout Anatomy:**

```
<div min-h-screen>
  <AdminSidebar collapsed mobileOpen locked .../>
  <AdminNavbar collapsed onToggle onMobile.../>
  <div lg:pl-{18|64} transition-all>
    <main pt-18>
      <MaintenanceStatusBanner />
      <Outlet />
    </main>
  </div>
</div>
```

### `AdminSidebar.tsx`

A responsive, collapsible sidebar with:

**Navigation Structure (NAV_LINKS):**
```
Dashboard              → /admin/dashboard
Master Data (group)    → collapsible accordion
  ├─ Services          → /admin/master/services
  ├─ Stats             → /admin/master/stats
  ├─ Testimonials      → /admin/master/testimonials
  ├─ Partners          → /admin/master/partners
  ├─ Clients           → /admin/master/clients
  ├─ Branches          → /admin/master/branches
  ├─ Contacts          → /admin/master/contacts
  └─ Lab Projects      → /admin/master/lab-projects
Team Members           → /admin/master/members
Blogs                  → /admin/master/blogs
Audit Logs             → /admin/audit-logs
Components             → /admin/components
Settings               → /admin/settings
```

**Key behaviors:**
- `NavItem` type supports both flat items (`to`) and groups (`children[]`), rendered recursively with `renderNavItem()`.
- Groups render with a toggle button + animated `FiChevronDown` icon; children appear under a left-border indent.
- Active route detection: `useLocation().pathname` + `findActiveParent()` highlights both the active leaf and its parent group.
- `expandedItems: Set<string>` manages which groups are open — starts with `'master-data'` expanded by default.
- On mobile: full-width drawer from left, triggered by the hamburger in `AdminNavbar`.
- **Pin button** at sidebar footer: toggles `locked` state; shows `FiLock` / `FiUnlock` with appropriate styling.
- Collapsed state: shows only icons; active group is indicated by a small dot below the icon.

### `AdminNavbar.tsx`

Top sticky header (height `4.5rem`) containing:
- **Hamburger button** (mobile only — triggers mobile sidebar).
- **Breadcrumb** derived from current `pathname`.
- **Collapse toggle** for desktop sidebar.
- **User info** (name + role badge) from `getAuthUser()`.
- **Logout button** that calls `clearAuthStorage()` and redirects to `/login`.

---

## Page Inventory — All Routes

**Total distinct page components:** 30+ React components across 17 distinct page UIs.

| Module | List Page | Reorder Page | Form/Detail |
|---|---|---|---|
| Dashboard | `AdminDashboardPage` | — | — |
| Blogs | `BlogsMasterPage` | — | `BlogFormPage` (create+edit) |
| Members | `MembersMasterPage` | — | `MemberFormModal` (inline modal) |
| Branches | `BranchesMasterPage` | `BranchesReorderPage` | — |
| Branch Team | `BranchTeamPage` | `BranchTeamReorderPage` | — |
| Services | `ServicesMasterPage` | `ServicesReorderPage` | Inline modal |
| Lab Projects | `LabProjectsMasterPage` | `LabProjectsReorderPage` | Inline modal |
| Stats | `StatsMasterPage` | `StatsReorderPage` | Inline modal |
| Testimonials | `TestimonialsMasterPage` | `TestimonialsReorderPage` | Inline modal |
| Partners | `PartnersMasterPage` | `PartnersReorderPage` | Inline modal |
| Clients | `ClientsMasterPage` | `ClientsReorderPage` | Inline modal |
| Contacts | `ContactsMasterPage` | `ContactsReorderPage` | Inline modal |
| Audit Logs | `AuditLogsPage` | — | Detail modal |
| Settings | `SettingsPage` | — | Full form page |

---

## Page Modules — Detailed Analysis

---

### 1. Login Page (`/login`)

**File:** `pages/auth/LoginPage.tsx`

**Design:** Split-screen — dark red gradient panel (left, desktop only) with illustration + brand name, white login form panel (right).

**Form handling:**
- Controlled `useState` for `email` and `password` (not React Hook Form).
- **Client-side Zod validation** via `loginSchema.safeParse()` before submitting.
- On success: calls `setAuthStorage(token, user)` then navigates to `fromPath` (from router state) or `/admin/dashboard`.
- On error: extracts `axiosError.response.data.message` and displays inline server error div.

**Auth flow:**
1. Client validates → calls `POST /api/auth/v1/login`.
2. Token + user stored in `localStorage` as `ibt_auth_token` + `ibt_auth_user`.
3. Router redirects to protected route.

---

### 2. Dashboard Page (`/admin/dashboard`)

**File:** `pages/admin/AdminDashboardPage.tsx`

The admin home page, composed of three sub-components:

```
<DashboardKpiGrid />       → Content count KPI cards (7 modules)
<DashboardStatusPanels />  → Blog status pie, Lab project status pie + trend chart
<DashboardRecentActivity /> → Recent audit log table + action summary
```

**Data fetching:**
- Single `useQuery` calling `getDashboardOverview({ recentLimit: 10, trendDays: 14 })`.
- `staleTime: 30_000` — refreshes every 30 seconds min.
- Three-state render: `isPending → Loader`, `isError → Error card with Retry`, `success → content`.

**KPI cards** link to individual master pages (e.g., clicking "Blogs: 42" navigates to `/admin/master/blogs`).

---

### 3. Blogs Master Page (`/admin/master/blogs`)

**File:** `pages/admin/BlogsMasterPage.tsx`

**Features:**
- **Multi-filter toolbar** (sticky, top of content): `SearchBox` + category text input + `Dropdown` (status filter) + `Dropdown` (featured filter).
- **TanStack Query** with `queryKey: ['master-blogs', page, limit, search, category, status, featured]` — all filters are part of the cache key.
- Blogs displayed as a 3-column card grid (`BlogsMasterCard` sub-component).
- **Navigation state messaging**: receives `{ toastMessage, toastVariant }` from `BlogFormPage` after create/update.
- **Delete flow**: Click delete → `setDeleteTarget({ id, label })` → `<DeleteConfirmationModal>` confirms → `deleteMutation.mutate(id)` → cache invalidation + success toast.
- Sticky `<Pagination>` at bottom.
- `staleTime: 0`, `refetchOnMount: 'always'` — ensures fresh data every visit.

---

### 4. Blog Form Page (`/admin/master/blogs/create` + `/:blogId/edit`)

**File:** `pages/admin/BlogFormPage.tsx`

The most feature-rich form in the admin panel.

**Mode detection:**
```typescript
const isEditMode = Boolean(blogId)  // from useParams()
```

**Form fields:**
| Field | Component | Notes |
|---|---|---|
| Title | `Input` | Required |
| Slug | `Input` | Kebab-case, required |
| Content | `RichTextEditor` | react-quill-new, required |
| Cover Image | `ImageUploadField` | File upload or URL |
| Category | `Input` | Optional |
| Published At | `Input` (datetime-local) | Optional |
| Status | `Dropdown` | DRAFT / PUBLISHED / ARCHIVED |
| Featured | `Dropdown` | Yes / No |

**Edit mode data loading strategy:**
- If navigated from the list via `navigate('/edit', { state: { blog } })` → initializes form from `location.state.blog` (immediate, no fetch).
- If accessed directly via URL → `useQuery` fetches `getBlogMasterItemById(blogId)` (enabled only when there's no state blog).

**Submit flow:**
1. Client-side validation (title, slug, non-empty content check via HTML strip).
2. If `selectedImageFile` is set, call `uploadBlogImage(file)` first → get `absoluteUrl`.
3. Compose `BlogMasterPayload` with ISO date for `publishedAt`.
4. Call `createBlogsMasterItem` or `updateBlogsMasterItem`.
5. On success: navigate back to list with success toast state.

**`ImageUploadField`** sub-component:
- Shows image preview when a file is selected or an existing URL exists.
- "Change" replaces file; "Remove" clears both file and URL.
- Uses `<input type="file" accept="image/*">`.

**`RichTextEditor`** wrapper:
- Wraps `react-quill-new` with a preconfigured toolbar: Bold, Italic, Underline, Strike, Header 1/2, ordered/unordered lists, Blockquote, Code Block, Link, Image, Divider, Clean, Undo/Redo.
- Exposes `label`, `helperText`, `minHeight`, `value`, `onChange`.

---

### 5. Members Master Page (`/admin/master/members`)

**File:** `pages/admin/MembersMasterPage.tsx`

**Features:**
- Members displayed as cards in a responsive grid.
- **Create/Edit form** is a `<Modal>` (not a separate page) — contains all member fields.
- **Filter by branch**: loads all branches, provides a `Dropdown` to filter members by `branchId`.
- Search input + pagination.
- Delete with confirmation modal.

---

### 6. Branches Master Pages (`/admin/master/branches`)

**Files:**
- `BranchesMasterPage.tsx` — full CRUD list with modal forms.
- `BranchesReorderPage.tsx` — drag-sort branches by order.
- `BranchTeamPage.tsx` — manage members assigned to a specific branch.
- `BranchTeamReorderPage.tsx` — drag-sort team members within a branch.

**Branch → Team navigation:**
- Each branch card in `BranchesMasterPage` has a "Manage Team" button that navigates to `/admin/master/branches/:branchId/team`.
- `BranchTeamPage` fetches branch details + current member assignments + all available members.
- Assign member: `assignMemberToBranch(branchId, { memberId })`.
- Remove member: `removeMemberFromBranch(branchId, memberId)`.

---

### 7. Services Master Pages (`/admin/master/services`)

**Files:** `ServicesMasterPage.tsx` + `ServicesReorderPage.tsx` + form components.

**Features:**
- CRUD with inline create/edit modal.
- Fields: `title`, `slug`, `description`, `imageUrl`, `tags` (comma-separated array input).
- Reorder page shows drag-sortable list; reorders via `PATCH /api/services/v1/:id { order }` per item.
- Upload image via `POST /api/uploads/v1/services`.

---

### 8. Lab Projects Master Pages (`/admin/master/lab-projects`)

**Files:** `LabProjectsMasterPage.tsx` + `LabProjectsReorderPage.tsx` + form components.

(Note: There is a typo in the directory name: `compoenets` instead of `components`.)

**Features:**
- The most field-rich master module: `title`, `slug`, `description`, `content`, `imageUrl`, `gallery[]`, `tags[]`, `techStack[]`, `projectUrl`, `repoUrl`, `status`, `featured`.
- Tags/tech/gallery fields accept comma-separated input, split into arrays for the API payload.
- Filter options: `status` (ONGOING/COMPLETED/ARCHIVED), `featured` filter.

---

### 9. Stats Master Pages (`/admin/master/stats`)

**Files:** `StatsMasterPage.tsx` + `StatsReorderPage.tsx`.

Fields: `label`, `value`, `category` (optional grouping), `order`.

---

### 10. Testimonials Master Pages (`/admin/master/testimonials`)

**Files:** `TestimonialsMasterPage.tsx` + `TestimonialsReorderPage.tsx`.

Fields: `name`, `content`, `role`, `company`, `avatarUrl`, `order`.

---

### 11. Partners Master Pages (`/admin/master/partners`)

**Files:** `PartnersMasterPage.tsx` + `PartnersReorderPage.tsx`.

Fields: `name`, `logoUrl`, `website`, `order`. Logo upload via `/api/uploads/v1/partners`.

---

### 12. Clients Master Pages (`/admin/master/clients`)

**Files:** `ClientsMasterPage.tsx` + `ClientsReorderPage.tsx`.

Fields: `name`, `logoUrl`, `order`. Minimal model.

---

### 13. Contacts Master Pages (`/admin/master/contacts`)

**Files:** `ContactsMasterPage.tsx` + `ContactsReorderPage.tsx`.

Fields: `type` (PHONE/EMAIL/ADDRESS), `value`, `order`.

---

### 14. Settings Page (`/admin/settings`)

**File:** `pages/admin/SettingsPage.tsx`

The most complex single-form page due to real-time sync integration.

**Form fields:**
| Field | Type | Description |
|---|---|---|
| `maintenanceMode` | checkbox | Toggles public site maintenance overlay |
| `maintenanceMessage` | textarea (255 char max) | Message shown to visitors |
| `maintenanceEndTime` | datetime-local | Countdown to restoration |

**Data strategy:**
- `useQuery` loads current settings directly as `SettingEntity[]` from `GET /api/settings/v1`.
- `settingsToForm()` maps the settings array to form values.
- **Real-time sync**: `SocketSettingsProvider.connection.lastUpdateAt` is watched in a `useEffect`. When a new socket update arrives (from another admin session e.g.), the query cache is **invalidated** and the form re-populates with fresh values.
- **Save strategy (diff-only)**: `saveSettings()` compares new form values to current cached values. Only **changed keys** are sent to `upsertSetting()` — batched via `Promise.all()`. If nothing changed, returns early without any API call.
- **Minute-epoch comparison** for `maintenanceEndTime`: Avoids false-positive "changed" detection when the datetime hasn't actually changed in meaningful precision.
- **Reset**: Reverts local form state from the TanStack Query cache.
- Sticky footer with **"Reset Changes"** + **"Save Settings"** buttons.
- **Connection status banner** at top: shows live sync status (connected/connecting/offline) pulled from socket context.
- **Zod validation** via `settingsSchema.safeParse()` before submit.

---

### 15. Audit Logs Page (`/admin/audit-logs`)

**File:** `pages/admin/AuditLogsPage.tsx`

**Features:**
- **Scrollable table layout**: `h-[calc(100vh-4.5rem)]` with `overflow-hidden` container; table body scrolls independently.
- **Debounced search**: `useDebouncedValue(searchInput, 450ms)` — query only fires 450ms after the user stops typing.
- **Filter bar**: search input + action `Dropdown` (CREATE/UPDATE/DELETE/LOGIN) + start date + end date inputs + "Clear" button.
- **Date range**: `startDate` → `${date}T00:00:00`, `endDate` → `${date}T23:59:59.999` (covers full day).
- **Pagination**: 20 logs per page; page resets on debounced search change.
- **Detail modal**: clicking "View" on a row triggers `useQuery` with `queryKey: ['audit-log-details', logId]` (enabled only while a log is selected) → shows `AuditLogDetailContent` with `oldData`/`newData` JSON diff.
- **`ActionBadge`** sub-component: color-coded badge for CREATE (green), UPDATE (blue), DELETE (red), LOGIN (gray).

---

### 16. Components Showcase Page (`/admin/components`)

**File:** `pages/admin/ComponentsPage.tsx`

A developer reference page that renders live demos of every shared UI component with their variants. Used during development to visually verify component appearance and behavior. Not customer-facing.

---

## API Layer (`src/api/`)

### `apiClient.ts` — Axios Instance

```typescript
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:5000',
})
```

**Request interceptor:** Reads `getAuthToken()` from `localStorage`; attaches `Authorization: Bearer <token>` header to every request.

**Response interceptor:**
- On `401` → calls `clearAuthStorage()` + redirects to `/login` (unless already there).
- On other errors → re-throws for TanStack Query / caller to handle.

---

### API Module Summary Table

| File | Base Path | Operations |
|---|---|---|
| `auth.ts` | `/api/auth/v1` | `login(payload)` |
| `blogsMaster.ts` | `/api/blogs/v1` | `get(paginated)`, `getById`, `create`, `update`, `delete`, `uploadBlogImage` |
| `branchesMaster.ts` | `/api/branches/v1` | `get(paginated)`, `getAll`, `getOne`, `create`, `update`, `delete`, `getBranchMembersPaginated`, `getAllBranchMembers`, `assignMember`, `updateMemberOrder`, `removeMember` |
| `clientsMaster.ts` | `/api/clients/v1` | `get(paginated)`, `getAll`, `create`, `update`, `delete`, `reorder` |
| `contactsMaster.ts` | `/api/contacts/v1` | `get(paginated)`, `getAll`, `create`, `update`, `delete`, `reorder` |
| `dashboard.ts` | `/api/dashboard/v1` | `getDashboardOverview({ recentLimit, trendDays })` |
| `labProjectsMaster.ts` | `/api/lab-projects/v1` | `get(paginated)`, `getAll`, `create`, `update`, `delete`, `reorder` |
| `membersMaster.ts` | `/api/members/v1` | `get(paginated)`, `getAll`, `create`, `update`, `delete` |
| `partnersMaster.ts` | `/api/partners/v1` | `get(paginated)`, `getAll`, `create`, `update`, `delete`, `reorder` |
| `servicesMaster.ts` | `/api/services/v1` | `get(paginated)`, `getAll`, `create`, `update`, `delete`, `reorder` |
| `settings.ts` | `/api/settings/v1` | `getSettings`, `upsertSetting`, `saveSettings` (diff-aware) |
| `statsMaster.ts` | `/api/stats/v1` | `get(paginated)`, `getAll`, `create`, `update`, `delete`, `reorder` |
| `testimonialsMaster.ts` | `/api/testimonials/v1` | `get(paginated)`, `getAll`, `create`, `update`, `delete`, `reorder` |
| `auditLogs.ts` | `/api/audit-logs/v1` | `getAuditLogs(paginated+filtered)`, `getAuditLogById` |
| `socketClient.ts` | WS connection | `connectSocket()`, `subscribeToSiteSettings(cb)` |

### Reorder API Pattern

All ordered entities use the same pattern to persist a new order:

```typescript
export async function reorderItems(items: Array<{ id: string; order: number }>) {
  return Promise.all(
    items.map((item) =>
      apiClient.patch(`${BASE_PATH}/${item.id}`, { order: item.order })
    )
  )
}
```

This sends N parallel PATCH requests (one per item). The backend handles each atomically.

### Upload API Pattern

Image uploads send `multipart/form-data` to `/api/uploads/v1/<category>`:

```typescript
const formData = new FormData()
formData.append('file', file)
await apiClient.post('/api/uploads/v1/blogs', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
})
```

Returns `{ absoluteUrl, relativeUrl, filename, ... }`.

---

## State Management — TanStack Query

TanStack Query (`@tanstack/react-query`) is the **exclusive data management layer**. There is no Redux, Zustand, or Context-based data store.

### QueryClient Configuration (`src/lib/queryClient.ts`)

```typescript
new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,            // retry failed queries once
      staleTime: 60_000,   // data fresh for 1 minute globally
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,            // no retry on mutations
    },
  },
})
```

### Query Key Conventions

| Resource | Key |
|---|---|
| Dashboard overview | `['dashboard-overview']` |
| Blog list | `['master-blogs', page, limit, search, category, status, featured]` |
| Single blog | `['master-blog', blogId]` |
| Audit logs | `['audit-logs', page, limit, search, action, from, to]` |
| Audit log detail | `['audit-log-details', logId]` |
| Settings | `['settings']` |

### Mutation → Cache Invalidation Pattern

After a successful mutation, TanStack Query propagates updates by:
1. **Invalidating** the list query → triggers background refetch.
2. **Setting query data** directly (for instant optimistic cache updates, used in Settings).
3. **Navigation state** carries the toast message to the list page.

---

## Real-Time System (Socket.io)

The admin panel subscribes to the same Socket.io `site-settings:updated` event as the public client. This serves a different purpose here: **admin awareness** rather than blocking the UI.

### `socketClient.ts`

```typescript
export function connectSocket(): Socket {
  if (!socket) {
    socket = io(import.meta.env.VITE_API_URL ?? 'http://localhost:5000', {
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      transports: ['websocket', 'polling'],
    })
  }
  return socket
}

export function subscribeToSiteSettings(
  callback: (payload: SiteSettingsRealtimePayload) => void,
): () => void {
  socket.on('site-settings:updated', callback)
  return () => { socket.off('site-settings:updated', callback) }
}
```

**Key difference from client-side:** `reconnectionAttempts: Infinity` (vs 5 on client) — admins should always stay connected.

### `useSocketSiteSettings` Hook

1. Fetches initial `getSettings()` on mount.
2. Calls `connectSocket()` to get the socket instance.
3. Subscribes to `site-settings:updated` via `subscribeToSiteSettings()`.
4. Tracks connection state: `status` (connecting/connected/disconnected/error), `connected`, `connecting`, `error`, `lastUpdateAt`.
5. Returns `{ settings, connection }` memoized.
6. Cleanup: runs `unsubscribe()` on component unmount; `active` flag prevents stale async state updates.

### `SocketSettingsProvider`

Wraps the app. Exposes:
- `settings` — `SiteSettingsRealtimePayload`
- `connection` — `SiteSettingsConnectionState`
- `isMaintenanceActive` — boolean alias
- `maintenanceCountdownText` — computed string like `"2h 30m remaining"` or `"Ending soon"`

### `MaintenanceStatusBanner`

Rendered inside `AdminLayout`, just below the `AdminNavbar`, before the page `<Outlet>`. Reads from `useSocketSettings()`. Only renders when `settings.maintenanceMode === true`. Shows:
- Amber warning banner with maintenance message.
- Socket connection badge (green `FiWifi` / gray `FiWifiOff`).
- Countdown text and last-updated time.

---

## Shared Component Library (`src/component/`)

All components are self-contained, typed, and import-ready via `src/component/index.ts`.

### `ActionButton`

Multi-intent button. Most-used component in the admin.

| Intent | Color | Icon | Use Case |
|---|---|---|---|
| `primary` | Red bg | — | Save, Create, Submit |
| `secondary` | White bg + border | — | Neutral actions |
| `ghost` | Transparent | — | Cancel, Reset |
| `save` | Green | `FiCheck` | Save operations |
| `update` | Blue | `FiEdit2` | Update operations |
| `delete` | Red | `FiTrash2` | Delete operations |
| `cancel` | Gray | `FiX` | Cancel operations |

**Props:** `intent`, `size` (sm/md/lg), `loading` (shows spinner + disables), `fullWidth`, `leftIcon`, `rightIcon`, `disabled`, `type`, `onClick`.

---

### `DeleteConfirmationModal`

Specialized modal for destructive confirmation:

```tsx
<DeleteConfirmationModal
  isOpen={Boolean(deleteTarget)}
  itemType="blog"
  itemLabel={deleteTarget?.label}
  loading={deleteMutation.isPending}
  onCancel={() => setDeleteTarget(null)}
  onConfirm={confirmDelete}
/>
```

Renders: "Delete {itemType}?" heading + "{itemLabel}" shown, Cancel + Delete buttons (delete button is red with loading state).

---

### `Modal`

Accessible dialog with:
- `role="dialog"`, `aria-modal="true"`.
- Focus trap (Tab/Shift+Tab cycles within modal).
- `Escape` key closes (configurable).
- Backdrop click closes (configurable).
- Sizes: `sm` (max-w-md), `md` (max-w-2xl), `lg` (max-w-4xl), `xl` (max-w-6xl).
- Optional `footer` slot for sticky action buttons.
- Auto-focus first focusable element on open; restores focus on close.

---

### `Pagination`

Bottom-sticky page navigation. Uses `hasPrev`/`hasNext` from the API response (not calculated client-side).

```tsx
<Pagination
  page={meta.page}
  totalPages={meta.totalPages}
  hasPrev={meta.hasPrev}
  hasNext={meta.hasNext}
  onPageChange={(nextPage) => setPage(nextPage)}
/>
```

---

### `SearchBox`

Debounced search input (300ms internal debounce). Calls `onSearch(value)` only after the user pauses typing. Shows a search icon + clear (×) button when value is non-empty.

---

### `Dropdown`

Single-select styled dropdown. Props: `options: Array<{ label, value }>`, `value`, `onChange`, `placeholder`, `className`.

---

### `Input`

Labeled text input with forward ref, supporting:
- `label`, `error`, `helperText`.
- `startIcon` / `endIcon` (icon rendered inside the input box).
- `showPasswordToggle` — adds eye icon for password fields.
- All standard `HTMLInputElement` props inherited.

---

### `RichTextEditor`

Wraps `react-quill-new` with a custom toolbar configuration. Toolbar groups:
- **Text format:** Bold, Italic, Underline, Strike
- **Headings:** H1, H2
- **Lists:** Ordered, Bullet
- **Blocks:** Blockquote, Code Block
- **Insert:** Link, Image, Divider (`hr`)
- **Actions:** Clean (clear formatting), Undo, Redo

Props: `value`, `onChange`, `label`, `helperText`, `placeholder`, `minHeight`, `className`.

---

### `Toast`

Auto-dismissing notification:
- Variants: `success` (green), `error` (red).
- `durationMs` countdown (default: 3600ms).
- Fixed position (bottom-right).
- Manual close button.

---

### `Tooltip`

Hover tooltip wrapping any child element. Shows a small popover with the `content` prop. Supports `position` (top/bottom/left/right).

---

### `Loader`

Loading spinner in two modes — inline (`size` sm/md/lg/number) or fullscreen (`fullscreen` prop).

---

## Auth Feature

**`src/features/auth/storage.ts`**

All authentication state is stored in `localStorage` — no server-side session:

| Key | Value |
|---|---|
| `ibt_auth_token` | JWT string |
| `ibt_auth_user` | JSON-serialized `AuthUser` |

Exported helpers:
- `getAuthToken()` — returns token or `null`.
- `getAuthUser()` — parses and returns user, or clears storage + returns `null` on JSON error.
- `setAuthStorage(token, user)` — saves both.
- `clearAuthStorage()` — removes both.
- `isAuthenticated()` — returns `Boolean(getAuthToken())`.

**`src/features/auth/validation.ts`**

```typescript
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})
```

---

## Settings Feature

**`src/features/settings/validation.ts`**

```typescript
const settingsSchema = z.object({
  maintenanceMessage: z.string().max(255),
  maintenanceEndTime: z.string().min(1, 'End time is required'),
})
```

Note: `maintenanceMode` (boolean checkbox) is not validated — it's always valid. Only message and end time can have validation errors.

---

## Hooks

### `useDebouncedValue<T>(value, delayMs = 350)`

Generic debounce hook. Creates a `setTimeout` that updates the returned copy of `value` after `delayMs`. Clears the timeout on every render where `value` or `delayMs` changes.

Used in: `AuditLogsPage` (450ms delay for search).

---

### `useSocketSiteSettings()`

Core real-time hook. Manages:
- `settings: SiteSettingsRealtimePayload` — current maintenance state.
- `connection: SiteSettingsConnectionState` — `{ status, connected, connecting, error, lastUpdateAt }`.

Lifecycle: async `bootstrap()` → fetch initial settings → connect socket → subscribe → set connection state → cleanup on unmount with `active` guard flag.

---

## Types System

16 type files — one per module. Common patterns:

### Generic Response Wrapper

```typescript
// From types/servicesMaster.ts
type MasterApiResponse<T> = {
  success: boolean
  message?: string
  data: T
  meta?: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}
```

### Entity Type Pattern

```typescript
// Example from types/blogsMaster.ts
type BlogMasterItem = {
  id: string
  title: string
  slug: string
  content: string
  imageUrl: string | null
  status: BlogStatus
  featured: boolean
  category: string | null
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

type BlogMasterPayload = {
  title: string
  slug: string
  content: string
  imageUrl?: string | null
  status?: BlogStatus
  featured?: boolean
  category?: string | null
  publishedAt?: string | null
}

type BlogListResult = {
  items: BlogMasterItem[]
  meta: NonNullable<MasterApiResponse<never>['meta']>
}
```

### Socket Types (`types/socket.ts`)

```typescript
type SiteSettingsRealtimePayload = {
  maintenanceMode: boolean
  maintenanceMessage: string | null
  maintenanceEndTime: string | null
  updatedAt: string | null
}

type SiteSettingsConnectionState = {
  status: 'connecting' | 'connected' | 'disconnected' | 'error'
  connected: boolean
  connecting: boolean
  error: string | null
  lastUpdateAt: string | null
}
```

---

## Utilities & Library Files

### `src/utils/cx.ts`

```typescript
export const cx = (...classes: Array<string | false | undefined>) =>
  classes.filter(Boolean).join(' ')
```

Used throughout every component for conditional class composition.

### `src/lib/queryClient.ts`

Singleton `QueryClient` with global defaults (retry:1, staleTime:60s, no refetch on window focus, no mutation retries). Provided at the root of `main.tsx`.

---

## Configuration & Environment

### Environment Variables

| Variable | Purpose | Fallback |
|---|---|---|
| `VITE_API_URL` | Backend API + Socket.io base URL | `http://localhost:5000` |

Accessed via `import.meta.env.VITE_API_URL` (Vite convention). Same variable controls both Axios base URL and Socket.io connection URL.

### `vite.config.ts`

```typescript
export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

Uses `@vitejs/plugin-react` and `@tailwindcss/vite` plugin. No custom aliases, proxy, or server config.

### `tsconfig.app.json`

- `"target": "ES2020"`, `"module": "ESNext"`, `"moduleResolution": "bundler"`.
- `"strict": true` — full TypeScript strict mode.
- No path aliases configured (all imports are relative or bare module imports).

---

## Observations & Recommendations

### Strengths

1. **TanStack Query throughout** — Consistent, cache-aware data layer across all 30+ admin routes; no ad-hoc `useState` fetching.
2. **Diff-only settings save** — Only changed settings keys are sent to the backend, avoiding unnecessary writes and reducing Socket.io noise.
3. **Navigation state messaging** — Elegant pattern for passing toast feedback across page navigations without global state.
4. **Collapsible, pinnable sidebar** — Polished UX with hover-expand, lock/unlock, mobile drawer, and keyboard accessibility.
5. **Reorder pages via dnd-kit** — Every ordered entity has a dedicated, clean drag-and-drop reorder UI.
6. **Real-time maintenance awareness** — Admins see a live banner with countdown and connection status immediately when maintenance mode changes.
7. **Shared type system** — 16 typed API files + 16 type definition files ensure full type safety from API call to UI render.
8. **Zod validation** — Both `loginSchema` and `settingsSchema` are validated client-side before submission.

### Areas for Improvement

1. **`src/store/` is empty** — The `store` directory exists but has no content. Either remove it or document its intended use.
2. **`src/features/page/sectionEditors/` is empty** — Placeholder with no implementation; should be removed or documented.
3. **Typo in directory name** — `pages/admin/master/labprojects/compoenets/` should be `components/`.
4. **No React Query DevTools** — Adding `@tanstack/react-query-devtools` (dev-only) would greatly help debugging query states during development.
5. **Reorder sends N parallel PATCH requests** — For entities with many items, this can create a large number of simultaneous API calls. Consider a batch reorder endpoint (`POST /reorder` with an ordered array of IDs) to reduce round-trips.
6. **`isAuthenticated()` checks token existence, not validity** — A corrupted or expired JWT in `localStorage` would pass the `ProtectedRoute` check, only failing on the first API call (which triggers the 401 interceptor). Consider decoding the token to verify expiry on the client as a quick guard.
7. **No role-based UI gating** — The user's `role` (ADMIN/MANAGER) is stored but no admin route or UI element adjusts based on it. A MANAGER-role user can access the Settings page (which is ADMIN-only on the backend). The API will reject the request, but showing the UI is unnecessary.
8. **Forms don't use React Hook Form** — The `BlogFormPage` and `SettingsPage` use plain `useState` with manual validation (despite `react-hook-form` and `@hookform/resolvers/zod` being installed). Field error state is managed manually. Migrating to `useForm + zodResolver` would reduce boilerplate. However, most master entity modal forms in `master/` do use it.
9. **No loading indicator during route transitions** — There's no route-change progress bar (e.g., NProgress) between admin pages.
10. **Blog content XSS risk** — `RichTextEditor` produces HTML; it is stored and returned as-is by the backend. If this HTML is ever rendered via `dangerouslySetInnerHTML` on the public site, XSS is a concern. Server-side sanitization (e.g., `sanitize-html`) or client-side DOMPurify should be applied before rendering.
11. **Socket.io reconnects indefinitely** (`reconnectionAttempts: Infinity`) — while intentional for admins, this means if the backend is permanently down, the Socket.io client will loop forever in the background. A maximum threshold with a user-visible "Connection lost" message would be better UX.

---

## Route & Feature Summary Table

| Route | Page | API Used | Key Libraries |
|---|---|---|---|
| `/login` | `LoginPage` | `auth.ts` | Zod, Axios |
| `/admin/dashboard` | `AdminDashboardPage` | `dashboard.ts` | TanStack Query |
| `/admin/master/blogs` | `BlogsMasterPage` | `blogsMaster.ts` | TanStack Query |
| `/admin/master/blogs/create` | `BlogFormPage` | `blogsMaster.ts` | TanStack Query, react-quill-new |
| `/admin/master/blogs/:id/edit` | `BlogFormPage` | `blogsMaster.ts` | TanStack Query, react-quill-new |
| `/admin/master/members` | `MembersMasterPage` | `membersMaster.ts`, `branchesMaster.ts` | TanStack Query |
| `/admin/master/branches` | `BranchesMasterPage` | `branchesMaster.ts` | TanStack Query |
| `/admin/master/branches/reorder` | `BranchesReorderPage` | `branchesMaster.ts` | dnd-kit |
| `/admin/master/branches/:id/team` | `BranchTeamPage` | `branchesMaster.ts`, `membersMaster.ts` | TanStack Query |
| `/admin/master/branches/:id/team/reorder` | `BranchTeamReorderPage` | `branchesMaster.ts` | dnd-kit |
| `/admin/master/services` | `ServicesMasterPage` | `servicesMaster.ts` | TanStack Query |
| `/admin/master/services/reorder` | `ServicesReorderPage` | `servicesMaster.ts` | dnd-kit |
| `/admin/master/lab-projects` | `LabProjectsMasterPage` | `labProjectsMaster.ts` | TanStack Query |
| `/admin/master/lab-projects/reorder` | `LabProjectsReorderPage` | `labProjectsMaster.ts` | dnd-kit |
| `/admin/master/stats` | `StatsMasterPage` | `statsMaster.ts` | TanStack Query |
| `/admin/master/stats/reorder` | `StatsReorderPage` | `statsMaster.ts` | dnd-kit |
| `/admin/master/testimonials` | `TestimonialsMasterPage` | `testimonialsMaster.ts` | TanStack Query |
| `/admin/master/testimonials/reorder` | `TestimonialsReorderPage` | `testimonialsMaster.ts` | dnd-kit |
| `/admin/master/partners` | `PartnersMasterPage` | `partnersMaster.ts` | TanStack Query |
| `/admin/master/partners/reorder` | `PartnersReorderPage` | `partnersMaster.ts` | dnd-kit |
| `/admin/master/clients` | `ClientsMasterPage` | `clientsMaster.ts` | TanStack Query |
| `/admin/master/clients/reorder` | `ClientsReorderPage` | `clientsMaster.ts` | dnd-kit |
| `/admin/master/contacts` | `ContactsMasterPage` | `contactsMaster.ts` | TanStack Query |
| `/admin/master/contacts/reorder` | `ContactsReorderPage` | `contactsMaster.ts` | dnd-kit |
| `/admin/audit-logs` | `AuditLogsPage` | `auditLogs.ts` | TanStack Query, useDebouncedValue |
| `/admin/settings` | `SettingsPage` | `settings.ts` | TanStack Query, Zod, Socket.io |
| `/admin/components` | `ComponentsPage` | — | All shared components |

---

*Report generated by automated codebase analysis — April 28, 2026*
