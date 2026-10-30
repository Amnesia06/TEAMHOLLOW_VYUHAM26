---
name: Blueprint Precision
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#434655'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#747686'
  outline-variant: '#c4c5d7'
  surface-tint: '#2151da'
  primary: '#0037b0'
  on-primary: '#ffffff'
  primary-container: '#1d4ed8'
  on-primary-container: '#cad3ff'
  inverse-primary: '#b7c4ff'
  secondary: '#006398'
  on-secondary: '#ffffff'
  secondary-container: '#5bb8fe'
  on-secondary-container: '#00476e'
  tertiary: '#003ca3'
  on-tertiary: '#ffffff'
  tertiary-container: '#0051d6'
  on-tertiary-container: '#c9d4ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dce1ff'
  primary-fixed-dim: '#b7c4ff'
  on-primary-fixed: '#001551'
  on-primary-fixed-variant: '#0039b5'
  secondary-fixed: '#cce5ff'
  secondary-fixed-dim: '#93ccff'
  on-secondary-fixed: '#001d31'
  on-secondary-fixed-variant: '#004b73'
  tertiary-fixed: '#dbe1ff'
  tertiary-fixed-dim: '#b4c5ff'
  on-tertiary-fixed: '#00174b'
  on-tertiary-fixed-variant: '#003ea8'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-hero:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '600'
    lineHeight: 56px
    letterSpacing: -0.03em
  display-hero-mobile:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Geist
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Geist
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  body-sm:
    fontFamily: Geist
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-code-md:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: -0.01em
  label-code-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  caption:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.01em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system embodies technical authority, clarity, and cognitive ease. Tailored for developer tools, technical roadmaps, and modern engineering education platforms, the aesthetic balances the surgical rigor of a technical blueprint with the fluid approachability of modern product interfaces.

The visual narrative relies on a pristine light canvas, high-legibility slate typography, and vibrant electric royal blue accents that denote focus, momentum, and completion. It draws primarily from **Modern Technical Minimalism** combined with **Architectural Flat Design**: razor-sharp boundaries, subtle structural dividing lines, clean card containers, and luminous visual signposts rather than muddy visual noise or excessive blur filters.

## Colors

The palette establishes an intentional contrast between the pure white canvas and deep engineering blues:

- **Canvas & Surfaces:**
  - Base canvas: `#ffffff`
  - Layered surface (subtle contrast card/rail background): `#f8fafc`
  - Elevated card top-surface: `#ffffff`
- **Primary Accent (`#1d4ed8`):** Deep royal blue serving as the core action driver, active indicators, and high-emphasis controls. Supported by `#2563eb` for interactive hover and focus rings.
- **Secondary Accent (`#0284c7`):** Electric sky blue utilized for progress nodes, roadmap branches, and informational badges.
- **Neutrals & Structural Borders:**
  - Crisp boundary borders: `#e2e8f0`
  - Subdued structural dividers: `#f1f5f9`
  - Primary text: `#0f172a` (slate-900) for uncompromised contrast.
  - Secondary/meta text: `#475569` (slate-600).
  - Tertiary/placeholder text: `#94a3b8` (slate-400).
- **Functional Semantics:**
  - Success/Verification: `#059669` (emerald-600)
  - Warning/Pending: `#d97706` (amber-600)
  - Critical/Error: `#dc2626` (red-600)

## Typography

The typographic hierarchy is built on geometric precision and legible code clarity. 

- **Primary Interface Typeface (`Geist`):** Delivers clean geometry and neutral legibility at both display scales and high-density interface grids. Tight negative letter spacing is applied to headings to evoke a crisp, engineered posture.
- **Technical & Label Typeface (`JetBrains Mono`):** Dedicated to node IDs, timestamps, syntax tags, file paths, status codes, and terminal output.
- Headings maintain strict line-height discipline to ensure alignment across data grids and side navigation trees.

## Layout & Spacing

The layout is anchored in a responsive 12-column fluid grid system with precise interior docking rules:

- **Desktop (1024px+):** 12 columns with a fixed `2rem` outer page margin and `1.5rem` gutters. Multi-column roadmap boards leverage a fixed 280px left rail for documentation trees with fluid content distribution across remaining columns.
- **Tablet (768px – 1023px):** 8 columns with `1.5rem` margins and `1rem` gutters. Secondary inspector panes collapse into floating side sheets.
- **Mobile (< 768px):** 4 columns with `1rem` edge margins and `1rem` gutters. Complex trees reflow into vertical, segmented timeline views.
- **Spacing Rhythm:** Internal spacing strictly follows multiples of 4px. Structural cards default to `space-lg` (`1.5rem`) internal padding, while compact metadata strips rely on `space-xs` and `space-sm`.

