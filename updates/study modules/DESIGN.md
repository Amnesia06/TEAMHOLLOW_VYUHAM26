---
name: Luminous Intelligence
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#464554'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#767586'
  outline-variant: '#c7c4d7'
  surface-tint: '#494bd6'
  primary: '#4648d4'
  on-primary: '#ffffff'
  primary-container: '#6063ee'
  on-primary-container: '#fffbff'
  inverse-primary: '#c0c1ff'
  secondary: '#6b38d4'
  on-secondary: '#ffffff'
  secondary-container: '#8455ef'
  on-secondary-container: '#fffbff'
  tertiary: '#006c49'
  on-tertiary: '#ffffff'
  tertiary-container: '#00885d'
  on-tertiary-container: '#000703'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e1e0ff'
  primary-fixed-dim: '#c0c1ff'
  on-primary-fixed: '#07006c'
  on-primary-fixed-variant: '#2f2ebe'
  secondary-fixed: '#e9ddff'
  secondary-fixed-dim: '#d0bcff'
  on-secondary-fixed: '#23005c'
  on-secondary-fixed-variant: '#5516be'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.03em
  display-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.025em
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.025em
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
    letterSpacing: -0.005em
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: 0em
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-micro:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.06em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
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
  space-xl: 2rem
---

## Brand & Style

This design system delivers an executive-grade AI orchestration cockpit tailored for modern knowledge workers, engineers, and career strategists navigating dynamic skill economies. Inspired by the meticulous restraint of Linear, the structural precision of Vercel, and the ambient calm of Notion, the aesthetic balances analytical authority with futuristic warmth.

The visual atmosphere centers on airy minimalism elevated by soft glassmorphic depth and ethereal violet-indigo radiance. Surfaces feel weightless yet grounded through translucent borders, micro-glows, and tactile transitions. The emotional goal is immediate intellectual clarity, composure, and forward momentum—shifting career planning from an overwhelming chore into an empowering, data-driven synthesis.

## Colors

The palette establishes an intelligent, high-fidelity light workspace characterized by atmospheric luminosity and exacting semantic feedback.

### Core Chromatics & Tonal Values
- **Primary Anchor & Accent**: `#6366F1` (Electric Indigo) transitioning seamlessly into `#8B5CF6` (Vivid Violet). This signature linear spectrum (`135deg, #6366F1 0%, #8B5CF6 100%`) represents active agent execution, high-priority milestones, and synthesized insights.
- **Canvas & Backing Matrix**: Ground canvas sits on `#F8FAFC` (Slate 50), augmented by atmospheric mesh gradients in `#EDE9FE` (Violet Tint 100) and `#F1F5F9` (Slate Tint 100) positioned at low opacities (30%–50%) to mimic diffuse studio ambient backlighting.
- **Surface Elevation**: Cards and elevated docks employ pure `#FFFFFF` alongside translucent variants (`rgba(255, 255, 255, 0.85)` with `backdrop-filter: blur(16px)`).
- **Structural Stroke Boundaries**: Ghost lines constructed with `#EEF2F6` and `#E2E8F0` define panels without visually segmenting the interface.

### Semantics & Status
- **Success / Market Alignment**: `#10B981` (Emerald) grounded on `#ECFDF5` for mastered skills, matched competencies, and completed roadmaps.
- **Caution / Prerequisites**: `#F59E0B` (Amber) grounded on `#FFFBEB` for dependencies, missing certifications, and mid-tier alignment alerts.
- **Skill Deficit / Critical Gap**: `#F43F5E` (Rose) framed with `#FFE4E6` tint for urgent skill discrepancies and high-priority learning paths.

### Text & Contrast Hierarchy
- **Primary Reading (Titles/Metrics)**: `#0F172A` (Slate 900) ensures maximum contrast and optical authority.
- **Body & Continuous Copy**: `#64748B` (Slate 500) reduces eye fatigue over prolonged data consumption.
- **Micro-labels & Meta**: `#94A3B8` (Slate 400) for structural captions, metadata timestamps, and badge categories.

## Typography

The typographic engine uses **Plus Jakarta Sans** across all levels to combine geometric rigor with humanist legibility.

### Hierarchy & Tuning
- **Tracking & Kerning**: Display headings feature tight optical kerning (`-0.03em` to `-0.02em`), creating the monolithic, confident presence popularized by top developer-first web apps.
- **Micro-Labels**: `label-micro` is strictly transformed to uppercase with deliberate positive letter-spacing (`0.06em`) to anchor dashboards, metric categories, status tags, and table column titles.
- **Numbers & Metrics**: Tabular figures (`font-variant-numeric: tabular-nums`) must be enabled on all numerical data displays, match scores, percentage progress indicators, and timelines to avoid visual jitter during real-time AI updates.

## Layout & Spacing

The design system relies on a mathematical 8px base rhythm (`0.5rem = 8px`), supporting a fluid, multi-column dashboard shell structured around an adaptive layout:

- **Desktop (1280px+)**: A persistent 280px left navigation rail paired with a 12-column adaptive fluid grid (`gutter: 1.5rem`, `margin: 2rem`). Max-width caps at 1600px for ultrawide consistency.
- **Tablet (768px – 1279px)**: Left rail collapses into an icon-dock (72px) or glass flyout drawer. Content condenses into an 8-column grid (`gutter: 1.25rem`, `margin: 1.5rem`).
- **Mobile (< 768px)**: Single column flow (`gutter-mobile: 1rem`, `margin-mobile: 1rem`) anchored by a fixed glass bottom navigation dock or header drawer. Multi-step skill-gap flows convert from horizontal parallel trees to vertical accordion timelines.

