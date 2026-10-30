---
name: Luminescent Telemetry
colors:
  surface: '#0f131c'
  surface-dim: '#0f131c'
  surface-bright: '#353943'
  surface-container-lowest: '#0a0e17'
  surface-container-low: '#181b25'
  surface-container: '#1c1f29'
  surface-container-high: '#262a34'
  surface-container-highest: '#31353f'
  on-surface: '#dfe2ef'
  on-surface-variant: '#bbcabf'
  inverse-surface: '#dfe2ef'
  inverse-on-surface: '#2c303a'
  outline: '#86948a'
  outline-variant: '#3c4a42'
  surface-tint: '#4edea3'
  primary: '#4edea3'
  on-primary: '#003824'
  primary-container: '#10b981'
  on-primary-container: '#00422b'
  inverse-primary: '#006c49'
  secondary: '#4cd7f6'
  on-secondary: '#003640'
  secondary-container: '#03b5d3'
  on-secondary-container: '#00424e'
  tertiary: '#d0bcff'
  on-tertiary: '#3c0091'
  tertiary-container: '#b090ff'
  on-tertiary-container: '#4600a7'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#6ffbbe'
  primary-fixed-dim: '#4edea3'
  on-primary-fixed: '#002113'
  on-primary-fixed-variant: '#005236'
  secondary-fixed: '#acedff'
  secondary-fixed-dim: '#4cd7f6'
  on-secondary-fixed: '#001f26'
  on-secondary-fixed-variant: '#004e5c'
  tertiary-fixed: '#e9ddff'
  tertiary-fixed-dim: '#d0bcff'
  on-tertiary-fixed: '#23005c'
  on-tertiary-fixed-variant: '#5516be'
  background: '#0f131c'
  on-background: '#dfe2ef'
  surface-variant: '#31353f'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.03em
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '600'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 26px
    fontWeight: '600'
    lineHeight: 34px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: 0em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
    letterSpacing: -0.01em
  body-md:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.06em
  code-telemetry:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 0.75rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style
The design system positions tech education and career analytics as an instrument-grade discipline. It communicates precision, forward momentum, and professional clarity to senior engineers, data scientists, and technical operators seeking measurable skill progression. 

The aesthetic synthesizes modern corporate clarity with ambient glassmorphism and luminous telemetry styling:
- **Atmosphere:** Dark, focused, architectural canvas evoking an advanced development terminal or space flight telemetrics interface.
- **Visual Tension:** Pitch-deep slate grounds high-contrast, laser-sharp typography, punctuated by luminescent accent channels (emerald for mastery/progression, cyan for active metrics, violet for forward-looking trajectory projections).
- **Tone:** Methodical, unembellished, authoritative, and empowering. Interactive states avoid cartoonish bounce in favor of instantaneous, crisp responses with controlled ambient glow.

## Colors
The palette leverages a deeply calibrated slate-navy base to create maximum optical contrast for vibrant spectral telemetry points.

- **Primary (`#10B981` Emerald):** Represents mastery, successful validations, active streaks, and positive career acceleration indices.
- **Secondary (`#06B6D4` Cyan):** Denotes real-time metrics, active learning paths, telemetry cursors, and navigational states.
- **Tertiary (`#8B5CF6` Violet):** Reserved for predictive skill curves, deep analytics models, career market projections, and AI-driven recommendations.
- **Neutral Canvas (`#090D16` Deep Slate):** An absolute dark floor tinted with cold blue-gray, preventing color vibration while maintaining total contrast with text and metric overlays.
- **Surface Scale:**
  - Base: `#090D16`
  - Elevated Container Level 1: `#0F172A` with 60% opacity.
  - Elevated Container Level 2: `#1E293B` with 40% opacity.
  - Border Substrate: `#334155` with 40% opacity.
- **Data Visualization Rule:** Emerald, cyan, and violet must maintain explicit semantic isolation. Never mix color meanings within a single metric card (e.g., violet is never used for success/confirmation states; emerald is never used for hypothetical forecasts).

## Typography
Typography is structured for maximum scannability and analytical density. 

- **Display & Section Headers (`Plus Jakarta Sans`):** Delivers clean geometry with a modern, technical cut that prevents the interface from feeling like a generic terminal. Use negative letter spacing on larger scales to ensure tight, unified headline shapes.
- **Body & Metrics (`Inter`):** Selected for its hyper-legible rendering in data tables, tooltips, analytics graphs, and dense code annotations.
- **Tabular Numerics:** Enable `font-feature-settings: "tnum" 1` on all metrics, counters, and analytical axis readouts to guarantee rigid columnar vertical alignment during data updates.
- **Labeling:** Micro-labels (`label-sm`) use semi-bold weights and slight tracking expansions (`0.06em`) for categorical and taxonomy tagging.

## Layout & Spacing
The layout adheres to a strict 12-column responsive fluid grid designed around multi-pane telemetry dashboards and focused reading modes.

