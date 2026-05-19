# FluxAI Gateway — Frontend Architecture & Implementation Specification

> **Product:** FluxAI Gateway — Universal OpenAI-Compatible Multi-Key AI API Gateway
> **Frontend Package:** `apps/web/`
> **Stack:** Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, Lucide React, Lenis, Shiki, TanStack Query, Zustand
> **Design Direction:** Muted steel blue, infrastructure control center aesthetic, operational systems feel, subtle topology visuals

---

## 1. Frontend Overview

### 1.1 Frontend Goals

- **Public surface:** Marketing landing page, pricing, model directory, documentation, system status
- **Authenticated surface:** User dashboard (usage analytics, billing, API keys, settings), admin dashboard (provider key pool, model mappings, user management, margin analytics, emergency controls)
- **Integration surface:** Seamless communication with the existing Fastify backend via typed API client, SSE streaming for real-time updates, NextAuth for session management
- **Developer-first UX:** Code snippets, API playground, copy-paste curl examples, syntax-highlighted reference docs

### 1.2 Architecture Philosophy

- **Server-first rendering:** Use Next.js Server Components for initial data fetches on all routes. Reduces client-side waterfalls and improves SEO on marketing pages.
- **Islands of interactivity:** Client Components only where state/event handlers are needed (dashboards, forms, animations, charts). Everything else remains server-rendered.
- **Typed integration:** The `packages/shared` package containing Zod schemas is consumed by both frontend and backend. The frontend API client is generated from these shared types, ensuring end-to-end type safety.
- **Progressive enhancement:** Core content rendered server-side; interactive visualizations and streaming enhancements hydrate client-side.

### 1.3 Integration Strategy

| Backend Surface | Frontend Integration |
|---|---|
| `/v1/chat/completions` | API Playground in docs; usage dashboard charts |
| `/api/user/*` (Dashboard API) | TanStack Query hooks in dashboard pages |
| `/api/user/events` (SSE) | EventSource consumer for live balance, outage alerts |
| `/admin/*` (Admin API) | Admin dashboard React Query hooks |
| `/webhooks/stripe` | Server-side only (Fastify), not frontend-facing |
| `packages/shared` | Imported for all type definitions and Zod schemas |

### 1.4 Developer-First UX Goals

- Copy-paste `curl` examples on every docs page
- API key creation shows raw key **once** with copy button and persistent warning
- Syntax-highlighted code blocks with language tabs (Python, Node.js, curl)
- API Playground with live request builder and response viewer
- Inline endpoint documentation with request/response schemas rendered from Zod

### 1.5 Responsive Philosophy

- **Desktop-first** design (16:9 viewport as primary canvas)
- Mobile adapts via stacked layouts, collapsible navigation, simplified visualizations
- Tablets receive desktop-adjacent layouts with tighter spacing
- Infrastructure visualizations degrade gracefully: full topology on desktop, simplified single-flow on mobile

### 1.6 Accessibility Goals

- WCAG 2.1 AA compliance on all marketing and auth pages
- WCAG 2.1 A compliance on dashboard (charts are inherently visual; provide data table fallbacks)
- Keyboard navigation for all interactive elements
- Screen reader labels on all controls and status indicators
- Focus management on modal dialogs and route changes

### 1.7 Performance Goals

- Lighthouse score ≥ 95 on marketing pages
- Lighthouse score ≥ 90 on dashboard pages
- FCP < 1.5s, LCP < 2.5s, TBT < 200ms, CLS < 0.1
- Streaming SSR for dashboard data-heavy pages
- Partial prerendering where applicable (Next.js PPR)

### 1.8 Visual Language

**Infrastructure-inspired aesthetic:**
- Graphite black backgrounds (`#0a0a0b`) — conveys operational depth, reliability
- Soft white text (`#f5f5f5`) — readability without harsh contrast
- Muted steel blue accents (`#4a7fb5` to `#6b9fd4`) — infrastructure, control, trust
- Subtle topology line visuals — node connections, request routing paths

**Operational UI philosophy:**
- Every visual element communicates system state
- Status indicators use muted, professional colors (not traffic-light bright)
- Charts feel like infrastructure monitoring dashboards, not consumer analytics
- Typography is precise, monospaced where technical, sans-serif for readability

---

## 2. Monorepo & Frontend Structure

### 2.1 TurboRepo & pnpm Workspace

```
fluxai/
├── apps/
│   ├── api/           # Fastify backend (Phase 1-10, actively developed)
│   └── web/           # Next.js frontend (THIS DOCUMENT)
├── packages/
│   └── shared/        # @fluxai/shared — Zod schemas, TypeScript types
├── pnpm-workspace.yaml
├── turbo.json
└── package.json       # Root: workspaces = ["apps/*", "packages/*"]
```

**Turbo pipeline:**
```json
{
  "tasks": {
    "dev": { "cache": false, "persistent": true },
    "build": { "dependsOn": ["^build"], "outputs": ["dist/**", ".next/**"] },
    "lint": {},
    "test": { "dependsOn": ["build"] }
  }
}
```

**Shared package import pattern:**
```ts
// Frontend consumes shared schemas and types directly:
import type { OpenAIChatRequest, OpenAIChatResponse } from "@fluxai/shared/types";
import { OpenAIChatRequestSchema } from "@fluxai/shared/schemas";
import { MessageSchema } from "@fluxai/shared";
```

### 2.2 Frontend App Structure

```
apps/web/
├── app/
│   ├── (marketing)/               # Route group — no layout wrapper needed
│   │   ├── page.tsx               # Landing page ("/")
│   │   ├── pricing/
│   │   │   └── page.tsx
│   │   ├── models/
│   │   │   └── page.tsx
│   │   ├── changelog/
│   │   │   └── page.tsx
│   │   └── status/
│   │       └── page.tsx
│   ├── (auth)/                    # Auth pages — different layout
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   ├── verify-email/
│   │   │   └── page.tsx
│   │   ├── forgot-password/
│   │   │   └── page.tsx
│   │   └── reset-password/
│   │       └── page.tsx
│   ├── (docs)/                    # Documentation — SSG preferred
│   │   ├── docs/
│   │   │   ├── page.tsx
│   │   │   ├── quickstart/
│   │   │   │   └── page.tsx
│   │   │   ├── api-reference/
│   │   │   │   └── page.tsx
│   │   │   └── sdks/
│   │   │       └── page.tsx
│   │   └── layout.tsx             # Docs sidebar + TOC layout
│   ├── dashboard/                 # User dashboard (auth required)
│   │   ├── page.tsx               # Overview
│   │   ├── usage/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── billing/
│   │   │   ├── page.tsx
│   │   │   ├── top-up/
│   │   │   │   └── page.tsx
│   │   │   └── payment-methods/
│   │   │       └── page.tsx
│   │   ├── api-keys/
│   │   │   ├── page.tsx
│   │   │   ├── create/
│   │   │   │   └── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   └── layout.tsx             # Dashboard shell (sidebar + header)
│   ├── settings/                  # User settings (auth required)
│   │   ├── page.tsx
│   │   ├── profile/
│   │   │   └── page.tsx
│   │   ├── security/
│   │   │   └── page.tsx
│   │   ├── notifications/
│   │   │   └── page.tsx
│   │   └── billing-address/
│   │       └── page.tsx
│   ├── help/
│   │   ├── page.tsx
│   │   ├── contact/
│   │   │   └── page.tsx
│   │   └── debug/
│   │       └── page.tsx
│   ├── admin/                     # Admin dashboard (admin role required)
│   │   ├── page.tsx
│   │   ├── users/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── provider-keys/
│   │   │   ├── page.tsx
│   │   │   └── create/
│   │   │       └── page.tsx
│   │   ├── model-mappings/
│   │   │   ├── page.tsx
│   │   │   └── create/
│   │   │       └── page.tsx
│   │   ├── ledgers/
│   │   │   └── page.tsx
│   │   ├── margins/
│   │   │   └── page.tsx
│   │   ├── health/
│   │   │   └── page.tsx
│   │   ├── emergency/
│   │   │   └── page.tsx
│   │   └── layout.tsx             # Admin shell (admin sidebar + header)
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx                 # Root layout (providers, fonts, metadata)
│   └── not-found.tsx
├── components/
│   ├── marketing/
│   │   ├── navbar.tsx
│   │   ├── hero-section.tsx
│   │   ├── feature-grid.tsx
│   │   ├── pricing-table.tsx
│   │   ├── pricing-calculator.tsx
│   │   ├── cta-section.tsx
│   │   ├── footer.tsx
│   │   ├── security-section.tsx
│   │   ├── integrations-section.tsx
│   │   ├── architecture-section.tsx
│   │   └── model-directory.tsx
│   ├── infrastructure/
│   │   ├── gateway-visualization.tsx
│   │   ├── request-flow.tsx
│   │   ├── topology-canvas.tsx
│   │   ├── provider-card.tsx
│   │   ├── provider-grid.tsx
│   │   ├── latency-indicator.tsx
│   │   ├── health-badge.tsx
│   │   ├── token-stream.tsx
│   │   ├── circuit-breaker-status.tsx
│   │   ├── key-pool-indicator.tsx
│   │   ├── failover-animation.tsx
│   │   └── streaming-terminal.tsx
│   ├── docs/
│   │   ├── docs-sidebar.tsx
│   │   ├── docs-toc.tsx
│   │   ├── docs-search.tsx
│   │   ├── mdx-content.tsx
│   │   ├── api-endpoint-card.tsx
│   │   ├── schema-table.tsx
│   │   └── method-badge.tsx
│   ├── code/
│   │   ├── syntax-block.tsx
│   │   ├── code-tabs.tsx
│   │   ├── copy-button.tsx
│   │   ├── api-playground.tsx
│   │   ├── curl-preview.tsx
│   │   └── inline-code.tsx
│   ├── dashboard/
│   │   ├── dashboard-shell.tsx
│   │   ├── sidebar-nav.tsx
│   │   ├── dashboard-header.tsx
│   │   ├── stats-card.tsx
│   │   ├── usage-chart.tsx
│   │   ├── token-burn-chart.tsx
│   │   ├── latency-chart.tsx
│   │   ├── model-breakdown.tsx
│   │   ├── balance-card.tsx
│   │   ├── api-key-card.tsx
│   │   ├── api-key-create-modal.tsx
│   │   ├── recent-activity.tsx
│   │   ├── transaction-list.tsx
│   │   └── top-up-button.tsx
│   ├── auth/
│   │   ├── login-form.tsx
│   │   ├── register-form.tsx
│   │   ├── oauth-buttons.tsx
│   │   ├── forgot-password-form.tsx
│   │   └── reset-password-form.tsx
│   ├── admin/
│   │   ├── admin-shell.tsx
│   │   ├── admin-sidebar.tsx
│   │   ├── admin-header.tsx
│   │   ├── user-table.tsx
│   │   ├── provider-key-table.tsx
│   │   ├── provider-key-form.tsx
│   │   ├── model-mapping-table.tsx
│   │   ├── model-mapping-form.tsx
│   │   ├── margin-chart.tsx
│   │   ├── ledger-table.tsx
│   │   ├── health-grid.tsx
│   │   ├── emergency-controls.tsx
│   │   └── confirm-action-modal.tsx
│   ├── ui/
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── tooltip.tsx
│   │   ├── badge.tsx
│   │   ├── card.tsx
│   │   ├── table.tsx
│   │   ├── tabs.tsx
│   │   ├── separator.tsx
│   │   ├── skeleton.tsx
│   │   ├── toast.tsx
│   │   ├── alert.tsx
│   │   ├── label.tsx
│   │   ├── checkbox.tsx
│   │   ├── switch.tsx
│   │   └── avatar.tsx
│   └── shared/
│       ├── logo.tsx
│       ├── gradient-text.tsx
│       ├── section-container.tsx
│       ├── animated-counter.tsx
│       ├── empty-state.tsx
│       └── error-boundary.tsx
├── hooks/
│   ├── use-api-keys.ts
│   ├── use-usage.ts
│   ├── use-balance.ts
│   ├── use-ledger.ts
│   ├── use-health.ts
│   ├── use-sse.ts
│   ├── use-models.ts
│   ├── use-in-view.ts
│   ├── use-scroll-progress.ts
│   ├── use-media-query.ts
│   └── use-copy-to-clipboard.ts
├── lib/
│   ├── api-client.ts              # Typed API client for Fastify backend
│   ├── auth-helpers.ts            # NextAuth session utilities
│   ├── constants.ts               # Frontend constants
│   ├── utils.ts                   # General utilities (cn, formatCurrency, formatTokens)
│   ├── api-endpoints.ts           # Route constants for API
│   └── motion-presets.ts          # Reusable Framer Motion variants
├── providers/
│   ├── query-provider.tsx         # TanStack Query provider
│   ├── theme-provider.tsx
│   ├── session-provider.tsx       # NextAuth SessionProvider
│   └── toast-provider.tsx
├── stores/
│   └── ui-store.ts                # Zustand — UI state only (sidebar open, mobile menu, theme)
├── styles/
│   └── globals.css                # Tailwind directives + custom design tokens
├── types/
│   ├── dashboard.ts               # Dashboard-specific types
│   ├── docs.ts                    # Documentation types
│   └── api.ts                     # API response wrapper types
├── content/
│   ├── docs/
│   │   ├── index.mdx
│   │   ├── quickstart.mdx
│   │   ├── api-reference.mdx
│   │   └── sdks.mdx
│   └── changelog/
│       └── entries.json
├── public/
│   ├── og-image.png
│   ├── favicon.ico
│   └── topology-bg.svg
├── auth.ts                        # NextAuth v5 configuration
├── auth.config.ts                 # Auth edge config
├── middleware.ts                  # Next.js middleware — route protection
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

### 2.3 Folder Purposes

| Folder | Purpose |
|---|---|
| `app/` | Next.js App Router pages + layouts. Route groups `(marketing)`, `(auth)`, `(docs)` control layout inheritance. |
| `components/` | Reusable UI components, organized by domain. `ui/` contains shadcn/ui primitives. |
| `hooks/` | Custom React hooks — data fetching (TanStack Query wrappers), SSE subscription, viewport detection, clipboard. |
| `lib/` | Pure utility code — API client, auth helpers, constants, motion presets. No React code here. |
| `providers/` | React context providers — TanStack Query, NextAuth SessionProvider, Theme, Toast. |
| `stores/` | Zustand stores — UI state only (sidebar toggle, mobile menu, theme preference). Server state lives in TanStack Query. |
| `styles/` | Global CSS with Tailwind directives and custom CSS design tokens. |
| `types/` | Frontend-only TypeScript types (API response wrappers, dashboard types, doc types). |
| `content/` | MDX content for documentation and changelog. Rendered with `next-mdx-remote` or `@next/mdx`. |
| `public/` | Static assets — OG images, favicons, background SVGs. |
| `auth.ts` | NextAuth v5 configuration file (database adapter, providers, callbacks). |
| `middleware.ts` | Next.js Edge Middleware for route protection (auth redirects, admin role gating). |

### 2.4 Shared Package Integration

The `@fluxai/shared` package is imported directly:

```ts
// Type consumption:
import type { OpenAIChatRequest, OpenAIChatResponse, OpenAIChatResponseSchema } from "@fluxai/shared";

