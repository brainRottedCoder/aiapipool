---
name: Obsidian Infrastructure
colors:
  surface: '#141313'
  surface-dim: '#141313'
  surface-bright: '#3a3939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353434'
  on-surface: '#e5e2e1'
  on-surface-variant: '#c2c6d6'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#8c909f'
  outline-variant: '#424754'
  surface-tint: '#adc6ff'
  primary: '#adc6ff'
  on-primary: '#002e6a'
  primary-container: '#4d8eff'
  on-primary-container: '#00285d'
  inverse-primary: '#005ac2'
  secondary: '#d0bcff'
  on-secondary: '#3c0091'
  secondary-container: '#571bc1'
  on-secondary-container: '#c4abff'
  tertiary: '#ffb786'
  on-tertiary: '#502400'
  tertiary-container: '#df7412'
  on-tertiary-container: '#461f00'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a42'
  on-primary-fixed-variant: '#004395'
  secondary-fixed: '#e9ddff'
  secondary-fixed-dim: '#d0bcff'
  on-secondary-fixed: '#23005c'
  on-secondary-fixed-variant: '#5516be'
  tertiary-fixed: '#ffdcc6'
  tertiary-fixed-dim: '#ffb786'
  on-tertiary-fixed: '#311400'
  on-tertiary-fixed-variant: '#723600'
  background: '#141313'
  on-background: '#e5e2e1'
  surface-variant: '#353434'
  surface-base: '#030303'
  surface-elevated: '#0A0A0A'
  surface-overlay: '#121212'
  border-subtle: rgba(255, 255, 255, 0.08)
  border-bright: rgba(255, 255, 255, 0.15)
  accent-pink: '#EC4899'
  accent-lime: '#E4F222'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '600'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
  max-width: 1440px
---

## Brand & Style
The design system is engineered for high-performance infrastructure and developer tools. It balances technical precision with a premium, cinematic aesthetic. The brand personality is authoritative, calm, and hyper-efficient, evoking the feeling of a sophisticated command center.

The design style is a hybrid of **Minimalism** and **Glassmorphism**, specifically optimized for dark modes. It utilizes "Shadow-Light" logic: depth is created not through traditional shadows, but through 1px inner borders (rim lights) and subtle variations in surface reflectivity. The interface should feel like a single, seamless piece of dark hardware where software elements are etched into the surface with light.

## Colors
The palette is rooted in a "Pure Black" strategy to maximize contrast and visual clarity. The background is a deepest graphite (`#030303`), providing a true-black foundation that allows primary accents to pop.

- **Primary & Secondary:** A high-vibrancy Blue (`#3B82F6`) and Violet (`#8B5CF6`) are used for primary actions and focus states. These should be applied sparingly to maintain the "dark tool" aesthetic.
- **Accents:** Pink and Lime are reserved for specialized data visualization or status indicators (e.g., critical errors or success states).
- **Surface Strategy:** Instead of distinct grays, depth is achieved by layering transparent white overlays (`rgba(255,255,255, 0.03)` to `0.08`) over the base black, ensuring a cohesive dark-to-light progression.

## Typography
The typography system prioritizes legibility and technical density. **Inter** serves as the workhorse for the majority of the UI, utilizing its variable weight capabilities to create a clear hierarchy without excessive font size changes.

For technical metadata, code snippets, and status labels, **JetBrains Mono** is used to introduce a "monospaced" flavor that reinforces the developer-tool aesthetic. All headings use negative letter-spacing to appear tighter and more professional, while labels use expanded tracking for better readability at small sizes.

## Layout & Spacing
The system uses a **Fixed Grid** model for primary content containers, centered on the viewport, with a maximum width of 1440px. Spacing follows a strict 4px linear scale.

- **Desktop:** A 12-column grid with 24px gutters. Use generous margins (48px+) to create "breathable" high-fidelity sections.
- **Mobile:** A 4-column fluid grid with 16px margins. 
- **Reflow Rules:** Sidebars and navigation panels should collapse into drawer menus on mobile, while data tables should transition to card-based layouts or horizontal-scroll views to maintain data integrity.
- **Rhythm:** Utilize vertical "stacking" blocks of 64px or 80px to separate major features, ensuring the UI feels expansive and premium.

## Elevation & Depth
In this design system, elevation is not conveyed through shadows, but through **Tonal Layering** and **1px Rim Lights**.

- **Level 0 (Background):** `#030303`. 
- **Level 1 (Cards/Sidebar):** 1px border of `rgba(255,255,255, 0.08)` with a background of `rgba(255,255,255, 0.03)`.
- **Level 2 (Popovers/Dialogs):** 1px border of `rgba(255,255,255, 0.15)` with a 20px backdrop blur and background of `rgba(255,255,255, 0.08)`.
- **Glows:** For active states or primary buttons, a very low-opacity (10-15%) outer glow using the primary blue color can be used to simulate an LED emission effect.

## Shapes
The shape language is "Soft-Precision." We use a conservative roundedness level (`0.25rem` for standard components) to maintain a crisp, professional edge that isn't as aggressive as sharp 90-degree corners, but avoids the playfulness of highly rounded "bubble" designs. 

Large containers and cards use `0.5rem` (`rounded-lg`) to provide a subtle structural frame for the inner sharp-edged data.

## Components
- **Buttons:** Primary buttons use a solid blue background with a subtle top-light gradient. Secondary buttons are transparent with a 1px `border-subtle` and white text.
- **Input Fields:** Darker than the surface (`#000000`), 1px `border-subtle`. On focus, the border transitions to the primary blue with a 1px solid stroke.
- **Chips/Badges:** Monospaced text (JetBrains Mono) inside a subtle gray capsule. Status-specific chips (e.g., "Live") use a small 4px glowing dot.
- **Lists:** Clean rows separated by 1px `rgba(255,255,255, 0.05)` lines. No alternating row colors; use a faint white overlay on hover.
- **Cards:** No shadows. Define boundaries using a 1px border. For a "premium" feel, add a linear gradient to the border that runs from `white/10%` to `white/2%`.
- **Navigation:** Vertical sidebar with icons. Icons should be stroke-based (1.5px weight) and monochromatic, only turning primary blue when active.