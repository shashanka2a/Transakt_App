# Transakt — Design Style Reference

A consumer fintech PWA for family crypto management. The visual language is warm, approachable, and premium — paper-textured light mode as default, warm obsidian dark mode that never goes cold.

---

## Palette

### Light mode (default) — Warm Paper + Forest Green

| Token         | Value       | Role                                         |
|---------------|-------------|----------------------------------------------|
| `--bg`        | `#F0EBE0`   | Page background — aged linen                 |
| `--surface`   | `#FBF8F1`   | Cards, sheets, modals                        |
| `--raised`    | `#EEE8DC`   | Hover state, input fill, secondary surface   |
| `--border`    | `#D9D1C5`   | Default border, dividers                     |
| `--border2`   | `#C4BBB0`   | Stronger border for emphasis                 |
| `--fg`        | `#1A1410`   | Primary text — near-black warm               |
| `--fg2`       | `#5A524A`   | Secondary / body text                        |
| `--fg3`       | `#8E877D`   | Tertiary, timestamps, labels                 |
| `--accent`    | `#1A5C3A`   | CTA, active chips, highlights — forest green |
| `--accent-fg` | `#FFFFFF`   | Text on accent fills                         |
| `--accent-dim`| `#134830`   | Pressed / darker accent state                |

### Dark mode — Warm Obsidian (same warmth, inverted)

| Token         | Value       | Role                        |
|---------------|-------------|-----------------------------|
| `--bg`        | `#18140F`   | Page background — dark bark |
| `--surface`   | `#211C16`   | Cards, sheets               |
| `--raised`    | `#2A2319`   | Hover, input fill           |
| `--border`    | `#362D22`   | Default border              |
| `--border2`   | `#443829`   | Stronger border             |
| `--fg`        | `#F0E8D8`   | Primary text — warm cream   |
| `--fg2`       | `#9E9080`   | Secondary text              |
| `--fg3`       | `#675C50`   | Tertiary / muted text       |
| `--accent`    | `#00FF87`   | Electric mint — CTA, glow   |
| `--accent-fg` | `#0D0E11`   | Text on mint fills          |
| `--accent-dim`| `#00CC6A`   | Pressed mint                |

### Semantic colors (shared across modes)

| Name          | Light                        | Dark                          | Use                        |
|---------------|------------------------------|-------------------------------|----------------------------|
| Success green | `#1DB563`                    | `#1DB563`                     | Incoming, positive amounts |
| Danger red    | `#B4282F` (tinted)           | `#FF4757`                     | Errors, locked states      |
| Amber         | `#F5AC37`                    | `#FFB830`                     | Warnings, DAI, pending     |
| Uniswap pink  | `#FF007A`                    | `#FF007A`                     | Swap UI only               |

### Alpha tints (pre-defined, no raw rgba in Tailwind brackets)

```css
--mt6  / --mt10 / --mt16 / --mb20 / --mb30   /* accent tints, 6%–30% */
--dt5  / --db25                                /* danger tints, 5%–25% */
```

---

## Typography

**Typefaces**: DM Sans (all UI text) + DM Mono (addresses, amounts, codes)

| Role                  | Weight | Size          | Tracking           |
|-----------------------|--------|---------------|--------------------|
| Page title            | 900    | 24–32px       | `-1px` to `-0.5px` |
| Section heading       | 800    | 18–20px       | `-0.5px`           |
| Card label / body     | 600    | 13–15px       | normal             |
| Caption / meta        | 500    | 10–12px       | `+0.04em` to wide  |
| CTA button            | 800    | 15–16px       | normal             |
| Mono (address, ETH)   | 400–500| 11–13px       | normal             |
| Uppercase label       | 700–900| 9–11px        | `0.06em`–`0.1em`   |

Rules:
- Uppercase labels always pair with `tracking-widest` and `font-black`
- ENS names / wallet addresses always use `font-mono`
- Balance figures use `font-black` with `tabular-nums` where animating
- Never use font-weight below 500 in UI — DM Sans' lighter weights are for display only

---

## Spacing & Layout

The app is a **430px max-width mobile shell** (`max-w-[430px] mx-auto`). All padding respects safe areas.