## Elevation & Depth

This design system avoids heavy drop shadows and blurs, achieving depth through **crisp borders, micro-offsets, and clean tonal layering**:

- **Level 0 (Base Canvas):** Pure white (`#ffffff`) or subdued wash (`#f8fafc`). Borderless.
- **Level 1 (Cards, Code Blocks, Module Panels):** White surface contained by a 1px solid border in slate (`#e2e8f0`). Backed by an ultra-subtle ambient shadow: `0 1px 3px rgba(15, 23, 42, 0.04)`.
- **Level 2 (Hovered Cards & Active Milestone Nodes):** Lifted slightly with a refined dual shadow: `0 4px 6px -1px rgba(15, 23, 42, 0.06), 0 2px 4px -2px rgba(15, 23, 42, 0.04)`. Border shifts to royal blue tint (`#93c5fd`).
- **Level 3 (Dropdowns, Command Palettes, Popovers):** Pure white background, `1px solid #cbd5e1`, with structured shadow: `0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.04)`.
- **Level 4 (Modals & Focus Dialogs):** Centered overlay with a dimming backdrop (`rgba(15, 23, 42, 0.4)`), bordered in crisp slate with deep edge clarity: `0 20px 25px -5px rgba(15, 23, 42, 0.1)`.

## Shapes

The design system uses a controlled **Soft (0.25rem / 4px to 8px)** shape philosophy. This reinforces the disciplined, engineered character of technical diagrams, code editors, and metric cards without feeling sharp or abrasive:

- **Base Elements (Buttons, Inputs, Badges, Chips):** `0.25rem` (4px) corner radius.
- **Containers (Cards, Modal Windows, Code Consoles):** `0.5rem` (8px) corner radius (`rounded-lg`).
- **Pill Exceptions:** Restricted only to status indicator dots and full-pill completion tags (`rounded-full`).

## Components

### Buttons
- **Primary:** Background `#1d4ed8`, text `#ffffff`, radius 4px, font weight 500. Hover: `#1e40af`. Focus: 2px solid offset with `#2563eb` ring.
- **Secondary / Outline:** Background `#ffffff`, border `1px solid #e2e8f0`, text `#0f172a`. Hover: background `#f8fafc`, border `#cbd5e1`.
- **Ghost / Minimal:** Background transparent, text `#475569`. Hover: background `#f1f5f9`, text `#0f172a`.

### Cards & Module Containers
- Solid `#ffffff` background with a crisp `1px solid #e2e8f0` stroke.
- Header sections feature a `1px solid #f1f5f9` bottom border divider, isolating card titles from content bodies.
- Active or focused cards feature a prominent left accent border (3px solid `#1d4ed8`).

### Chips, Tags & Badges
- **Technical Badges:** Rendered in `JetBrains Mono`. Background `#eff6ff`, border `1px solid #bfdbfe`, text `#1d4ed8`.
- **Status Badges:** Neutral gray (`#f1f5f9` / `#475569`), Success emerald (`#ecfdf5` / `#059669`), Warning amber (`#fffbeb` / `#b45309`).
- Compact geometry with 2px vertical, 8px horizontal padding.

### Form Inputs & Controls
- **Text Inputs:** Height 36px, background `#ffffff`, border `1px solid #cbd5e1`, placeholder `#94a3b8`, font Geist 14px. Focus state triggers border `#1d4ed8` with a distinct `0 0 0 3px rgba(29, 78, 216, 0.15)` focus ring.
- **Checkboxes & Radios:** 16px square/circle with crisp 1.5px slate borders. Checked state fills with `#1d4ed8` and white vector glyphs.

### Lists & Navigation Trees
- Hierarchical tree lines utilizing `1px solid #e2e8f0` guidelines. Active item states employ an electric blue background tint (`#eff6ff`) with `#1d4ed8` bold text and an attached 2px left border marker.

### Engineering Roadmap Nodes & Progress Indicators
- Visual timeline paths drawn with `2px solid #e2e8f0`.
- Completed milestones: `#1d4ed8` filled nodes with white icons.
- Current/In-progress milestone: 2px ring `#1d4ed8` with white center and pulsing `#60a5fa` outer glow.
- Upcoming milestone: `#ffffff` center with `2px solid #cbd5e1`.