// Schema consumption (for form validation, API playground):
import { OpenAIChatRequestSchema } from "@fluxai/shared/schemas";

// Runtime validation in API playground:
const parsed = OpenAIChatRequestSchema.safeParse(body);
```

---

## 3. Complete Routing System

### 3.1 Route Table

#### Public / Marketing (No Auth)

| Route | Page | Render Strategy | Description |
|---|---|---|---|
| `/` | Landing | SSR (streaming) | Hero, gateway visualization, feature sections, CTA |
| `/pricing` | Pricing | SSG + ISR (revalidate 1h) | Model pricing table, pay-as-you-go calculator |
| `/models` | Model Directory | SSR | Supported models table with provider badges and capabilities |
| `/changelog` | Changelog | SSG | Product updates, new model announcements |
| `/status` | System Status | SSR | Public provider health grid, uptime history |

#### Authentication (No Auth)

| Route | Page | Description |
|---|---|---|
| `/login` | Sign In | Email/password + OAuth (Google, GitHub) |
| `/register` | Sign Up | Account creation form |
| `/verify-email` | Verify Email | Token handler from email link |
| `/forgot-password` | Forgot Password | Reset request form |
| `/reset-password` | Reset Password | New password form with token |

#### Documentation (No Auth)

| Route | Page | Render Strategy | Description |
|---|---|---|---|
| `/docs` | Overview | ISR (revalidate 5m) | Introduction, architecture overview, concepts |
| `/docs/quickstart` | Quickstart | ISR | Copy-paste curl example, API key setup |
| `/docs/api-reference` | API Reference | ISR | Full endpoint spec with request/response schemas |
| `/docs/sdks` | SDKs | ISR | Python, Node.js, Go integration examples |

#### Auth (Required)

| Route | Page | Description |
|---|---|---|
| `/dashboard` | Overview | Balance, today's usage, active keys, recent activity |
| `/dashboard/usage` | Usage Analytics | Token burn charts, request volume, latency, model breakdown |
| `/dashboard/usage/[id]` | Request Detail | Single request metadata (no content) |
| `/dashboard/billing` | Billing & Balance | Balance, top-up CTA, transaction history |
| `/dashboard/billing/top-up` | Top Up | Stripe Checkout redirect (or embedded) |
| `/dashboard/billing/payment-methods` | Payment Methods | Managed card list |
| `/dashboard/api-keys` | API Keys | List masked keys, usage per key |
| `/dashboard/api-keys/create` | Create Key | Generate new key (shown once) |
| `/dashboard/api-keys/[id]` | Key Detail | Per-key stats, edit label, revoke |
| `/settings/profile` | Profile | Display name, email, timezone |
| `/settings/security` | Security | Password change, sessions, 2FA |
| `/settings/notifications` | Notifications | Email alert preferences |
| `/settings/billing-address` | Billing Address | Invoice details, tax info |
| `/help` | Support Center | Knowledge base, FAQ |
| `/help/contact` | Contact Support | Ticket form |
| `/help/debug` | Debug Logging | Toggle opt-in content logging |

#### Admin (Admin Role Required)

| Route | Page | Description |
|---|---|---|
| `/admin` | Admin Overview | KPIs, daily revenue, system health, alerts |
| `/admin/users` | User Management | Paginated user list, search, suspend |
| `/admin/users/[id]` | User Detail | Full profile, usage, ledger, controls |
| `/admin/provider-keys` | Provider Key Pool | All keys table with status and credits |
| `/admin/provider-keys/create` | Add Provider Key | Form to submit encrypted upstream key |
| `/admin/model-mappings` | Model Mappings | Model → provider mapping table, inline editor |
| `/admin/model-mappings/create` | Add Model Mapping | Form for new model alias mapping |
| `/admin/ledgers` | Usage Ledger | Immutable ledger browser, filterable |
| `/admin/margins` | Margin Analytics | Revenue charts, per-model margin breakdown |
| `/admin/health` | System Health | Provider status, key pool health, queue depth |
| `/admin/emergency` | Emergency Controls | Drain provider, force rotate all keys |

### 3.2 Layouts

```
Root Layout (app/layout.tsx)
├── Providers (QueryClient, Session, Theme, Toast)
├── Font loading (Inter, JetBrains Mono)
├── Global metadata
│
├── (marketing) Layout
│   ├── Navbar (sticky, transparent → solid on scroll)
│   ├── [page content]
│   └── Footer
│
├── (auth) Layout
│   ├── Centered card
│   ├── Logo
│   └── Minimal shell (no navbar/footer)
│
├── (docs) Layout
│   ├── DocsSidebar (left, sticky, collapsible on mobile)
│   ├── [page content]
│   └── DocsTOC (right, sticky, desktop only)
│
├── dashboard Layout
│   ├── DashboardShell
│   │   ├── SidebarNav (collapsible, icon-only on tablet)
│   │   ├── DashboardHeader (breadcrumb, user menu, notifications)
│   │   └── [page content]
│   └── Auth guard: redirect to /login if no session
│
└── admin Layout
    ├── AdminShell
    │   ├── AdminSidebar (similar to dashboard but admin links)
    │   ├── AdminHeader
    │   └── [page content]
    └── Auth guard: check user.role === 'admin', else redirect to /dashboard