| Zone              | Value           |
|-------------------|-----------------|
| Page padding      | `px-6` (24px)   |
| Card inner        | `px-4 py-3.5`   |
| Top of page       | `pt-12` (safe area + nav gap) |
| Bottom of list    | `pb-6`          |
| Gap between cards | `gap-3`–`gap-4` |
| Card border-radius| `rounded-2xl` (16px) |
| Pill / chip       | `rounded-full`  |
| Icon button       | `rounded-xl`    |

---

## Elevation & Shadow

Cards use two-layer shadow — a tight base + soft diffuse lift:

```css
/* Light mode */
--card-sh: 0 1px 3px rgba(80,60,40,0.08), 0 4px 14px rgba(80,60,40,0.07);

/* Dark mode */
--card-sh: 0 1px 2px rgba(0,0,0,0.28), 0 4px 12px rgba(0,0,0,0.22);
```

CTA button has glow shadow:
```css
/* Light */   0 4px 22px rgba(26,92,58,0.38)
/* Dark */    0 0 28px rgba(0,255,135,0.30)
```

Modals / sheets use `--overlay` for backdrop: `rgba(20,16,10,0.60)` light / `rgba(10,8,5,0.82)` dark.

---

## Components

### Cards
```
background: var(--surface)
border: 1px solid var(--border)
border-radius: 1rem (rounded-2xl)
box-shadow: var(--card-sh)
```

### Buttons — Primary CTA
```
background: var(--accent)
color: var(--accent-fg)
font-weight: 800
padding: py-4 px-6
border-radius: rounded-2xl
box-shadow: var(--cta-glow)
active:scale-[0.97]
```

### Buttons — Secondary / Ghost
```
background: var(--raised)
border: 1px solid var(--border)
color: var(--fg)
font-weight: 700
border-radius: rounded-xl or rounded-full
active:scale-[0.94]
```

### Filter Chips
```
active:   background var(--accent), color var(--accent-fg)
inactive: background var(--surface), border var(--border), color var(--fg2)
border-radius: rounded-full
font: text-xs font-bold tracking-wide
```

### Input Fields
```
background: var(--input-bg)
border: 1px solid var(--border)  →  focus: 1px solid var(--accent)
border-radius: rounded-xl
padding: px-4 py-3
font: DM Sans 15px
placeholder: var(--fg3)
```

### Node / Family Cards
```
left accent strip: 3.5px wide, color varies by node type
avatar: 40×40px circle, initials, background hsl(hue 30% 88%)
status badge: ACTIVE (green), LOCKED (red), AUTO (amber) — rounded-full, uppercase
progress bar: 6px tall, border-radius 3px, GSAP-animated width
```

### Bottom Sheet / Modal
```
position: fixed inset-0, z-50
backdrop: var(--overlay)
sheet: absolute bottom-0 w-full, border-radius: 28px 28px 0 0
entrance: slide-up 0.38s cubic-bezier(.34,1.46,.64,1)
```

---

## Motion

All animation is GSAP 3.15 via `useLayoutEffect` + `gsap.context()`. Native CSS animation is reserved for looping micro-states (glow, scan, pulse).

### Entrance choreography (per screen)
1. Page header fades in: `y: -8 → 0`, `opacity: 0 → 1`, `duration: 0.4`
2. Balance count-up: `gsap.to(obj, { val: target, duration: 1.1, ease: 'power2.out' })`
3. Quick action icons stagger: `scale: 0.72 → 1`, `stagger: 0.06`, `ease: 'back.out(1.4)'`
4. Node cards stagger: `y: 28 → 0`, `opacity: 0 → 1`, `stagger: 0.09`, `ease: 'back.out(1.3)'`
5. Activity rows: `x: -12 → 0`, `opacity: 0 → 1`, `stagger: 0.07`

### Sheet entrance
```js
gsap.fromTo(sheetRef.current, { y: '100%' }, { y: 0, duration: 0.42, ease: 'back.out(1.1)' })
```

### Progress bar fill
```js
gsap.to(bar, { width: `${pct}%`, duration: 0.9, ease: 'power2.out' })
```

### Easing cheat-sheet
| Scenario            | Ease                        |
|---------------------|-----------------------------|
| Sheet / modal in    | `back.out(1.1)`             |
| Card stagger in     | `back.out(1.3)`             |
| Icon pop in         | `back.out(1.4)` to `1.56`   |
| Number count-up     | `power2.out`                |
| Progress bar        | `power2.out`                |
| Flip / rotate       | `power3.inOut`              |
| Close / exit        | `power2.in` (no bounce)     |

