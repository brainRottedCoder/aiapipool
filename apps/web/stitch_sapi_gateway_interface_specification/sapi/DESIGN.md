---
name: SAPI
colors:
  surface: '#131314'
  surface-dim: '#131314'
  surface-bright: '#3a393a'
  surface-container-lowest: '#0e0e0f'
  surface-container-low: '#1c1b1c'
  surface-container: '#201f20'
  surface-container-high: '#2a2a2b'
  surface-container-highest: '#353436'
  on-surface: '#e5e2e3'
  on-surface-variant: '#c1c7d0'
  inverse-surface: '#e5e2e3'
  inverse-on-surface: '#313031'
  outline: '#8b919a'
  outline-variant: '#41474f'
  surface-tint: '#9acbff'
  primary: '#9acbff'
  on-primary: '#003355'
  primary-container: '#6b9fd4'
  on-primary-container: '#003559'
  inverse-primary: '#286293'
  secondary: '#9dcaff'
  on-secondary: '#003257'
  secondary-container: '#024c7f'
  on-secondary-container: '#89bcf6'
  tertiary: '#c8c6c8'
  on-tertiary: '#303032'
  tertiary-container: '#9c9a9d'
  on-tertiary-container: '#333234'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d0e4ff'
  primary-fixed-dim: '#9acbff'
  on-primary-fixed: '#001d34'
  on-primary-fixed-variant: '#004a79'
  secondary-fixed: '#d1e4ff'
  secondary-fixed-dim: '#9dcaff'
  on-secondary-fixed: '#001d35'
  on-secondary-fixed-variant: '#00497b'
  tertiary-fixed: '#e4e2e4'
  tertiary-fixed-dim: '#c8c6c8'
  on-tertiary-fixed: '#1b1b1d'
  on-tertiary-fixed-variant: '#474649'
  background: '#131314'
  on-background: '#e5e2e3'
  surface-variant: '#353436'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  code-md:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: '1.5'
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 48px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 32px
---

## Brand & Style

The design system is engineered for the high-stakes environment of AI infrastructure management. It embodies the precision of a terminal and the clarity of a high-performance control center. The visual language centers on reliability, speed, and technical depth, tailored for developers and system architects who require an unobtrusive yet powerful interface.

The style is a synthesis of **Modern Corporate** and **Technical Minimalism**. It prioritizes information density and operational status over decorative elements. Visual interest is generated through functional aesthetics: node-link diagrams, topology lines representing request paths, and monospaced data streams that communicate the "heartbeat" of the API gateway.

## Colors

The palette is anchored in a deep graphite black to minimize eye strain during extended technical sessions. Steel blue accents provide a professional, calm energy that distinguishes interactive elements without creating visual fatigue.

- **Base Surfaces:** Use `#0a0a0b` for the primary background. Elevate secondary containers with `#121214`.
- **Accents:** Use the brighter steel blue (`#6b9fd4`) for primary actions and active states. The muted variant (`#4a7fb5`) is reserved for secondary indicators and hover states.
- **Borders:** All borders must be subtle, using `rgba(255, 255, 255, 0.08)` to define structure without harsh transitions.
- **Semantic Colors:** Status indicators (Online, Degraded, Offline) use high-vibrancy greens, ambers, and reds to ensure critical alerts are immediately identifiable against the dark backdrop.

## Typography

Typography is used to distinguish between UI navigation and technical data. 

- **Inter** is the primary typeface for all interface labels, headlines, and body copy. It is selected for its exceptional legibility in dark mode.
- **JetBrains Mono** is utilized for all technical output, including API endpoints, JSON payloads, logs, and status labels. This creates a clear mental model: if it is monospaced, it is data; if it is sans-serif, it is navigation.
- **Scaling:** For mobile devices, `headline-xl` should scale down to `28px` to maintain readable line lengths in narrow viewports.

## Layout & Spacing

This design system employs a **Fluid Grid** model with high information density. 

- **Grid System:** A 12-column grid is used for dashboards. In technical views (like log explorers), a 2-column "Master-Detail" layout is preferred.
- **Rhythm:** An 8px linear scale governs all padding and margins. Use `16px` (md) for standard gutter spacing between dashboard widgets.
- **Breakpoints:** 
    - **Mobile (<768px):** Single column, margins reduced to 16px. Sidebars collapse into drawer menus.
    - **Tablet (768px - 1280px):** 6-column internal widgets, margins at 24px.
    - **Desktop (>1280px):** Full 12-column layout, max-width of 1600px for the central container to prevent excessive line lengths.

## Elevation & Depth

Depth is conveyed through **Tonal Layering** rather than traditional shadows. In a dark, technical interface, shadows often create "muddy" visuals; instead, we use background color shifts and subtle borders.

- **Layer 0 (Background):** `#0a0a0b` - The canvas.
- **Layer 1 (Card/Container):** `#121214` with a `1px` border of `rgba(255, 255, 255, 0.08)`.
- **Layer 2 (Popovers/Modals):** `#1a1a1c` with a slightly brighter border and a very soft, high-diffusion shadow (`box-shadow: 0 20px 40px rgba(0,0,0,0.4)`).
- **Interactive Depth:** When an element is hovered, the background should shift slightly lighter or the border color should transition to the primary steel blue.

## Shapes

The shape language is "Soft-Technical." While the system feels precise and sharp, a consistent corner radius is applied to humanize the interface and improve focus.

- **Base Radius:** 8px (`rounded-md`) is the standard for cards, buttons, and input fields.
- **Small Radius:** 4px (`rounded-sm`) for chips, tags, and checkboxes.
- **Large Radius:** 16px (`rounded-xl`) for main dashboard containers or modals.
- **Icons:** Use linear, 2px stroke icons to match the thin border language of the UI. Avoid filled icons unless indicating an active toggle state.

## Components

Components follow the **shadcn/ui** philosophy: functional, accessible, and easily composable.

- **Buttons:** 
    - *Primary:* Solid Steel Blue (`#6b9fd4`) with white text.
    - *Secondary:* Transparent background with a `1px` border and white text.
    - *Ghost:* No border or background until hover; used for utility actions.
- **Input Fields:** Darker than the surface (`#070708`) with 8px radius. The focus state must use a `2px` steel blue ring.
- **Cards:** Used to house metrics and graphs. Title bars should be separated by a subtle horizontal rule.
- **Chips / Badges:** Use JetBrains Mono for the text. Use muted background tints for categories (e.g., a 10% opacity steel blue background for "GET" requests).
- **Status Indicators:** Small 8px circles with an outer "pulse" glow effect for critical systems that are currently routing traffic.
- **Data Tables:** Row-based with no vertical borders. Use alternating row stripes (zebra striping) only when data density exceeds 15 rows per view.