```

### 3.3 Loading States

- **Marketing pages:** Streaming SSR with React Suspense boundaries around heavy sections. Skeleton placeholders for data-dependent sections (pricing, models).
- **Docs pages:** ISR with `loading.tsx` for fallback showing sidebar skeleton + content skeleton.
- **Dashboard pages:** `loading.tsx` at route segment level. Skeleton cards for stats, skeleton lines for charts. All data fetched via TanStack Query with `pending` → `error` → `success` pattern.
- **Admin pages:** Same pattern as dashboard. Data tables show skeleton rows.

### 3.4 SEO Strategy

- **Root layout metadata:** Title template `"%s — FluxAI Gateway"`, default description, OpenGraph image
- **Marketing pages:** Individual `metadata` exports with targeted titles, descriptions, canonical URLs
- **Docs pages:** `generateMetadata` from MDX frontmatter
- **Dashboard/Admin pages:** `noindex, nofollow` (not for search visibility)
- **Sitemap:** `sitemap.ts` generating all public routes
- **Robots:** `robots.ts` allowing marketing/docs, disallowing dashboard/admin

### 3.5 Protected Routes

Next.js Edge Middleware (`middleware.ts`):

```ts
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAdmin = req.auth?.user?.role === "admin";

  // Protected routes
  if (req.nextUrl.pathname.startsWith("/dashboard") && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (req.nextUrl.pathname.startsWith("/settings") && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Admin routes
  if (req.nextUrl.pathname.startsWith("/admin") && !isAdmin) {
    return isLoggedIn
      ? NextResponse.redirect(new URL("/dashboard", req.url))
      : NextResponse.redirect(new URL("/login", req.url));
  }

  // Redirect logged-in users away from auth pages
  if (isLoggedIn && req.nextUrl.pathname.match(/^\/(login|register)/)) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/settings/:path*", "/admin/:path*", "/login", "/register"],
};
```

### 3.6 Motion Behavior

- **Page transitions:** No route-level page transitions (Next.js App Router handles this natively). Avoid full-page animations that conflict with React's concurrent rendering.
- **Section reveals:** Scroll-triggered `opacity` + `translateY` on marketing sections with `useInView` hook and Framer Motion `whileInView`.
- **Dashboard:** No section reveals — dashboards should feel instant and operational.
- **Loading → Content:** Subtle fade-in (opacity 0→1, 200ms) when data arrives from TanStack Query.

---

## 4. Landing Page Architecture

### 4.1 Section-by-Section Breakdown

#### Navbar

- **Purpose:** Primary navigation with brand identity
- **Layout:** Fixed, full-width, z-50. Logo left, nav links center, CTAs right
- **States:** Transparent background at top of page → solid graphite (`#0a0a0b`) with `backdrop-blur` after scroll > 50px. Border-bottom appears on scroll
- **Items:** FluxAI Gateway logo, Docs, API Reference, Pricing, Status, Login (text button), Get Started (primary CTA button — steel blue)
- **Mobile:** Hamburger menu → slide-out drawer with full nav links. Backdrop blur on drawer overlay
- **Motion:** Navbar background transition (300ms ease), mobile menu slide-in from right (300ms spring)
- **Implementation:** `components/marketing/navbar.tsx` — Client Component for scroll detection, uses `useScrollProgress` hook

#### Hero Section

- **Purpose:** First impression — communicate "AI infrastructure gateway" instantly
- **Layout:** Full viewport height minus navbar. Centered content with surrounding negative space
- **Content:** 
  - Eyebrow: "AI INFRASTRUCTURE" in muted steel blue, monospaced, tracking-widest
  - Headline: "One API. Every model. Zero overhead." (Inter, 5xl-7xl, tight tracking)
  - Subheadline: "Universal OpenAI-compatible gateway with intelligent key pooling, automatic failover, and real-time credit tracking." (text-lg, muted gray)
  - Two CTAs: "Get Started" (primary), "View Docs" (secondary, outlined)
  - Below CTAs: curl preview in code block — `curl -X POST https://api.fluxai.gateway/v1/chat/completions -H "Authorization: Bearer $FLUXAI_API_KEY" -d '{"model":"gpt-4o","messages":[{"role":"user","content":"Hello"}]}'`
- **Background:** Dark graphite `#0a0a0b` with subtle topology-line SVG pattern. Very faint, nearly imperceptible animated nodes at line intersections
- **Motion:** 
  - Headline: `opacity` 0→1, `translateY` 20→0, stagger 100ms, duration 600ms each
  - Subheadline: same but delay 200ms
  - CTAs: fade in after 400ms
  - Topology background: subtle pulse on node points, 3-5s cycle
- **Responsive:** Mobile: headline scales to 3xl, subheadline text-base, CTA buttons stack vertically, curl preview visible but scrollable on x-axis
- **Implementation:** `components/marketing/hero-section.tsx` — Server Component for static content, Client Component wrapper for topology animation

#### Infrastructure Visualization

- **Purpose:** Demonstrate the core product — request routing, key pooling, failover — visually
- **Layout:** Full-width section, centered content, max-w-6xl. ~600px tall on desktop
- **Visual:** Animated topology diagram showing:
  - Left: "Client" node with request arrow
  - Center: FluxAI Gateway hexagon with interior components (Auth → Rate Limiter → Key Pool → Provider Mapper → Adapter)
  - Right: Provider nodes (OpenRouter, Together, Groq, OpenAI, Anthropic, Gemini)
  - Flowing particles along connection paths representing requests
  - One provider node "blinks" to failover state, particle reroutes to alternate node
- **Motion:** 
  - Particle flow along SVG paths (continuous, staggered loop)
  - Provider node pulse on hover
  - Failover animation: node dims (provider error) → particle reroutes (curved arc to new provider) → new node brightens
  - All animations subtle (opacity 0.3-0.7, not flashy)
- **Implementation:** `components/infrastructure/gateway-visualization.tsx` — Canvas or SVG with Framer Motion `animate` for particle positions along paths. `request-flow.tsx` for the animated request particles.

#### Feature Grid

- **Purpose:** Communicate 6 core value propositions concisely
- **Layout:** 3x2 grid on desktop, 2x3 on tablet, 1x6 on mobile
- **Cards:** Each card contains:
  - Lucide icon (steel blue, 24px)
  - Title (text-lg, Inter semibold)
  - Description (text-sm, muted)
  - Subtle border effect on hover (border shifts from `transparent` to `rgba(74,127,181,0.3)`)
- **Features:**
  1. **Universal Compatibility** — Icon: `Globe`. "OpenAI-compatible API. Any model, any provider."
  2. **Intelligent Key Pool** — Icon: `Key`. "Automatic key rotation, credit tracking, failover."
  3. **Real-Time Streaming** — Icon: `Zap`. "SSE streaming with token-level cost tracking."
  4. **Provider Agnostic** — Icon: `Layers`. "Pluggable adapter architecture. 6+ providers, extensible."
  5. **Observability Built-In** — Icon: `Activity`. "Request logs, latency charts, margin analytics."
  6. **Enterprise Security** — Icon: `Shield`. "AES-256-GCM encryption, HMAC hashing, audit trails."
- **Motion:** Cards fade in on scroll (staggered, 100ms delay between each)

#### Code Example Section

- **Purpose:** Show developers exactly how to integrate in 30 seconds
- **Layout:** Two-column. Left: Explanation text. Right: Code block with tabs
- **Content:** 
  - Left: "Drop-in replacement for the OpenAI SDK" + key features highlighted
  - Right: `CodeTabs` component with "Python", "Node.js", "curl" tabs
- **Code examples:**
  - **Python:** OpenAI SDK with `base_url` pointing to FluxAI Gateway
  - **Node.js:** OpenAI SDK with `baseURL` pointing to FluxAI Gateway
  - **curl:** Direct API call
- **Motion:** Code block slides in from right on scroll. Text slides in from left.

#### Architecture Section

- **Purpose:** Visualize the backend architecture (from PRD Section 7) in a simplified, marketing-friendly way
- **Layout:** Horizontal flow diagram, left to right
- **Nodes:** Cloudflare → Fastify Gateway → Auth Middleware → Rate Limiter (Redis) → Key Pool Manager → Provider Mapper → Provider Adapter → AI Provider APIs
- **Below:** Background workers panel — Health Checker, Balance Reconciler, Key Cleaner, Analytics Aggregator (BullMQ icons)
- **Motion:** Sequential reveal of nodes on scroll (each node fades in with slight delay). Connecting lines draw with SVG `stroke-dasharray` animation
- **Implementation:** `components/marketing/architecture-section.tsx`

#### Integrations Section

- **Purpose:** Show ecosystem compatibility
- **Layout:** Logo grid — 6-8 provider logos plus tool logos (Cursor, VSCode, OpenWebUI, LangChain)
- **Cards:** Provider cards with name, logo, "OpenAI-compatible" badge
- **Motion:** Logos fade in on scroll, slight scale on hover (1.05)

#### Pricing Preview

- **Purpose:** Show pricing model on landing page, link to full `/pricing` page
- **Layout:** 3 prominent model cards showing example pricing: gpt-4o, llama-3-70b, claude-3.5-sonnet
- **Content:** Per model: model name, provider badge, input price, output price (per 1M tokens), "Pay-as-you-go — no subscriptions" note
- **CTA:** "View all models & pricing" → `/pricing`
- **Motion:** Cards fade in staggered on scroll

#### Security Section

- **Purpose:** Build trust with security-conscious developers
- **Layout:** Two-column. Left: security icons/badges grid. Right: key security features text
- **Content:** AES-256-GCM encryption, HMAC-SHA256 hashing, Azure Key Vault integration, TLS 1.3, no message content logging, immutable audit ledger
- **Motion:** Minimal — this section should feel solid and trustworthy, not flashy

#### CTA Section

- **Purpose:** Final conversion push
- **Layout:** Centered, dark, bordered container with subtle glow (not neon — muted steel blue, low opacity)
- **Content:** 
  - Headline: "Start building in 60 seconds."
  - Subheadline: "Free to sign up. Pay only for what you use. No monthly fees."
  - CTA: "Create Free Account" (primary button, large)
  - Below: "No credit card required" text
- **Motion:** Container fades in on scroll. Subtle pulse on CTA button (breathe animation, 3s cycle, scale 1.00-1.02)

#### Footer

- **Purpose:** Navigation, legal, and brand presence
- **Layout:** 4 columns — Product, Docs, Company, Legal
- **Content:**
  - **Product:** API Reference, Pricing, Models, Status, Changelog
  - **Docs:** Quickstart, API Reference, SDKs
  - **Company:** About, Blog (future), Contact
  - **Legal:** Privacy Policy, Terms of Service, Security
- **Bottom bar:** © FluxAI Gateway, Built on Azure
- **Motion:** None (static)

---

## 5. Infrastructure Visualization System

### 5.1 Core Concepts

This is the **signature visual identity** of FluxAI Gateway. The infrastructure visualization system differentiates this product from generic AI SaaS by communicating operational awareness through visual design.

### 5.2 Request Flow Visualization

**Component:** `RequestFlow`

- **Visual:** A horizontal flow diagram showing a request particle moving from left (client) to center (gateway) to right (provider) and back
- **Elements:** Animated particle (small filled circle, steel blue `#4a7fb5`, ~4px radius) traveling along an SVG `<path>` with `stroke-dashoffset` animation
- **Path:** Curved arcs between nodes (not straight lines — organic topology feel, like network diagrams)
- **Node representations:** 
  - Client: Minimal device icon (small rectangle)
  - FluxAI Gateway: Hexagonal shape (subtle nod to infrastructure)
  - Provider: Circle with provider initial (O=OpenRouter, T=Together, G=Groq, O=OpenAI, A=Anthropic, G=Gemini)
- **States:**
  - **Normal:** Particle flows smoothly, all lines visible in muted steel blue
  - **Failover:** One provider node dims → particle reroutes along a new interpolated path to alternate provider → new provider node brightens
  - **Rate-limited:** Particle pauses at Rate Limiter node, subtle "wait" pulse, then continues
  - **Streaming:** Multiple particles flowing in sequence with very slight stagger, representing token chunks
- **Animation Logic:**
  - `useAnimationFrame` for particle position along path (0 → 1 over 2s, loop)
  - `motion.path` for path reveal with `strokeDasharray` → `strokeDashoffset` animation
  - All opacity values between 0.2-0.6 — subtle, operational, not distracting

### 5.3 Topology Animation

**Component:** `TopologyCanvas`

- **Visual:** An abstract, low-opacity background element showing interconnected nodes in a network topology pattern
- **Nodes:** 15-25 small circles (2-3px) positioned in a pseudo-random but balanced distribution
- **Connections:** Thin lines (0.5px) connecting nearby nodes (Delaunay triangulation or nearest-neighbors)
- **Animation:**
  - Nodes pulse very subtly (opacity 0.2 ↔ 0.4) at random intervals (3-7s cycles)
  - Occasional "signal" particle traveling along a random connection
  - Entire canvas drifts very slowly (translate, sub-pixel, 30s cycle) — creates living, breathing feel
- **Implementation:** `<canvas>` with requestAnimationFrame loop. Not Framer Motion — raw canvas for performance with many elements.
- **Usage:** Background of hero section, architecture section, and status page

### 5.4 Provider Switching Visualization

**Component:** `FailoverAnimation`

- **Visual:** Two provider nodes with a connection path between them
- **States:**
  1. Healthy: Both nodes illuminated (steel blue), path visible
  2. Primary failure: Left node dims (opacity drops from 0.6 to 0.1 in 300ms), path color shifts to muted
  3. Reroute: A bridging arc appears from the failing node to the right node (new path draws over 500ms)
  4. Recovery: Right node pulse-brightens (brief opacity spike to 0.8, settles to 0.6)
- **Motion:**
  - `AnimatePresence` for state transitions
  - `motion.circle` for node opacity transitions
  - `motion.path` with `pathLength` for bridging arc drawing animation

### 5.5 Observability Indicators

**Component:** `LatencyIndicator`  
**Component:** `HealthBadge`

- **LatencyIndicator:** Horizontal bar with segments. Each segment represents a latency percentile (p50/p90/p99). Color scale: steel blue (fast <100ms) → muted amber (moderate 100-500ms) → muted red (slow >500ms). Shows current latency with a small triangle marker.
- **HealthBadge:** Small pill-shaped indicator. States: `healthy` (subtle green-gray circle + "Operational") / `degraded` (amber-gray + "Degraded") / `down` (red-gray + "Unavailable"). Uses muted tones, not traffic-light bright colors.
- **Animation:** Latency marker smoothly moves position (spring). Health badge pulse on status change.

### 5.6 Streaming Token Effects

**Component:** `TokenStream`  
**Component:** `StreamingTerminal`

- **TokenStream:** Text area showing words appearing one at a time (typewriter-like but smoother). Words fade in from opacity 0 to 1 over 150ms each. Background is a dark terminal-like surface with subtle scanline effect.
- **StreamingTerminal:** Full terminal simulation. Shows request being sent, then response tokens arriving. Green/blue cursor blinking at end of stream. Terminal chrome (three dots top-left, title bar "streaming..."). Used in the API Playground and demo sections.
- **Animation:** Sequential `motion.span` elements with staggered children. Cursor: CSS animation `blink` 1s step-end infinite.

---

## 6. Component Architecture

### 6.1 Component Category Philosophy

| Category | Location | Rendering | Responsibility |
|---|---|---|---|
| `marketing/` | `components/marketing/` | Mixed (Server + Client) | Landing page sections, pricing display |
| `infrastructure/` | `components/infrastructure/` | Client only | Animated visualizations, topology, streaming effects |
| `docs/` | `components/docs/` | Mixed | Documentation rendering, sidebar, search, TOC |
| `code/` | `components/code/` | Client only | Syntax highlighting, code tabs, playground, copy buttons |
| `dashboard/` | `components/dashboard/` | Client only | Dashboard widgets, charts, data tables |
| `auth/` | `components/auth/` | Client only | Login/register forms, OAuth buttons |
| `admin/` | `components/admin/` | Client only | Admin data tables, forms, controls |
| `ui/` | `components/ui/` | Client only | shadcn/ui primitives |
| `shared/` | `components/shared/` | Mixed | Logo, gradient text, section containers, error boundaries |

### 6.2 Major Components

#### HeroSection

- **Path:** `components/marketing/hero-section.tsx`
- **Type:** Hybrid — static content server-rendered, topology animation client-island
- **Props:** None (hardcoded content)
- **Sub-components:** `TopologyCanvas` (client island), `CurlPreview` (client island for copy button)
- **State:** None

#### GatewayVisualization

- **Path:** `components/infrastructure/gateway-visualization.tsx`
- **Type:** Client Component
- **Props:** `{ providers: ProviderInfo[]; healthData?: HealthSnapshot }`
- **Sub-components:** `RequestFlow`, `ProviderCard`, `LatencyIndicator`
- **State:** Animation frame loop for particle positions, health data polling via `useHealth` hook

#### RequestFlow

- **Path:** `components/infrastructure/request-flow.tsx`
- **Type:** Client Component
- **Props:** `{ source: NodePosition; target: NodePosition; status: 'idle' | 'flowing' | 'failover' | 'streaming'; onComplete?: () => void }`
- **State:** Particle position (0→1 progress), interval timer for streaming mode

#### ProviderCard

- **Path:** `components/infrastructure/provider-card.tsx`
- **Type:** Client Component
- **Props:** `{ provider: string; modelCount: number; status: 'healthy' | 'degraded' | 'down'; latency: number }`
- **State:** None (stateless presentation)

#### TokenStream

- **Path:** `components/infrastructure/token-stream.tsx`
- **Type:** Client Component
- **Props:** `{ text: string; speed?: number; onComplete?: () => void; cursor?: boolean }`
- **State:** Current character index (driven by `setInterval`)

#### CodeTabs

- **Path:** `components/code/code-tabs.tsx`
- **Type:** Client Component
- **Props:** `{ tabs: Array<{ label: string; language: string; code: string }>; defaultTab?: string }`
- **State:** Active tab index
- **Sub-components:** `SyntaxBlock`, `CopyButton`

#### SyntaxBlock

- **Path:** `components/code/syntax-block.tsx`
- **Type:** Client Component (due to Shiki highlighting at runtime)
- **Props:** `{ code: string; language: string; showLineNumbers?: boolean; highlightLines?: number[] }`
- **State:** Highlighted HTML (Shiki `codeToHtml` result)
- **Implementation:** Uses Shiki at build time via `rehype-pretty-code` for MDX, and Shiki at runtime via `codeToHtml` for dynamic code blocks (API playground responses)

#### PricingCalculator

- **Path:** `components/marketing/pricing-calculator.tsx`
- **Type:** Client Component
- **Props:** `{ models: PricingModel[] }`
- **State:** Selected model, input token slider value, output token slider value
- **Sub-components:** Sliders (shadcn/ui), animated result counter

#### DocsSidebar

- **Path:** `components/docs/docs-sidebar.tsx`
- **Type:** Client Component (collapsible sections, active link highlighting)
- **Props:** `{ nav: DocNavItem[]; currentPath: string }`
- **State:** Expanded sections (Set of section IDs)
- **Behavior:** Sticky positioning, scroll-sync active link, collapsible sub-sections with chevron rotation animation

#### APIPlayground

- **Path:** `components/code/api-playground.tsx`
- **Type:** Client Component
- **Props:** `{ endpoint: string; method: 'POST' | 'GET'; schema: z.ZodType }`
- **State:** Request body (editable JSON textarea), response (streaming or completed), loading status, error state
- **Behavior:** 
  - Editable JSON body with syntax highlighting
  - "Send Request" button triggers API call via `api-client.ts`
  - Response area shows streaming output (TokenStream) or full JSON response (SyntaxBlock)
  - Headers input (optional — API key field)
  - Preserves history of recent requests in localStorage

#### StatusGrid

- **Path:** `components/infrastructure/provider-grid.tsx`
- **Type:** Client Component
- **Props:** `{ providers: ProviderHealth[] }`
- **State:** Polling via `useHealth` hook (refetch every 30s)
- **Behavior:** Grid of provider cards showing current status, latency, uptime %

#### UsageChart

- **Path:** `components/dashboard/usage-chart.tsx`
- **Type:** Client Component
- **Props:** `{ data: UsageData[]; period: '7d' | '30d' | '90d' }`
- **State:** None (controlled via parent)
- **Implementation:** Recharts `AreaChart` with steel blue fill, dark background, minimal grid lines

### 6.3 Props Strategy

- **Server Components:** Receive data directly from `fetch` calls in the component body. No client-side state.
- **Client Components:** Receive serializable props from parent server components. Internal UI state (tabs, expanded sections, form values) managed locally with `useState` or Zustand.
- **Data components:** Use TanStack Query hooks internally. Accept `userId` or query parameters as props.
- **No prop drilling:** If a prop passes through more than 2 levels, lift to a context or pass directly to the leaf component.

### 6.4 Composition Architecture

```
Page (Server Component)
├── Suspense fallback={<Skeleton />}
└── DataWrapper (Client Component)
    ├── useQuery hook fetches data
    ├── Renders loading/error/success states
    └── <DataView data={data} /> (Client Component)
        └── Maps over data to render list/cards/chart
```

---

## 7. Design System

### 7.1 Typography

**Font stack:**
```css
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
```

**Scale (Inter):**
| Name | Size | Line Height | Usage |
|---|---|---|---|
| `text-xs` | 0.75rem (12px) | 1rem | Badges, labels, metadata, chart axes |
| `text-sm` | 0.875rem (14px) | 1.25rem | Body text, descriptions, table cells, sidebar items |
| `text-base` | 1rem (16px) | 1.5rem | Primary body text, form inputs |
| `text-lg` | 1.125rem (18px) | 1.75rem | Subheadlines, card titles |
| `text-xl` | 1.25rem (20px) | 1.75rem | Section headings |
| `text-2xl` | 1.5rem (24px) | 2rem | Page titles |
| `text-3xl` | 1.875rem (30px) | 2.25rem | Hero subheading (mobile), section heroes |
| `text-4xl` | 2.25rem (36px) | 2.5rem | Hero subheading (desktop) |
| `text-5xl` | 3rem (48px) | 1.1 | Hero headline (tablet) |
| `text-6xl` | 3.75rem (60px) | 1.1 | Hero headline (desktop) |
| `text-7xl` | 4.5rem (72px) | 1.1 | Hero headline (marketing emphasis) |

**Scale (JetBrains Mono):**
| Usage | Size | Weight |
|---|---|---|
| Code blocks | `text-sm` (14px) | 400 |
| Inline code | `text-xs` (12px) | 500 |
| API keys display | `text-sm` | 500 |
| Terminal output | `text-sm` | 400 |
| curl preview | `text-xs` | 400 |

**Weights:** 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

### 7.2 Color System

**Backgrounds:**
```css
--bg-root:        #050506;  /* Deepest — root layout, modal backdrops */
--bg-primary:     #0a0a0b;  /* Main — page backgrounds, cards */
--bg-secondary:   #111114;  /* Elevated — card surfaces, sidebar */
--bg-tertiary:    #16181a;  /* Highest — hover states, inputs, code blocks */
--bg-hover:       #1c1f22;  /* Interactive hover */
--bg-accent:      rgba(74, 127, 181, 0.08);  /* Steel blue tint overlay */
```

**Text:**
```css
--text-primary:   #f5f5f5;  /* Headlines, primary body */
--text-secondary: #a1a5aa;  /* Secondary body, descriptions */
--text-tertiary:  #63676c;  /* Metadata, placeholders, disabled */
--text-inverse:   #0a0a0b;  /* Text on accent/button backgrounds */
```

**Brand / Accent:**
```css
--accent-primary:    #4a7fb5;  /* Steel blue — primary CTAs, active states */
--accent-hover:      #5b8fc5;  /* Hover state */
--accent-muted:      #3a5f85;  /* Muted accent — borders, subtle accents */
--accent-subtle:     rgba(74, 127, 181, 0.15);  /* Very subtle — backgrounds */
```

**Status Colors (Muted — infrastructure aesthetic, NOT neon):**
```css
--status-healthy:       #5a8a6a;  /* Muted green-gray */
--status-degraded:      #8a7a4a;  /* Muted amber */
--status-down:          #8a4a4a;  /* Muted red */
--status-neutral:       #6a6e73;  /* Gray — idle, unknown */
--status-healthy-bg:    rgba(90, 138, 106, 0.12);
--status-degraded-bg:   rgba(138, 122, 74, 0.12);
--status-down-bg:       rgba(138, 74, 74, 0.12);
```

**Borders:**
```css
--border-primary:   rgba(255, 255, 255, 0.08);  /* Subtle separators */
--border-secondary: rgba(255, 255, 255, 0.05);  /* Very subtle */
--border-accent:    rgba(74, 127, 181, 0.25);   /* Accent borders */
--border-input:     rgba(255, 255, 255, 0.1);   /* Form inputs */
```

**Charts (Observability palette):**
```css
--chart-1:  #4a7fb5;  /* Steel blue primary */
--chart-2:  #5a8a6a;  /* Green-gray */
--chart-3:  #6a6ea5;  /* Blue-purple-gray */
--chart-4:  #8a7a4a;  /* Amber */
--chart-5:  #7a5a8a;  /* Muted purple */
--chart-6:  #4a8a8a;  /* Teal-gray */
```

### 7.3 Spacing System

Based on Tailwind's default scale with augmented values:
```
--spacing:
  section-y:    py-24 md:py-32          # Major section vertical padding
  section-x:    px-6 md:px-8 lg:px-16   # Horizontal section padding
  card-padding: p-6                      # Card internal padding
  content-gap:  gap-6 md:gap-8 lg:gap-12 # Vertical gap between content blocks
  grid-gap:     gap-4 md:gap-6           # Grid gap
  page-margin:  max-w-7xl mx-auto        # Page content max width
  narrow:       max-w-4xl mx-auto        # Narrow content (auth pages, docs)
```

### 7.4 Border System

```css
--radius-sm:   0.25rem (4px);   /* Small elements — badges, inline code */
--radius-md:   0.5rem (8px);    /* Cards, inputs, buttons */
--radius-lg:   0.75rem (12px);  /* Large cards, modals */
--radius-xl:   1rem (16px);     /* Hero containers */
--radius-full: 9999px;          /* Pills, badges, status indicators */
```

Border widths: `0px` (default invisible), `1px` (visible borders on hover/focus), `2px` (focus rings)

### 7.5 Shadows

```css
--shadow-sm:   0 1px 2px rgba(0, 0, 0, 0.3);
--shadow-md:   0 4px 12px rgba(0, 0, 0, 0.4);
--shadow-lg:   0 8px 24px rgba(0, 0, 0, 0.5);
--shadow-glow: 0 0 20px rgba(74, 127, 181, 0.15);  /* Very subtle accent glow */
```

Shadows are dark and subdued — not prominent. The design relies on surface hierarchy (background color variations) more than shadow depth.

### 7.6 Surface Hierarchy

1. `bg-root` — Page background, deepest layer
2. `bg-primary` — Main surface (default card, section backgrounds)
3. `bg-secondary` — Elevated surface (sidebar, header, dropdown menus, modals)
4. `bg-tertiary` — Interactive surface (inputs, code blocks, hovered cards, selected rows)
5. `border-primary` — Visual separator between surfaces

### 7.7 Hover States

- **Buttons:** Background lightens by ~10%, subtle scale 1.02 (100ms ease)
- **Cards:** Border changes from `border-primary` to `border-accent` (200ms ease), optional slight translateY -2px
- **Links:** Color transition `text-secondary` → `text-primary` (150ms ease)
- **Table rows:** Background shifts to `bg-tertiary` on hover (100ms)
- **Nav items:** Color shifts to `text-primary`, subtle left border appears (3px `accent-primary`)
- **Inputs:** Border changes from `border-input` to `border-accent` on focus

### 7.8 Interaction Patterns

- **Clickable cards:** Entire card is clickable, hover effects apply to fill card
- **Confirmation modals:** Required for destructive actions (revoke API key, emergency drain, force rotate). Two-step confirmation for nuclear operations.
- **Copy to clipboard:** "Click to copy" tooltip → "Copied!" feedback (2s), icon swaps from Clipboard → Check
- **Loading:** Skeleton screens match content shape. No spinners except for small inline operations.
- **Empty states:** Centered icon + message + action CTA. Example: "No API keys yet" with "Create your first key" button.
- **Error states:** Inline error cards with retry button. Full-page error boundaries with "Go to Dashboard" fallback.

---

## 8. Animation System

### 8.1 Framer Motion Strategy

**Animation hierarchy:**
1. **Scroll reveals** (marketing sections) — `whileInView` with `viewport: { once: true, margin: "-100px" }`
2. **Hover interactions** (buttons, cards, links) — `whileHover` on the specific element
3. **Topology motion** (infrastructure visualizations) — `useAnimationFrame` + `motion` values for canvas-like animations
4. **State transitions** (loading → content, route changes) — `AnimatePresence` for enter/exit animations
5. **Streaming effects** — Sequential `motion.span` children with `staggerChildren`

### 8.2 Motion Philosophy

- **Subtlety over spectacle:** Animations should enhance understanding, not distract. Opacity and position tweens preferred over scale bounces.
- **Operational feel:** Animations should evoke "systems working" — smooth, predictable, mechanical-but-organic (like watching server metrics update).
- **Duration rule:** Most animations 200-400ms. Complex orchestrated animations (topology) up to 2s. No animation exceeding 3s without user interaction.
- **Performance:** Use `transform` and `opacity` only for animated properties. Never animate `width`, `height`, `top`, `left`, `box-shadow`. Use `will-change` sparingly on heavily animated elements.
- **Reduced motion:** All animations wrapped in `useReducedMotion()` check. When enabled, replace all animations with instant opacity transitions (no movement).

### 8.3 Scroll Reveals

```ts
// lib/motion-presets.ts
export const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] } },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } },
};

export const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.97 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } },
};
```

**Usage pattern:**
```tsx
<motion.section variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }}>
  <motion.h2 variants={fadeInUp}>Section Title</motion.h2>
  <motion.div variants={fadeInUp}>Description text</motion.div>
</motion.section>
```

### 8.4 Hover Interactions

- **Buttons:** `whileHover={{ scale: 1.02 }}` with `transition: { duration: 0.15, ease: "easeOut" }`
- **Cards:** `whileHover={{ y: -2, borderColor: "rgba(74, 127, 181, 0.25)" }}` with `transition: { duration: 0.2 }`
- **Nav items:** Subtle background color shift, no scale
- **Icons:** No hover animation on standalone icons. Only when parent is interactive.

### 8.5 Topology Motion

```ts
// Particle movement along path using motion.div with style transform
// Core loop:
useAnimationFrame((time) => {
  const t = (time * 0.0001) % 1; // Continuous 0→1 loop over ~10s
  const point = path.getPointAtLength(t * pathLength);
  particleX.set(point.x);
  particleY.set(point.y);
});
```

### 8.6 Request Pulse Animation

- A subtle ripple effect emanating from the FluxAI Gateway center node
- CSS `@keyframes` ring expanding from 0→1 scale with opacity fading from 0.15→0
- Duration: 3s, infinite loop
- Represents "requests flowing through the gateway"

### 8.7 Provider Failover Animation

```
Timeline:
0ms:    Primary provider card dims (opacity 0.6→0.15, 300ms easeInOut)
300ms:  Connection line fades (opacity 0.3→0, 200ms)
500ms:  Failover particle begins arc to backup provider (600ms along curved path)
1100ms: Backup provider brightens (opacity 0.6→0.8→0.6, 400ms spring)
1500ms: Steady state — traffic flows through backup
```

### 8.8 Terminal Streaming Simulation

- Terminal frame with chrome (macOS-style dots) and title bar
- Prompt line: `$ curl -X POST ...` (already displayed, dimmed)
- Response lines appear one at a time:
  - `data: {"id":"chatcmpl-...","choices":[{"delta":{"content":"Hello"}}]}`
  - `data: {"id":"chatcmpl-...","choices":[{"delta":{"content":" world"}}]}`
  - `data: [DONE]`
- Each line: opacity 0→1, 200ms, stagger 150ms between lines
- Cursor blinks after last line

### 8.9 Observability Motion

- **Chart transitions:** When period changes (7d→30d→90d), bars/areas animate to new values with `layout` animation on Recharts
- **Counter animations:** Balance and usage numbers count up/down with `useSpring` from Framer Motion
- **Status changes:** `AnimatePresence` on status badge content swap. Old status fades out, new fades in (200ms).

---

## 9. Responsive Strategy

### 9.1 Desktop-First Approach

Base design at 1440px viewport. Breakpoints:

| Breakpoint | Width | Target |
|---|---|---|
| `sm` | 640px | Mobile landscape |
| `md` | 768px | Tablet portrait |
| `lg` | 1024px | Tablet landscape / small desktop |
| `xl` | 1280px | Desktop |
| `2xl` | 1536px | Large desktop |

### 9.2 Mobile Adaptations

**Navigation:**
- Desktop: Full horizontal navbar with all links
- Mobile (<768px): Hamburger menu → full-screen overlay drawer. Nav links stacked vertically with increased touch targets (min 44px height). Bottom sheet style.

**Landing page:**
- Hero: Headline scales down proportionally. Curl preview becomes single-line with horizontal scroll. CTA buttons stack vertically, full width.
- Feature grid: 1 column. Cards stack with reduced padding.
- Architecture diagram: Simplifies to vertical flow with scrolling. Nodes stack top-to-bottom instead of left-to-right.
- Code section: Single column. Code block below text. Tabs become horizontal scroll.
- Pricing: Cards stack vertically.

**Docs:**
- Sidebar collapses into hamburger-triggered drawer. Overlay on content.
- Table of Contents moves to an inline collapsible element at top of content.

**Dashboard:**
- Sidebar collapses to icon-only drawer. Opens on hamburger tap.
- Charts become single-column, full-width.
- Data tables: Horizontal scroll on wide columns OR responsive card view (each row becomes a card).
- Stats cards: 2 columns, then 1 column.

**Admin:**
- Same pattern as dashboard.
- Emergency controls require explicit confirmation on mobile (two-step tap).

### 9.3 Responsive Infrastructure Diagrams

- Desktop: Full topology with all nodes and connections
- Tablet: Simplified — show main gateway + 3-4 provider nodes
- Mobile: Single request path flow. Show client → gateway → one provider. Horizontal scroll to see other providers.

### 9.4 Responsive Code Blocks

- All code blocks: `overflow-x-auto` with horizontal scroll. No line wrapping.
- `white-space: pre` preserved.
- Copy button always visible, not hidden on mobile.
- Code tab labels shorten on mobile (e.g., "Python" → "Py", "Node.js" → "JS").

### 9.5 Mobile Navigation

**Pattern:** Bottom sheet drawer triggered by hamburger icon (top-right on mobile).

```tsx
// Layout:
// Top bar: Logo (left), Hamburger (right)
// Drawer: AnimatePresence → motion.div slides from right
//         Backdrop: semi-transparent overlay, tap to close
//         Content: nav links, auth buttons, theme toggle
//         Motion: slideInRight, 300ms spring
```

### 9.6 Tablet Behavior

- Tablets (768-1024px) receive desktop-lite layouts
- Sidebar is collapsed to icons by default, expands on hover/tap
- Grid: 2 columns instead of 3
- Section padding reduced from `py-32` to `py-24`
- Code blocks retain side-by-side layout with tighter spacing

---

## 10. Docs System

### 10.1 Overview

Inspiration: Stripe Docs (clean layout, excellent search, code-first), Vercel Docs (minimal, fast), Supabase Docs (practical, snippet-heavy).

### 10.2 Architecture

**Content format:** MDX files in `content/docs/` directory
**Rendering:** `next-mdx-remote` for dynamic MDX routing or `@next/mdx` for static compilation
**Code highlighting:** Shiki via `rehype-pretty-code` at build time for static MDX. Shiki `codeToHtml` at runtime for dynamic playground output.

### 10.3 Layout

```
┌─────────────────────────────────────────────────────────┐
│  Navbar (simplified — logo + search + dashboard link)   │
├────────────┬───────────────────────────┬────────────────┤
│            │                         │                │
│  Sidebar   │    Content              │   Table of     │
│  (240px)   │    (flex-1, max-w-3xl)  │   Contents     │
│            │                         │   (200px)      │
│  Sticky    │    MDX rendered         │   Sticky       │
│  Scroll    │    Heading + prose      │   Active link  │
│  Active    │    Code blocks          │   highlight    │
│  link      │    API endpoint cards   │                │
│            │                         │                │
├────────────┴───────────────────────────┴────────────────┤
│  Footer (minimal — "Edit this page on GitHub" link)     │
└─────────────────────────────────────────────────────────┘
```

**Sidebar sections:**
```
Getting Started
├── Overview
├── Quickstart
└── Authentication

API Reference
├── Chat Completions
├── Streaming
├── Models
├── Error Codes
└── Rate Limits

SDKs
├── Python
├── Node.js
└── cURL

Guides
├── Key Management
├── Error Handling
└── Best Practices
```

### 10.4 Sidebar Navigation

**Component:** `DocsSidebar`

- **Behavior:** Sticky, scrollable independently from content. Height = `calc(100vh - navbar-height)`.
- **Active section:** Highlighted with steel blue left border + text color accent. Scrolled into view on route change.
- **Collapsible sections:** Sections like "Guides" can collapse/expand. State persisted in `localStorage`. Chevron icon rotates 90° with Framer Motion.
- **Nested depth:** 3 levels max. Indentation via `ml-3`, `ml-6`.
- **Mobile:** Hidden behind hamburger. Opens as overlay drawer.
- **Search:** Search bar embedded in sidebar top (or in navbar for docs).

### 10.5 Search

**Component:** `DocsSearch`

- **Implementation:** Client-side search using Fuse.js for fuzzy matching against a pre-built search index
- **Index generation:** Build-time script scans `content/docs/` for headings, extracts frontmatter + headings → JSON index
- **UI:** Command palette pattern (`cmdk` or custom dialog). Trigger: `/` key or click search bar. Results show: heading → parent section breadcrumb → preview snippet. Keyboard navigation (up/down/enter).
- **Loading:** Index loaded client-side (small JSON, ~50KB for all docs). Instant after first load.

### 10.6 Syntax Highlighting

**Library:** Shiki

**Theme:** Custom dark theme matching the design system:
- Background: `#0d0d10` (matches code block surfaces)
- Foreground: `#e1e4e8`
- Comments: `#63676c`
- Keywords: `#6b9fd4` (steel blue)
- Strings: `#5a8a6a`
- Functions: `#8a7a5a`
- Numbers: `#7a5a8a`
- Types: `#4a8a8a`

**Features:**
- Line numbers (muted, left-aligned)
- Line highlighting (steel blue background tint for focused lines)
- Diff mode (`+` / `-` lines) for changelog code examples
- Word wrap disabled — horizontal scroll
- Title bar showing filename + language badge

### 10.7 Copy Buttons

**Component:** `CopyButton`

- **Position:** Top-right of code block, always visible on hover (desktop), always visible (mobile)
- **Behavior:** Click → copy code to clipboard → icon swaps from `Clipboard` to `Check` → "Copied!" tooltip → reverts after 2s
- **Implementation:** `navigator.clipboard.writeText(code)` + `useState` for copied state

### 10.8 API Examples

**Component:** `ApiEndpointCard`

```tsx
<ApiEndpointCard
  method="POST"
  path="/v1/chat/completions"
  description="Create a chat completion"
  requestSchema={OpenAIChatRequestSchema}
  responseSchema={OpenAIChatResponseSchema}
  examples={{
    curl: `curl ...`,
    python: `...`,
    node: `...`,
  }}
/>
```

**Renders:**
- Method badge (POST, GET) with color coding
- Endpoint path in monospace
- Description paragraph
- "Request Body" section with schema table rendered from Zod schema
- "Response" section with schema table
- Code tabs with examples in multiple languages
- "Try it" button linking to API Playground

### 10.9 Schema Table

**Component:** `SchemaTable`

- **Input:** Zod schema object
- **Renders:** HTML table with columns: `Field` | `Type` | `Required` | `Description`
- **Zod → Table mapping:**
  - `z.string()` → "string"
  - `z.number()` → "number"
  - `z.boolean()` → "boolean"
  - `z.array(...)` → "array<...>"
  - `z.object(...)` → nested table (collapsed by default)
  - `z.enum([...])` → ' "a" | "b" ' with tooltip showing all values
  - `.optional()` → Required: "No"
  - `.default(...)` → Required: "No" + shows default value
- **Implementation:** Recursive component traversing the Zod schema's `_def` property (zod-to-json-schema conversion for safer approach)

### 10.10 Table of Contents

**Component:** `DocsTOC`

- **Behavior:** Sticky, right side, desktop only. Extracts headings from MDX content.
- **Active heading:** Highlighted as user scrolls (IntersectionObserver on content headings).
- **Depth:** h2 and h3 only. Indentation for h3.
- **Click:** Smooth scroll to heading anchor.
- **Hidden on:** Mobile (<1024px), pages without sufficient heading content.

---

## 11. API Integration Architecture

### 11.1 Frontend API Layer

The frontend communicates with the Fastify backend through two mechanisms:

1. **Dashboard/Admin API calls** — Typed REST client calling `/api/user/*` and `/admin/*` endpoints
2. **Inference API** — The `/v1/chat/completions` endpoint is used by the API Playground (docs) and user SDKs, NOT directly from dashboard

### 11.2 Typed API Client

**File:** `lib/api-client.ts`

```ts
// Base configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface ApiClientOptions {
  sessionToken?: string;
  adminKey?: string;
}

// Utility: create authenticated fetch
async function apiFetch<T>(
  path: string,
  options: RequestInit & ApiClientOptions = {}
): Promise<T> {
  const { sessionToken, adminKey, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(fetchOptions.headers as Record<string, string>),
  };

  // Session-based auth for dashboard API
  if (sessionToken) {
    headers["Authorization"] = `Bearer ${sessionToken}`;
  }

  // Admin key auth for admin API (optional, session-based admin preferred)
  if (adminKey) {
    headers["X-Admin-Key"] = adminKey;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...fetchOptions,
    headers,
    credentials: "include", // For same-domain cookie auth
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: "Network error" } }));
    throw new ApiError(response.status, error.error);
  }

  return response.json();
}

// Typed API methods
export const api = {
  // User dashboard
  user: {
    me: () => apiFetch<UserProfile>("/api/user/me"),
    usage: (params: UsageQueryParams) => apiFetch<UsageResponse>("/api/user/usage?" + new URLSearchParams(params as any)),
    usageDetail: (id: string) => apiFetch<RequestDetail>(`/api/user/usage/${id}`),
    ledger: (params: { limit?: number; offset?: number }) =>
      apiFetch<LedgerResponse>("/api/user/ledger?" + new URLSearchParams(params as any)),
    apiKeys: () => apiFetch<ApiKey[]>("/api/user/api-keys"),
    createApiKey: (name?: string) => apiFetch<{ key: string; id: string }>("/api/user/api-keys", { method: "POST", body: JSON.stringify({ name }) }),
    revokeApiKey: (id: string) => apiFetch<void>(`/api/user/api-keys/${id}`, { method: "DELETE" }),
    topUp: (amount: number) => apiFetch<{ checkoutUrl: string }>("/api/user/top-up", { method: "POST", body: JSON.stringify({ amount }) }),
    invoices: () => apiFetch<Invoice[]>("/api/user/invoices"),
  },

  // Admin
  admin: {
    providerKeys: {
      list: () => apiFetch<ProviderKey[]>("/admin/provider-keys"),
      create: (data: CreateProviderKeyInput) => apiFetch<ProviderKey>("/admin/provider-keys", { method: "POST", body: JSON.stringify(data) }),
      rotate: (id: string) => apiFetch<void>(`/admin/provider-keys/${id}/rotate`, { method: "PATCH" }),
      updateStatus: (id: string, status: string) =>
        apiFetch<void>(`/admin/provider-keys/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
      delete: (id: string) => apiFetch<void>(`/admin/provider-keys/${id}`, { method: "DELETE" }),
    },
    modelMappings: {
      list: () => apiFetch<ModelMapping[]>("/admin/model-mappings"),
      create: (data: CreateModelMappingInput) =>
        apiFetch<ModelMapping>("/admin/model-mappings", { method: "POST", body: JSON.stringify(data) }),
      update: (id: string, data: UpdateModelMappingInput) =>
        apiFetch<ModelMapping>(`/admin/model-mappings/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
      delete: (id: string) => apiFetch<void>(`/admin/model-mappings/${id}`, { method: "DELETE" }),
    },
    users: {
      list: (params?: { search?: string; limit?: number; offset?: number }) =>
        apiFetch<PaginatedUsers>("/admin/users?" + new URLSearchParams(params as any)),
      detail: (id: string) => apiFetch<UserDetail>(`/admin/users/${id}`),
      usage: (id: string) => apiFetch<UserUsage>(`/admin/users/${id}/usage`),
      suspend: (id: string) => apiFetch<void>(`/admin/users/${id}/suspend`, { method: "PATCH" }),
      unsuspend: (id: string) => apiFetch<void>(`/admin/users/${id}/unsuspend`, { method: "PATCH" }),
    },
    margins: (period: "daily" | "weekly" | "monthly") =>
      apiFetch<MarginReport>(`/admin/margins?period=${period}`),
    ledgers: (params: { userId?: string; limit?: number }) =>
      apiFetch<AdminLedgerResponse>("/admin/ledgers?" + new URLSearchParams(params as any)),
    health: {
      providers: () => apiFetch<ProviderHealth[]>("/admin/health/providers"),
      keys: () => apiFetch<KeyPoolHealth>("/admin/health/keys"),
      queues: () => apiFetch<QueueHealth>("/admin/health/queues"),
    },
    emergency: {
      drainProvider: (provider: string) =>
        apiFetch<void>("/admin/emergency/drain-provider", { method: "POST", body: JSON.stringify({ provider }) }),
      rotateAllKeys: (provider: string) =>
        apiFetch<void>("/admin/emergency/rotate-all-keys", { method: "POST", body: JSON.stringify({ provider }) }),
    },
  },
};
```

### 11.3 TanStack Query Usage

```tsx
// hooks/use-usage.ts
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export function useUsage(period: "7d" | "30d" | "90d") {
  return useQuery({
    queryKey: ["usage", period],
    queryFn: () => api.user.usage({ period }),
    staleTime: 30_000,      // 30 seconds — usage data is near real-time
    refetchInterval: 30_000, // Poll every 30s
  });
}
```

**Cache strategy by data type:**

| Data Type | staleTime | refetchInterval | Invalidation Triggers |
|---|---|---|---|
| User profile (`/me`) | 60s | 30s | After top-up |
| Usage stats | 30s | 30s | None (automatic polling) |
| API keys list | 5 min | None | After create/revoke mutation |
| Ledger entries | 2 min | None | After top-up |
| Billing invoices | 5 min | None | None |
| Model mappings (admin) | 60s | None | After create/update/delete |
| Provider keys (admin) | 30s | 30s | After create/rotate |
| Health data | 15s | 15s | None |

### 11.4 SSE Integration

**File:** `hooks/use-sse.ts`

```ts
export function useSSE(userId: string) {
  const queryClient = useQueryClient();
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const es = new EventSource(`${API_BASE_URL}/api/user/events`, {
      withCredentials: true,
    });

    es.addEventListener("balance_update", (e) => {
      const data = JSON.parse(e.data);
      queryClient.setQueryData(["user", "me"], (old: any) => ({
        ...old,
        balance: data.balance,
      }));
    });

    es.addEventListener("key_rotation", () => {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
    });

    es.addEventListener("outage_alert", (e) => {
      const data = JSON.parse(e.data);
      toast.error(`Provider outage: ${data.provider} — failover active`);
    });

    es.addEventListener("heartbeat", () => {
      // Keep alive, no action needed
    });

    es.onerror = () => {
      // Reconnect handled by EventSource automatically
      // After 3 consecutive failures, switch to polling fallback
    };

    eventSourceRef.current = es;

    return () => {
      es.close();
    };
  }, [userId, queryClient]);

  // Return connection status
}
```

### 11.5 Auth Token Handling

- **Dashboard API calls:** Session token passed via `Authorization: Bearer <sessionToken>` header
- **Token source:** `useSession()` from NextAuth → `session.sessionToken`
- **Cross-domain (Vercel → Azure):** Cookie not sent automatically. Explicit `Authorization` header is used.
- **Same-domain (local dev):** Both cookie and header work.
- **Token refresh:** Not applicable — database session strategy. Session validated on every request.
- **Admin API calls:** Either session with `role: 'admin'` OR `X-Admin-Key` header for static admin key auth.

### 11.6 Error Handling

```ts
// lib/api-client.ts
export class ApiError extends Error {
  constructor(
    public status: number,
    public error: {
      message: string;
      type: string;
      code?: string | null;
      param?: string | null;
    }
  ) {
    super(error.message);
    this.name = "ApiError";
  }
}

// Component-level error handling:
function DashboardPage() {
  const { data, error, isLoading, refetch } = useUsage("7d");

  if (isLoading) return <UsageSkeleton />;
  if (error) {
    return (
      <ErrorCard
        title="Failed to load usage data"
        description={error.message}
        onRetry={() => refetch()}
      />
    );
  }

  return <UsageChart data={data} />;
}
```

### 11.7 Loading States

**Pattern:** Three-state rendering in every data component.

```tsx
// Consistent loading pattern:
const { data, isLoading, isError, error, refetch } = useQuery(...);

if (isLoading) return <Skeleton />;
if (isError) return <ErrorState error={error} onRetry={refetch} />;
if (!data || data.length === 0) return <EmptyState />;
return <DataView data={data} />;
```

**Skeleton components** match the shape of their content equivalents:
- `StatsCardSkeleton`: Card shape with shimmering placeholder
- `ChartSkeleton`: Rectangular area with shimmer
- `TableSkeleton`: Rows of shimmering bars
- `CodeSkeleton`: Monospaced shimmer block

### 11.8 Streaming Response Handling

Used in the API Playground component:

```tsx
async function sendStreamingRequest(body: OpenAIChatRequest) {
  const response = await fetch(`${API_BASE_URL}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ ...body, stream: true }),
  });

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const data = line.slice(6);
        if (data === "[DONE]") return;
        const chunk = JSON.parse(data);
        const content = chunk.choices?.[0]?.delta?.content;
        if (content) {
          setTokens((prev) => [...prev, content]);
        }
      }
    }
  }
}
```

### 11.9 Provider Failover UI Updates

When the SSE `outage_alert` event fires:
1. Toast notification appears: "Provider failover: <provider> → <backup>"
2. Health status grid updates (incremental cache update)
3. Active streams show a subtle "reconnecting..." indicator
4. Affected provider card on `/status` shows "failover in progress" badge

### 11.10 Interruption Handling

- If client disconnects during streaming in API Playground: abort upstream via `AbortController`
- If user navigates away from dashboard mid-fetch: TanStack Query cancels the request automatically via `AbortSignal`
- Network interruptions: TanStack Query retries failed queries (default: 3 retries with exponential backoff)

---

## 12. Authentication Flow

### 12.1 Auth Overview

FluxAI Gateway uses a **dual auth system**:

| Auth Type | Mechanism | Used For | Token Storage |
|---|---|---|---|
| **Session Auth** | NextAuth v5 + database sessions | Dashboard, admin, settings access | PostgreSQL `sessions` table + HTTP-only cookie |
| **API Key Auth** | HMAC-SHA256 hashed `sk_live_xxx` keys | Programmatic `/v1/*` inference API access | PostgreSQL `apiKeys` table (hash only) |

These two auth systems are **completely separate**. An API key cannot access the dashboard. A session cookie cannot access the inference API.

### 12.2 NextAuth Configuration

**File:** `auth.ts`

```ts
import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { users, accounts, sessions, verificationTokens } from "@fluxai/api/db/schema";
import { eq } from "drizzle-orm";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { email, password } = credentials as { email: string; password: string };
        const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
        const user = result[0];
        if (!user || !user.passwordHash) return null;
        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;
        return { id: user.id, email: user.email, role: user.role };
      },
    }),
  ],
  session: { strategy: "database" },
  callbacks: {
    async session({ session, user }) {
      session.user.role = user.role;
      session.user.id = user.id;
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
  },
  pages: {
    signIn: "/login",
    newUser: "/dashboard",
    error: "/login",
  },
  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
      },
    },
  },
});
```

### 12.3 Login Flow

1. User navigates to `/login`
2. Options:
   - **Email/Password:** Enter credentials → credentials provider validates against `users` table with bcrypt compare → session created → redirect to `/dashboard`
   - **Google OAuth:** Click "Continue with Google" → redirect to Google consent screen → callback → user created/updated via DrizzleAdapter → session created → redirect to `/dashboard`
   - **GitHub OAuth:** Same pattern as Google
3. Error states: Invalid credentials → inline error message. OAuth error → redirect to `/login?error=OAuthSignin`

### 12.4 Signup Flow

1. User navigates to `/register`
2. Form fields: Email, Password (with strength indicator), Confirm Password
3. Submit → client-side validation (email format, password min 8 chars, match) → POST to NextAuth signup endpoint
4. Server: `bcrypt.hash(password, 12)` → INSERT INTO users (email, passwordHash, balance: 0.00, status: 'active', role: 'user')
5. Auto-sign-in after successful registration → redirect to `/dashboard` (empty state — no API keys yet)
6. Optional: Email verification (send verification token email → `/verify-email?token=xxx`)

### 12.5 Onboarding Flow

New user's first dashboard experience:
1. Welcome card: "Welcome to FluxAI Gateway" with quick intro
2. Step 1: Create API Key — prominent CTA → `/dashboard/api-keys/create`
3. Step 2: Add Balance — "Top up your account to start making API calls" → `/dashboard/billing/top-up`
4. Step 3: Make your first request — copy-paste curl example from quickstart docs

### 12.6 API Key Generation Flow

1. User navigates to `/dashboard/api-keys/create`
2. Form: Key name (optional, e.g., "Production", "Development", "Cursor integration")
3. Submit → `POST /api/user/api-keys` with `{ name }`
4. Backend generates: `sk_live_${nanoid(32)}`, HMAC-SHA256 hashes it, stores hash
5. **Response includes raw key — shown ONCE:**
   - Full key displayed in monospace in a bordered box
   - Prominent warning: "Copy this key now. You won't be able to see it again."
   - Large "Copy to Clipboard" button
   - After user acknowledges (clicks "I've copied my key"), redirect to `/dashboard/api-keys`
6. After dismissal, key is never displayed again. Only `sk_live_abcd...wxyz` (first + last 4 chars) shown in key list.

### 12.7 Protected Dashboard Routing

```ts
// middleware.ts (Next.js Edge Middleware)
export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAdmin = req.auth?.user?.role === "admin";
  const path = req.nextUrl.pathname;

  // Auth pages — redirect if already logged in
  if (isLoggedIn && (path === "/login" || path === "/register")) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Dashboard routes
  if (path.startsWith("/dashboard") && !isLoggedIn) {
    return NextResponse.redirect(new URL(`/login?callbackUrl=${encodeURIComponent(path)}`, req.url));
  }

  // Settings routes
  if (path.startsWith("/settings") && !isLoggedIn) {
    return NextResponse.redirect(new URL(`/login?callbackUrl=${encodeURIComponent(path)}`, req.url));
  }

  // Admin routes
  if (path.startsWith("/admin") && !isAdmin) {
    return isLoggedIn
      ? NextResponse.redirect(new URL("/dashboard", req.url))
      : NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
});
```

### 12.8 Token/Session Handling

- **Session strategy:** Database (PostgreSQL `sessions` table). No JWT tokens needed.
- **Session expiry:** Set by `maxAge` in NextAuth config (default: 30 days).
- **Session verification:** Every dashboard API call validates session token against `sessions` table (Fastify `session-auth.ts` middleware).
- **Account linking:** OAuth accounts linked via `accounts` table. One email can have multiple OAuth providers + password.
- **Role changes:** Admin role set via DB (`UPDATE users SET role = 'admin'`). Takes effect on next session check (no logout required). First admin promoted manually via SQL.

---

## 13. Status & Observability Pages

### 13.1 System Status Page

**Route:** `/status`  
**Auth:** None (public)  
**Purpose:** Public read-only provider health status, inspired by status page patterns from Vercel, GitHub, and Stripe.

**Layout:**
```
┌──────────────────────────────────────────────┐
│  System Status                               │
│  All systems operational                     │
│  Last updated: 2 minutes ago                 │
├──────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐         │
│  │  OpenRouter  │  │  Together AI │  ...    │
│  │  ● Operational│  │  ● Operational│        │
│  │  Lat: 85ms   │  │  Lat: 120ms  │         │
│  │  99.9% uptime│  │  99.7% uptime│         │
│  └──────────────┘  └──────────────┘         │
│                                              │
│  Incident Timeline                           │
│  ├── May 10 — OpenRouter degraded (12 min)   │
│  ├── May 5  — All systems operational         │
│  └── May 1  — Scheduled maintenance           │
└──────────────────────────────────────────────┘
```

**Components:**
- `StatusGrid`: Grid of `ProviderCard` components
- `ProviderCard`: Shows provider name, status badge, latency indicator bar, uptime percentage
- `IncidentTimeline`: Chronological list of past incidents with duration and status

**Data source:** `useHealth` hook polling `GET /admin/health/providers` (public endpoint or cached version)

**Refresh:** Auto-refresh every 30s via TanStack Query `refetchInterval`

### 13.2 Provider Status UI

**Component:** `HealthBadge`

States:
- **Operational** (`healthy`): Small green-gray circle + "Operational"
- **Degraded** (`degraded`): Amber-gray circle + "Degraded Performance"
- **Major Outage** (`down`): Red-gray circle + "Service Disruption"

**Component:** `LatencyIndicator`

- Horizontal segmented bar showing latency range
- Segments: <50ms (green), 50-150ms (blue), 150-500ms (amber), >500ms (red)
- Current position marker: small triangle at actual latency value
- Animated transition when latency changes (spring, 500ms)

### 13.3 Uptime Cards

**Mock data model:**
```ts
interface UptimeData {
  provider: string;
  uptime24h: number;   // percentage
  uptime7d: number;
  uptime30d: number;
  currentStatus: "healthy" | "degraded" | "down";
  currentLatency: number;
  avgLatency24h: number;
}
```

Displayed as a compact card with:
- Provider logo/icon
- Large uptime % number
- Mini sparkline showing 7-day latency trend
- Current status badge

### 13.4 Latency Charts

**Component:** `LatencyChart`

- Line chart (Recharts) showing latency over time
- One line per provider (different muted chart colors)
- Time range toggle: 1h, 24h, 7d, 30d
- Y-axis: milliseconds (log scale for wide variance)
- X-axis: time
- Dark background, minimal grid, clean tooltips

### 13.5 Operational Metrics

Displayed as stat cards:
- **Total Requests Today:** Animated counter
- **Average Global Latency:** With trend arrow (up/down)
- **Active Provider Keys:** Count by provider
- **Circuit Breaker Triggers:** Number in last 24h
- **Emergency Reserve Usage:** Count (usually 0, red if >0)

### 13.6 Incident Timeline

**Data model:**
```ts
interface Incident {
  id: string;
  provider: string;
  status: "resolved" | "ongoing";
  severity: "minor" | "major" | "critical";
  title: string;
  description: string;
  startedAt: string;
  resolvedAt?: string;
  duration?: string;
}
```

Display: Vertical timeline with:
- Date header
- Incident card: severity badge, title, description, duration
- Resolved: muted. Ongoing: highlighted with border accent

### 13.7 Observability Dashboard Feel

The status page should evoke an **infrastructure monitoring dashboard** more than a marketing page:
- Dark background
- Clean typography with monospace for metrics
- No decorative elements
- Subtle data visualization style (minimal grid, muted colors)
- Auto-refreshing feel with subtle timestamp updates
- "Last updated" timestamp in monospace

---

## 14. Future Dashboard

### 14.1 Overview

The user dashboard is where customers manage their FluxAI Gateway account. Designed as an **infrastructure tooling interface** — clean, data-dense, operational.

### 14.2 Dashboard Overview (`/dashboard`)

**Layout:**
```
┌──────────────────────────────────────────────────────┐
│  Dashboard Header: "Overview"    [Top Up] [Settings]  │
├──────────────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────┐ │
│  │ Balance  │ │Reqs Today│ │Tokens    │ │Active   │ │
│  │ $42.50   │ │ 1,247    │ │ 3.2M     │ │Keys: 3  │ │
│  └──────────┘ └──────────┘ └──────────┘ └─────────┘ │
│                                                      │
│  ┌─── Token Burn (7 days) ─────────────────────────┐ │
│  │  [Area chart — token usage over time]            │ │
│  └──────────────────────────────────────────────────┘ │
│                                                      │
│  ┌─── Recent Activity ─────────────────────────────┐ │
│  │  Request to gpt-4o      2 min ago   1,250 tokens │ │
│  │  Request to llama-3-70b 5 min ago   890 tokens   │ │
│  │  API Key "Dev" created  1 hour ago               │ │
│  │  Top-up +$20.00        3 hours ago               │ │
│  └──────────────────────────────────────────────────┘ │
│                                                      │
│  Quick Links                                         │
│  [Create API Key] [View Docs] [Top Up Balance]       │
└──────────────────────────────────────────────────────┘
```

### 14.3 Usage Analytics (`/dashboard/usage`)

**Components:**
- `TokenBurnChart`: Recharts `AreaChart` — tokens per day over configurable period (7d/30d/90d). Stacked by model if multiple models used.
- `RequestVolumeChart`: Bar chart — requests per day
- `LatencyPercentileChart`: Line chart — p50, p90, p99 latency over time
- `ModelBreakdown`: Pie/donut chart or horizontal bar chart — token usage by model
- `ProviderBreakdown`: Usage distribution across providers
- Date range picker for custom ranges

**Empty state:** "No usage data yet. Make your first API request to see analytics."

### 14.4 Request Detail (`/dashboard/usage/[id]`)

**Data displayed:**
- Request ID
- Timestamp
- Model + Provider
- Tokens input / output
- Latency (ms)
- Cost (USD)
- Status (success/error/rate_limited)
- API Key used (masked)
- **Message content is NEVER displayed**

### 14.5 Billing & Balance (`/dashboard/billing`)

**Components:**
- `BalanceCard`: Large balance display with animated counter. Shows "Low balance" warning if < $5. Shows "Payment Required" if $0.
- `TopUpButton`: Opens Stripe Checkout flow. Amount selector: $5, $10, $25, $50, custom.
- `TransactionList`: Paginated table of `usage_ledger` entries. Columns: Date, Type (api_usage/topup/refund), Amount, Balance After.
- `InvoiceList`: Billing history from Stripe

**Top-up flow:**
1. User enters amount → clicks "Top Up"
2. Frontend calls `POST /api/user/top-up` → receives Stripe Checkout URL
3. Redirect to Stripe Checkout
4. On success → Stripe redirects to `/dashboard/billing?success=true`
5. Success banner: "Payment successful! Your balance has been updated."
6. SSE event updates balance in real-time (without page refresh)

### 14.6 API Key Management (`/dashboard/api-keys`)

**Key list table:**
- Name (editable inline)
- Masked key (`sk_live_abcd...wxyz`)
- Created date
- Last used (if available)
- Status badge (active/revoked)
- Actions: Edit name, Revoke (with confirmation modal)
- "Create New Key" button → `/dashboard/api-keys/create`

**Create key flow:**
- Name input (optional)
- "Create Key" button
- **Key reveal modal:** One-time display of full key with copy button + persistent "Copy and save this key — it won't be shown again" warning
- "I've saved my key" acknowledgment button dismisses modal

**Key detail page (`/dashboard/api-keys/[id]`):**
- Key name (editable)
- Key prefix (masked)
- Created date
- Status
- Usage stats for this key: requests, tokens, models used
- Revoke button with confirmation modal

### 14.7 Balance Tracking

- Real-time balance displayed in header (via SSE events)
- Balance card on `/dashboard` with large number + animated counter
- Low balance warnings:
  - Below $5: Yellow status badge "Low Balance"
  - Below $1: Red status badge "Payment Required"
  - At $0: Full-width warning banner with "Top Up Now" CTA

### 14.8 Usage Graphs

All charts use Recharts with the custom observability palette:
- Dark backgrounds match card surfaces
- Steel blue as primary series color
- Muted grid lines (opacity 0.05)
- Clean tooltips with glassmorphism effect
- Period toggles: 7d | 30d | 90d
- Export options: CSV download, print view

### 14.9 Billing Overview

- Current balance (prominent)
- Quick top-up options ($5, $10, $25, $50)
- Transaction history table
- Invoice list with PDF download links
- Payment method management (Stripe Customer Portal)

---

## 15. SEO & Performance

### 15.1 Metadata Strategy

**Root layout metadata:**
```tsx
export const metadata: Metadata = {
  title: {
    default: "FluxAI Gateway — Universal AI API Gateway",
    template: "%s — FluxAI Gateway",
  },
  description:
    "One API for every AI model. OpenAI-compatible gateway with intelligent key pooling, automatic failover, and real-time credit tracking. Pay only for what you use.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://fluxai.gateway",
    siteName: "FluxAI Gateway",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@fluxaigateway",
  },
  robots: {
    index: true,
    follow: true,
  },
};
```

**Per-page metadata:**
- Marketing pages: Unique titles + descriptions targeting AI/developer keywords
- Docs pages: `generateMetadata` from MDX frontmatter (`title`, `description`)
- Dashboard pages: `robots: { index: false, follow: false }`. Default title.
- Admin pages: `robots: { index: false, follow: false }`.

### 15.2 OpenGraph

- Custom OG image: `/public/og-image.png` (1200×630)
- Design: Graphite black background with FluxAI Gateway logo centered, "Universal AI API Gateway" subtitle. Minimalist, like Vercel/Stripe OG images.
- Twitter card: large image summary

### 15.3 Server Components

**RSC boundary strategy:**
- **Server Components:** Marketing pages, docs content, layouts, metadata
- **Client Components:** Interactive visualizations, forms, dashboard widgets, code highlighting (runtime), charts
- **Boundary:** Push the client boundary as deep as possible. A page should be a Server Component that imports Client Components for interactive islands.

```tsx
// Page (Server Component)
export default async function LandingPage() {
  return (
    <>
      <HeroSection />         {/* Hybrid — static text SSRed, animation client island */}
      <FeatureGrid />          {/* Server Component — no interactivity needed */}
      <GatewayDemo />          {/* Client Component — heavy animation */}
      <CodeSection />          {/* Hybrid — text SSRed, code tabs client */}
      <PricingPreview />       {/* Server Component */}
      <CTASection />           {/* Server Component */}
    </>
  );
}
```

### 15.4 Image Optimization

- All images via `next/image` with explicit `width`/`height`
- SVG icons via Lucide React (inline, no network requests)
- Provider logos: SVG format, optimized, served from `/public/`
- Hero background topology: Inline SVG (small, no network request)
- OG image: Static PNG in `/public/`
- Responsive images: `sizes` attribute on content images

### 15.5 Font Optimization

- Inter: Variable font, loaded via `next/font/google`
  ```tsx
  import { Inter, JetBrains_Mono } from "next/font/google";
  const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
  const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });
  ```
- Display swap strategy for fallback
- Preload primary weights (400, 500, 600, 700)
- Subset to Latin (no cyrillic/japanese needed for MVP)

### 15.6 Lazy Loading

- **Route segments:** Automatically code-split by Next.js App Router
- **Heavy components:** `dynamic(() => import("..."), { ssr: false })` for:
  - Gateway visualization (canvas-based)
  - API Playground
  - Charts (Recharts)
  - MDX content renderer
- **Below-fold sections:** `lazy()` + `<Suspense>` for marketing page sections below the fold

### 15.7 Core Web Vitals Targets

| Metric | Marketing Pages | Dashboard Pages | Notes |
|---|---|---|---|
| **LCP** | < 2.0s | < 2.5s | Hero content loads fast. Charts defer. |
| **FCP** | < 1.2s | < 1.5s | Server-rendered content. |
| **INP** | < 100ms | < 200ms | Minimal JS on marketing. Charts are heavier. |
| **CLS** | < 0.05 | < 0.1 | Reserved dimensions for all dynamic content. |
| **TTFB** | < 600ms | < 800ms | Vercel edge for static, serverless for dynamic. |

### 15.8 Performance Optimizations

- **Partial Prerendering (PPR):** Enable for docs pages. Static shell (sidebar, TOC) with dynamic content slot.
- **Streaming:** Dashboard pages use `loading.tsx` + React Suspense for progressive rendering.
- **Bundle analysis:** `@next/bundle-analyzer` in CI to catch regressions.
- **Third-party code:** Defer all third-party scripts (analytics, support chat). Use `next/script` with `strategy="lazyOnload"`.
- **CSS:** Tailwind purges unused styles in production.

---

## 16. Implementation Roadmap

### Phase 1: Foundation & Layout

**Scope:** Project scaffolding, layout system, core UI primitives, routing skeleton

**Tasks:**
- [ ] Initialize Next.js 15 project in `apps/web/`
- [ ] Install dependencies: Tailwind CSS, shadcn/ui, Framer Motion, Lucide React, Shiki, TanStack Query, Zustand
- [ ] Configure Tailwind with custom design tokens (colors, fonts, spacing)
- [ ] Set up shadcn/ui primitives (Button, Input, Card, Badge, etc.)
- [ ] Root layout: fonts (Inter + JetBrains Mono), global CSS, metadata, providers
- [ ] Route groups: `(marketing)`, `(auth)`, `(docs)`, `dashboard/`, `settings/`, `help/`, `admin/`
- [ ] Layout files for each route group
- [ ] Navbar component (desktop + mobile)
- [ ] Footer component
- [ ] Dashboard shell: sidebar + header
- [ ] Admin shell: admin sidebar + header
- [ ] Edge middleware for route protection
- [ ] `loading.tsx` skeleton placeholders for all routes
- [ ] `not-found.tsx` 404 page
- [ ] `error.tsx` error boundary

**Deliverable:** All routes navigable. Layout renders correctly. Auth redirects work.

---

### Phase 2: Marketing & Landing Page

**Scope:** Public-facing marketing pages

**Tasks:**
- [ ] Landing page (`/`): Hero section with topology background
- [ ] Feature grid (6 cards with icons)
- [ ] Architecture section (visual flow diagram)
- [ ] Code example section (Python/Node/curl tabs)
- [ ] Integrations section (provider logo grid)
- [ ] Pricing preview section
- [ ] Security section
- [ ] CTA section
- [ ] Pricing page (`/pricing`): pricing calculator, model pricing table
- [ ] Models page (`/models`): model directory with provider badges
- [ ] Changelog page (`/changelog`): release entries
- [ ] Scroll reveal animations (Framer Motion `whileInView`)

**Deliverable:** Complete landing page with all sections. Marketing pages render with real content.

---

### Phase 3: Infrastructure Visualization System

**Scope:** Signature gateway visualization components

**Tasks:**
- [ ] `TopologyCanvas` — canvas-based topology background
- [ ] `RequestFlow` — animated request particle along paths
- [ ] `GatewayVisualization` — full gateway diagram with provider nodes
- [ ] `FailoverAnimation` — provider failover visual
- [ ] `TokenStream` — streaming token typewriter effect
- [ ] `StreamingTerminal` — terminal simulation component
- [ ] `LatencyIndicator` — horizontal latency bar
- [ ] `HealthBadge` — status badge component
- [ ] `ProviderCard` — provider status card
- [ ] `ProviderGrid` — grid of provider cards
- [ ] Integrate `GatewayVisualization` into hero section
- [ ] Integrate `ProviderGrid` into status page
- [ ] Hover pulse and click interactions

**Deliverable:** All visualization components working with sample/mock data. Performance-optimized (60fps).

---

### Phase 4: Documentation System

**Scope:** Full docs experience with MDX, search, API reference

**Tasks:**
- [ ] MDX integration (`next-mdx-remote` or `@next/mdx`)
- [ ] Docs sidebar with collapsible sections
- [ ] Docs search (Fuse.js client-side)
- [ ] Syntax highlighting with Shiki (custom theme matching design system)
- [ ] `CodeTabs` component (Python/Node/curl tabs)
- [ ] `CopyButton` component
- [ ] `ApiEndpointCard` component with schema rendering
- [ ] `SchemaTable` component (Zod schema → HTML table)
- [ ] Document content: Overview, Quickstart, API Reference, SDKs
- [ ] Curl preview examples on Quickstart page
- [ ] Table of contents (right side, sticky)
- [ ] Docs mobile responsiveness (drawer sidebar)

**Deliverable:** Full docs site with all sections and working search.

---

### Phase 5: API Playground

**Scope:** Interactive API testing tool

**Tasks:**
- [ ] `ApiPlayground` component with JSON editor
- [ ] Request builder: model selector, message input, parameter controls
- [ ] Streaming response viewer (TokenStream integration)
- [ ] Non-streaming response viewer (SyntaxBlock integration)
- [ ] Request history (localStorage)
- [ ] Error display (OpenAI-compatible error format)
- [ ] API key input (user's own key from dashboard)
- [ ] "Try it" links from docs API reference pages

**Deliverable:** Users can test chat completions from the docs page with their own API key.

---

### Phase 6: Authentication System

**Scope:** NextAuth integration, login/register pages, session management

**Tasks:**
- [ ] NextAuth v5 configuration (`auth.ts`)
- [ ] DrizzleAdapter integration with `@auth/drizzle-adapter`
- [ ] OAuth providers: Google, GitHub
- [ ] Credentials provider (email/password)
- [ ] Login page with login form + OAuth buttons
- [ ] Register page with registration form
- [ ] Password reset flow (forgot → email → reset)
- [ ] Email verification flow
- [ ] Session provider (`SessionProvider` in root layout)
- [ ] Auth-aware navbar (login/register vs dashboard link)
- [ ] Sign out functionality
- [ ] Auth error handling (invalid credentials, OAuth errors)

**Deliverable:** Users can sign up, log in, and log out. Sessions persist across pages.

---

### Phase 7: User Dashboard

**Scope:** Full user dashboard with usage, billing, API keys

**Tasks:**
- [ ] TanStack Query setup (`QueryClientProvider`)
- [ ] Typed API client (`lib/api-client.ts`)
- [ ] Dashboard overview page: stats cards, recent activity, quick links
- [ ] Onboarding flow for new users (create key → add balance → first request)
- [ ] Usage analytics page: token burn chart, request volume, latency chart, model breakdown
- [ ] Request detail page (metadata only, never message content)
- [ ] Billing page: balance display, top-up flow, transaction history
- [ ] Top-up flow: amount input → Stripe Checkout redirect → success banner
- [ ] API keys page: key list, create key, key detail, revoke key
- [ ] Key reveal modal (one-time display with copy + warning)
- [ ] Settings pages: profile, security (password change, sessions), notifications, billing address
- [ ] Help center: knowledge base, contact form, debug logging toggle
- [ ] SSE integration for real-time balance updates
- [ ] Dashboard loading skeletons
- [ ] Dashboard empty states
- [ ] Dashboard error states

**Deliverable:** Complete user dashboard with all pages functional and connected to backend API.

---

### Phase 8: Admin Dashboard

**Scope:** Full operator dashboard

**Tasks:**
- [ ] Admin overview: KPIs, daily revenue, system health, alerts
- [ ] User management: paginated user list, search, detail page, suspend/unsuspend
- [ ] Provider key pool: key table, add key form, status management, rotate
- [ ] Model mappings: mapping table, create mapping form, pricing editor
- [ ] Usage ledger browser: immutable ledger, filter by user/type, read-only
- [ ] Margin analytics: revenue charts, model margin breakdown, period filter
- [ ] System health: provider status grid, key pool health, queue depths
- [ ] Emergency controls: drain provider (with confirmation), force rotate all keys
- [ ] Admin auth gate (role === 'admin' check)
- [ ] Confirm action modals for destructive operations

**Deliverable:** Complete admin dashboard with all management and monitoring pages.

---

### Phase 9: Status Page

**Scope:** Public system status page

**Tasks:**
- [ ] Status page layout (`/status`)
- [ ] Provider status grid with real-time health data
- [ ] Uptime display (24h, 7d, 30d)
- [ ] Latency charts with time range toggles
- [ ] Incident timeline
- [ ] Auto-refresh (every 30s)
- [ ] Operational metrics display

**Deliverable:** Public status page showing real-time provider health.

---

### Phase 10: Polish, Performance & Accessibility

**Scope:** Quality, performance optimization, accessibility audit

**Tasks:**
- [ ] Lighthouse audit: marketing pages ≥ 95, dashboard ≥ 90
- [ ] Core Web Vitals optimization
- [ ] Bundle size analysis and optimization
- [ ] Image optimization audit
- [ ] Font loading optimization
- [ ] CLS elimination (reserved dimensions for all dynamic content)
- [ ] WCAG 2.1 AA audit (marketing + auth)
- [ ] Keyboard navigation testing
- [ ] Screen reader testing
- [ ] Focus management on modals and route changes
- [ ] Reduced motion support verification
- [ ] Color contrast audit
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Mobile responsive QA (all breakpoints)
- [ ] Loading state polishing (skeleton accuracy)
- [ ] Error state polishing (helpful messages, retry actions)
- [ ] Empty state polishing (useful CTAs)
- [ ] Animation fine-tuning (durations, easings, stagger values)
- [ ] Copy review (all text content)
- [ ] Final visual design review against design system spec
- [ ] `pnpm build` passes with zero warnings
- [ ] `pnpm lint` passes with zero errors

**Deliverable:** Production-ready frontend ready for deployment.

---

## Dependency Table

### Root

```json
{
  "devDependencies": {
    "turbo": "^2.0.0"
  }
}
```

### `apps/web/package.json`

```json
{
  "name": "@fluxai/web",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@fluxai/shared": "workspace:*",
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "next-auth": "^5.0.0",
    "@auth/drizzle-adapter": "^1.0.0",
    "@tanstack/react-query": "^5.0.0",
    "recharts": "^2.0.0",
    "framer-motion": "^11.0.0",
    "lucide-react": "^0.400.0",
    "shiki": "^1.0.0",
    "zod": "^3.23.0",
    "zustand": "^5.0.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0",
    "class-variance-authority": "^0.7.0",
    "bcryptjs": "^2.4.3",
    "lenis": "^1.0.0",
    "next-mdx-remote": "^5.0.0",
    "fuse.js": "^7.0.0"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "typescript": "^5.6.0",
    "tailwindcss": "^4.0.0",
    "postcss": "^8.0.0",
    "autoprefixer": "^10.0.0",
    "@tailwindcss/typography": "^0.5.0",
    "tailwindcss-animate": "^1.0.0",
    "eslint": "^9.0.0",
    "eslint-config-next": "^15.0.0"
  }
}
```

---

*End of frontend.md*