- **Breakpoints:**
  - Desktop / Ultrawide: `>= 1280px` (12 columns, `margin: 2rem`, `gutter: 1.5rem`).
  - Tablet / Laptop: `768px - 1279px` (8 columns, `margin: 1.5rem`, `gutter: 1rem`).
  - Mobile: `< 768px` (4 columns, `margin-mobile: 1rem`, `gutter-mobile: 0.75rem`).
- **Layout Model:**
  - Analytics and trend dashboards utilize a multi-pane split: fixed or collapsing 260px navigational left rail, a dominant 8-column main analytical canvas, and a contextual 4-column side panel for drill-down metrics.
  - Component padding utilizes an 8-point harmonic rhythm. Inner card padding matches `space-lg` for desktop and collapses to `space-md` on mobile viewports.
- **Alignment:** Data points, visualization axes, and metric indicators must strictly snap to layout columns or baseline grid intervals without loose optical offsets.

## Elevation & Depth
Depth is created through glassmorphic surface stepping, low-contrast structural boundaries, and selective edge illumination rather than heavy drop shadows.

- **Surface Tiers:**
  - **Level 0 (Canvas):** Pure `#090D16`.
  - **Level 1 (Card Substrates):** Semi-transparent `#0F172A` with `backdrop-filter: blur(12px)`. Outlined with `1px solid rgba(51, 65, 85, 0.4)`.
  - **Level 2 (Popovers, Modals, Flyouts):** Solid `#1E293B` with `backdrop-filter: blur(20px)` and an inner top hairline border (`1px solid rgba(255, 255, 255, 0.1)`).
- **Luminescent Edge & Glow Behavior:**
  - Interactive states trigger calibrated glow halos rather than harsh shadows. 
  - Emerald focus glow: `box-shadow: 0 0 16px rgba(16, 185, 129, 0.25)`.
  - Cyan metric glow: `box-shadow: 0 0 16px rgba(6, 182, 212, 0.25)`.
  - Violet analytical glow: `box-shadow: 0 0 16px rgba(139, 92, 246, 0.25)`.
- **Card Separation:** Strictly avoid fully opaque, high-elevation black drop shadows. Depth must feel like ambient light passing through dark, tinted polycarbonate panels.

## Shapes
The shape language delivers a balanced, technical aesthetic: neither overly razor-sharp nor overly bubbly.

- **Base Radius (0.5rem / 8px):** Applied to standard interactive controls, input fields, badges, and smaller utility buttons.
- **Large Radius (1rem / 16px):** Applied to core content cards, analytics chart containers, and modal dialogs.
- **Pill Treatment:** Restricted exclusively to micro-status indicators, skill badges, and progress chips (full rounded radius) to create crisp visual contrast against rectangular data cards.
- **Precision Detailing:** Corners must retain clean anti-aliasing against deep backgrounds without heavy border artifacts.

## Components

### Buttons & Actions
- **Primary Action (Luminescent Emerald):** Background `#10B981`, foreground `#090D16` (deep dark for maximum contrast), bold weight. On hover: brightness increases slightly with an ambient `rgba(16, 185, 129, 0.35)` drop glow.
- **Secondary Action (Ghost Slate):** Background `rgba(15, 23, 42, 0.6)`, border `1px solid rgba(51, 65, 85, 0.5)`, text `#F8FAFC`. On hover: border switches to cyan (`#06B6D4`) with zero layout shift.
- **Ghost/Icon Buttons:** Transparent base, text/icon `#94A3B8`. On hover: text becomes `#FFFFFF`, background `#1E293B`.

### Cards & Container Panels
- Multi-layered glass surface (`#0F172A` at 70% opacity, 12px blur).
- Hairline perimeter border: `1px solid rgba(51, 65, 85, 0.45)`.
- Header areas feature integrated contextual telemetry tags aligned right, maintaining visual balance with card titles.

### Chips & Skill Badges
- Compact height (24px - 28px), pill-shaped.
- Subdued tinted fill (`rgba([accent], 0.12)`) paired with a high-contrast text color matching the accent hue.
- Interactive chips feature a fine 1px border matching the accent at 30% opacity, intensifying to 100% on active/hover state.

### Input Fields & Controls
- Background `#0B132B`, inset border `1px solid #334155`. Text color `#F8FAFC`.
- Focus state: Border instantly shifts to `#06B6D4` with a subtle outer glow (`0 0 0 3px rgba(6, 182, 212, 0.15)`).
- Checkboxes & Radios: Square (checkbox) or circle (radio), `#0F172A` fill, `#334155` border. Checked state transitions smoothly to `#10B981` with an inner white icon/dot.

### Analytics & Career Data Visualizations
- **Trend Charts:** Lines utilize 2px stroke width with soft gradient fills beneath (`rgba([color], 0.25)` to `transparent`).
- **Data Crosshairs:** Tooltips render as Level 2 elevated panels (`#1E293B`) anchored by glowing pinpoint markers.
- **Skill Matrix Radar:** Grid lines use low-contrast slate (`rgba(51, 65, 85, 0.3)`), with polygonal overlays mapped in semi-transparent violet (`rgba(139, 92, 246, 0.4)`) and cyan boundaries.