### CSS keyframe animations (looping micro-states)
| Class             | Effect                                |
|-------------------|---------------------------------------|
| `.anim-radar`     | 360° spin, 3s linear                 |
| `.anim-pulse`     | opacity + scale pulse, 1.6s          |
| `.anim-scan`      | vertical scan line, 2.6s             |
| `.anim-glow`      | box-shadow ring pulse, 2.2s          |
| `.anim-float`     | gentle vertical float, 3.4s          |
| `.anim-slideup`   | sheet entrance, 0.38s back-ease      |
| `.anim-popin`     | scale from 0.8, 0.3s back-ease       |
| `.anim-fadescale` | fade + scale from 0.94, 0.32s        |
| `.logo-draw`      | SVG stroke draw, 1.4s                |
| `.checkmark-draw` | checkmark stroke draw, 0.4s          |
| `.bar-fill`       | progress bar, uses `--bar-w` var     |
| `.tap-card`       | press → `scale(0.96)`, 0.12s spring  |

---

## Iconography

All icons are stroke-based SVG, `viewBox="0 0 24 24"`, `strokeWidth="1.8–2"`, `strokeLinecap="round"`, `strokeLinejoin="round"`, `fill="none"`. Sized at 18–22px in UI.

### Token logos (32×32, self-contained with background circle)
Each token SVG includes its own `<circle>` fill + white symbol paths. No `<text>` elements.

| Token | Background  | Symbol style                                    |
|-------|-------------|-------------------------------------------------|
| ETH   | `#627EEA`   | Prism — two stacked triangles with 3D shading   |
| USDC  | `#2775CA`   | Dollar — bezier S-curve + vertical bar          |
| USDT  | `#26A17B`   | ₮ — wide T-crossbar + stem + underline          |
| DAI   | `#F5AC37`   | D — arc + left bar + two horizontal bars (≋)   |
| WBTC  | `#F7931A`   | ₿ — left stem + two bumps + serif ticks         |
| ENS   | `#5298FF`   | E — left spine + three horizontal bars          |

### Auth icons (WelcomeScreen)
- **Passkey**: FIDO2 standard — key ring + keyhole dot + horizontal stem + two teeth + biometric arcs above ring
- **MetaMask**: Full 26-polygon official fox mark (orange #E27625 family)
- **WalletConnect**: Blue `#3B99FC` circle + white W-shaped bridge arcs

### Uniswap badge
Pink `#FF007A` unicorn head silhouette — horn triangle + ear nub + oval head + white eye with pupil. 20×20 viewBox, rendered at 14px.

---

## Protocol / Brand Colors (in-app context only)

| Protocol      | Color     | Used for                              |
|---------------|-----------|---------------------------------------|
| Uniswap       | `#FF007A` | Swap modal accent, badge, token icon border |
| ENS           | `#5298FF` | ENS token, ENS name badges            |
| Aave          | `#B6509E` | DeFi category, Aave row avatar        |
| OpenSea       | `#2081E2` | NFT category, OpenSea row avatar      |
| Mirror.xyz    | `#7C3AED` | NFT/collect row avatar                |

---

## Do / Don't

**Do**
- Use `var(--token)` for every color — never raw hex in JSX style props
- Pre-define alpha tints in CSS (`--mt10`) rather than inline `rgba()` in Tailwind brackets
- Use `active:scale-[0.97]` (valid Tailwind v4 arbitrary) not `active:scale-97`
- Scope all theme CSS to `.transakt-app` — never touch `document.documentElement`
- Apply `data-theme={theme}` as JSX prop on `.transakt-app` div
- Use DM Mono for all on-chain data (addresses, ETH amounts, ENS names)
- GSAP `gsap.context(() => {}, ref)` with `ctx.revert()` cleanup in every component

**Don't**
- Don't use cold grays in dark mode — every neutral must have a warm brown/amber undertone
- Don't use `rgba()` directly inside Tailwind arbitrary brackets
- Don't add Apple Pay, Visa cards, or fiat payment UX — this is a web3 app with Privy embedded wallet
- Don't use `<text>` elements in SVG token logos — font rendering is environment-dependent
- Don't use `active:scale-98` or other non-arbitrary Tailwind scale variants
- Don't use `document.documentElement` for theme switching