Section padding and inner component gaps are strictly constrained to the `space-*` scale to maintain disciplined spatial cadence.

## Elevation & Depth

Visual hierarchy combines low-opacity multi-layered ambient drop shadows with translucent glass surfaces and gradient backlights.

### Elevation Hierarchy
1. **Base Flat (Level 0)**: Un-elevated canvas `#F8FAFC` accented with radial violet mesh glows (`radial-gradient(ellipse at top, #EDE9FE 0%, transparent 70%)`).
2. **Surface Base (Level 1 - Cards & Tiles)**: Solid `#FFFFFF`, bordered by `1px solid #EEF2F6`. Casts an ultra-diffuse dual shadow:
   - `box-shadow: 0 1px 3px 0 rgba(15, 23, 42, 0.03), 0 8px 24px -4px rgba(15, 23, 42, 0.05)`
3. **Hover Lift (Level 2 - Interactive Elements)**: Interactive cards translate upward (`translateY(-2px)`) with heightened shadow and an illuminated Indigo rim:
   - `box-shadow: 0 4px 6px -1px rgba(99, 102, 241, 0.06), 0 16px 32px -6px rgba(15, 23, 42, 0.08)`
   - Border transitions to `rgba(99, 102, 241, 0.25)`.
4. **Floating Glass (Level 3 - Navbars, Menus & Overlays)**: `rgba(255, 255, 255, 0.85)` surface with `backdrop-filter: blur(20px) saturate(180%)`, bordered by `1px solid rgba(226, 232, 240, 0.8)`:
   - `box-shadow: 0 20px 40px -8px rgba(15, 23, 42, 0.12), 0 1px 2px 0 rgba(15, 23, 42, 0.04)`
5. **AI Active Focus (Glow Accent)**: AI-synthesizing nodes and recommendation highlights emit a specialized aura:
   - `box-shadow: 0 0 0 1px #8B5CF6, 0 0 24px 2px rgba(139, 92, 246, 0.2)`

## Shapes

The design system maintains a modern, sculpted contour profile balancing generous card radii with compact, pill-shaped tags:

- **Dashboard Cards & Panels**: Fixed at `20px` (`rounded-xl` / `1.25rem`), producing friendly structural modules with smooth curvature.
- **Inputs, Nested Containers & Dropdowns**: Shaped at `10px`–`12px` (`rounded-lg`) for clean internal alignment within cards.
- **Buttons, Status Chips & Micro-Badges**: Formed as perfect capsules (`border-radius: 9999px`), creating clear visual contrast against larger rectangular card surfaces.

## Components

### Buttons
- **Primary Action**: Gradient fill (`linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)`), text `#FFFFFF`, font `label-lg`, pill shape (`9999px`). Features a subtle interior highlight: `box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.25), 0 4px 14px 0 rgba(99, 102, 241, 0.35)`. Smooth scale and lift on hover (`transform: translateY(-1px)`).
- **Secondary / Ghost**: Pure `#FFFFFF` surface with `1px solid #E2E8F0` border, text `#0F172A`. On hover: `background: #F8FAFC`, border color `#CBD5E1`.
- **AI Synthesis Button**: Indigo-violet border with subtle pulsing glow and trailing micro-spark icon; background translucent `rgba(237, 233, 254, 0.5)`.

### Badges & Competency Chips
- **Gap Chip (Deficit)**: Background `#FFE4E6`, border `1px solid #FECDD3`, text `#E11D48`, pill shape, uppercase `label-micro`. Accompanied by a leading 6px crimson dot indicator.
- **Match Chip (Acquired)**: Background `#ECFDF5`, border `1px solid #A7F3D0`, text `#059669`.
- **Prerequisite Chip**: Background `#FFFBEB`, border `1px solid #FDE68A`, text `#D97706`.

### Cards & Modules
Constructed on `#FFFFFF` with `20px` border radius, `1px solid #EEF2F6`, and Level 1 elevation shadow. Inner padding defaults to `space-lg` (`1.5rem`). Nested sections use `#F8FAFC` backgrounds with `12px` border radius.

### Input Fields & Controls
- **Text Inputs**: Height `44px`, background `#FFFFFF`, border `1px solid #E2E8F0`, rounded `10px`, typography `body-md`. Focus state: ring of `0 0 0 3px rgba(99, 102, 241, 0.15)` with border color `#6366F1`.
- **Checkboxes & Radios**: 18px size, rounded `6px` (or circular), stroke `#CBD5E1`. Checked state initiates gradient fill with white checkmark glyph.

### Skill-Gap Radar / Progress Bar
- **Track**: Height `8px`, background `#F1F5F9`, border radius `9999px`.
- **Active Fill**: `linear-gradient(90deg, #6366F1, #8B5CF6)` with animated shimmer during AI analysis. Completed tracks switch to solid `#10B981`.

### AI Insight Callout Card
Translucent panel (`rgba(255, 255, 255, 0.9)`) framed with a multi-stop border gradient (`#6366F1` to `#8B5CF6`), featuring an ambient violet backdrop glow and spark icon badge for agent recommendations.