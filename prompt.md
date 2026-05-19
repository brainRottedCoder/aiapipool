You are continuing an already-generated frontend theme and architecture for FluxAI Gateway inside a TurboRepo monorepo.

IMPORTANT:
Do NOT redesign the project from scratch.
Do NOT change the established visual direction.
You must CONTINUE and COMPLETE the existing design system and implementation consistently.

Current stack:
- Next.js 15 App Router
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui
- Framer Motion
- TanStack Query
- Zustand
- Lucide React
- Shiki
- Lenis

Project structure:
apps/web/

The current generated UI already includes:
- infrastructure-inspired dark theme
- muted steel blue accents
- enterprise AI gateway aesthetic
- developer tooling visuals
- observability style layouts

You must preserve this exact visual language.

==================================================
PRIMARY OBJECTIVE
==================================================

Fully implement the remaining frontend architecture and complete all missing pages, sections, layouts, states, and integrations while strictly maintaining the existing theme and design consistency.

Everything must feel like:
- Vercel
- Stripe
- Datadog
- Railway
- Linear
- Warp
combined into one premium AI infrastructure platform.

==================================================
DESIGN RULES
==================================================

DO NOT:
- introduce random colors
- add neon cyberpunk aesthetics
- use playful startup illustrations
- use generic SaaS gradients
- redesign existing sections
- create inconsistent spacing
- change typography hierarchy
- use glassmorphism excessively
- make consumer-style UI

DO:
- keep graphite black backgrounds
- keep muted steel blue accents
- maintain operational infrastructure feel
- use subtle topology/network visuals
- maintain premium spacing
- preserve infrastructure observability aesthetic
- use elegant motion only
- keep typography minimal and precise
- preserve existing component architecture

==================================================
IMPLEMENT EVERYTHING LEFT
==================================================

Complete all missing sections/pages/components from frontend.md including:

MARKETING:
- complete landing page polish
- pricing page
- model directory
- changelog
- public system status page
- integrations section
- security section
- architecture visual section

DOCS:
- MDX docs system
- docs sidebar
- TOC
- API reference
- SDK pages
- code tabs
- syntax highlighting
- copy buttons
- schema renderer
- API playground

AUTH:
- login
- register
- forgot password
- reset password
- email verification

DASHBOARD:
- overview
- usage analytics
- request detail
- billing
- top-up flow
- API key management
- settings
- notifications
- help center
- debug logging page

ADMIN:
- admin overview
- user management
- provider key pool
- model mappings
- ledger browser
- margin analytics
- provider health
- emergency controls

VISUALIZATION SYSTEM:
- request flow animations
- gateway topology visuals
- failover animations
- streaming token effects
- latency indicators
- health badges
- infrastructure diagrams
- provider grids

==================================================
IMPORTANT IMPLEMENTATION RULES
==================================================

1. KEEP EXISTING THEME
Everything new must visually match the already generated UI.

2. REUSE COMPONENTS
Do not duplicate component logic.
Create reusable shared components.

3. SERVER-FIRST
Use Next.js Server Components wherever possible.

4. CLIENT COMPONENTS ONLY FOR:
- charts
- animations
- forms
- streaming
- dashboard interactions

5. RESPONSIVE DESIGN
Desktop-first.
Must scale beautifully to tablet/mobile.

6. MOTION SYSTEM
Use subtle Framer Motion:
- fade
- slight translateY
- topology pulse
- request flow
- elegant hover states

NO:
- bouncy animations
- excessive scaling
- flashy transitions

7. CODE QUALITY
Everything must be:
- production-ready
- strongly typed
- modular
- scalable
- clean architecture

8. DASHBOARD FEEL
Dashboard should feel like:
“AI infrastructure control center”

9. STATUS PAGE FEEL
Status page should feel like:
“enterprise observability dashboard”

10. DOCS FEEL
Docs should feel comparable to:
- Stripe Docs
- Vercel Docs
- Supabase Docs

==================================================
TECHNICAL REQUIREMENTS
==================================================

Implement:
- loading states
- skeletons
- empty states
- error states
- optimistic UI where needed
- TanStack Query hooks
- typed API client integration
- SSE support
- protected routes
- middleware auth guards
- accessibility support
- keyboard navigation
- reduced motion support

==================================================
PERFORMANCE
==================================================

Optimize for:
- Lighthouse 95+
- minimal client JS
- streaming SSR
- lazy loading heavy visuals
- optimized animations
- clean hydration boundaries

==================================================
FINAL GOAL
==================================================

The final frontend should feel like a world-class AI infrastructure platform used by serious developers and enterprises.

It must look production-ready, premium, scalable, and visually unified across every page and component.

Continue implementing ONLY within the established design system and architecture already generated.