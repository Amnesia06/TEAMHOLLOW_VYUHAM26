# Detailed Changes Reference

## Font Stack Changes

### index.html
```html
<!-- BEFORE -->
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap" rel="stylesheet">

<!-- AFTER -->
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Lexend:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
```

### index.css
```css
/* ADDED */
body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif;
  letter-spacing: -0.011em;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

h1, h2, h3, h4, h5, h6 {
  font-family: 'Lexend', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  letter-spacing: -0.02em;
  font-weight: 600;
}
```

---

## Animation Changes

### Bar Rise (Careers View)
```css
/* BEFORE */
@keyframes riseUp {
  0% { transform: scaleY(0); opacity: 0; }
  100% { transform: scaleY(1); opacity: 1; }
}
.bar-rise {
  animation: riseUp 0.85s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

/* AFTER */
@keyframes riseUp {
  0% { transform: scaleY(0) translateY(8px); opacity: 0; }
  60% { transform: scaleY(1.03); opacity: 1; }
  100% { transform: scaleY(1) translateY(0); opacity: 1; }
}
.bar-rise {
  animation: riseUp 0.75s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  will-change: transform, opacity;
}
```

### Active Halo Glow
```css
/* BEFORE */
@keyframes activeHaloGlow {
  0%, 100% {
    box-shadow: 0 12px 32px -4px rgba(37, 99, 235, 0.22);
  }
  50% {
    box-shadow: 0 16px 42px -2px rgba(37, 99, 235, 0.32);
  }
}

/* AFTER */
@keyframes activeHaloGlow {
  0%, 100% {
    box-shadow: 0 10px 30px -4px rgba(70, 72, 212, 0.25), 
                0 0 0 3px rgba(70, 72, 212, 0.15),
                0 0 20px rgba(70, 72, 212, 0.1);
  }
  50% {
    box-shadow: 0 14px 40px -2px rgba(70, 72, 212, 0.35), 
                0 0 0 6px rgba(70, 72, 212, 0.08),
                0 0 30px rgba(70, 72, 212, 0.15);
  }
}
```

---

## Component Changes

### App.tsx - Main Layout
```tsx
// BEFORE
className="transition-all duration-300 ease-in-out"
className="shadow-xs"

// AFTER
className="transition-all duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
className="shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
```

### Sidebar.tsx - Navigation
```tsx
// BEFORE
className="transition-all duration-150"
className="bg-[#4648d4] shadow-[0_4px_14px_0_rgba(99,102,241,0.35)]"

// AFTER
className="transition-all duration-200 ease-out active:scale-[0.98]"
className="bg-[#4648d4] shadow-[0_4px_16px_0_rgba(70,72,212,0.3)]"
```

### Button.tsx
```tsx
// BEFORE
const baseStyles = "font-medium rounded-xl transition-all duration-200";
primary: "shadow-sm active:scale-[0.98]"

// AFTER
const baseStyles = "font-semibold rounded-xl transition-all duration-200 ease-out focus:ring-2"
primary: "shadow-md hover:shadow-lg active:scale-[0.97]"
```

### ChatView.tsx - Input Bar
```tsx
// BEFORE
className="bg-white/95 backdrop-blur-md"
className="shadow-[0_2px_12px_rgba(0,0,0,0.06)]"

// AFTER
className="bg-white/98 backdrop-blur-xl"
className="shadow-[0_3px_16px_rgba(0,0,0,0.08)]"
```

---

## Easing Functions Reference

### Spring Bounce
```css
cubic-bezier(0.34, 1.56, 0.64, 1)
```
Use for: Bars, cards, dramatic reveals

### Material Motion
```css
cubic-bezier(0.4, 0, 0.2, 1)
```
Use for: Layout shifts, sidebar, modals

### Ease Out
```css
ease-out
```
Use for: Micro-interactions, hovers, clicks

---

## Shadow Scale Reference

```css
/* Extra Small */
shadow-xs: 0 1px 2px rgba(0,0,0,0.05)

/* Small */
shadow-sm: 0 1px 3px rgba(0,0,0,0.08)

/* Medium */
shadow-md: 0 3px 16px rgba(0,0,0,0.08)

/* Large */
shadow-lg: 0 4px 24px rgba(0,0,0,0.12)

/* Brand Shadow (Focus) */
0 4px 24px rgba(70, 72, 212, 0.15)
```

---

## Active State Scale

```css
/* Buttons & Cards */
active:scale-[0.97]

/* Small Icons */
active:scale-95 /* or active:scale-[0.95] */
```