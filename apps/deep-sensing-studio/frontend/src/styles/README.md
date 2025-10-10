# Asymmetrica Design System

This directory contains the core design system for the Deep-Sensing Studio, implemented as a set of design tokens. The system is built upon the principles of the Asymmetrica Protocol, emphasizing mathematical harmony and empirical validation.

## Files

-   `tokens.css`: Defines the core visual elements such as colors, typography, and spacing using CSS custom properties.
-   `animations.css`: Defines animation keyframes and timings based on Tesla's harmonic frequency.

---

## 🎨 Color Palette

The color palette is extracted directly from the official `Asymmetrica.ai Logo Design.png`, ensuring brand consistency. The palette is designed to be vibrant, accessible, and aligned with the project's aesthetic.

| Color Name     | Hex Code  | CSS Variable              |
| :------------- | :-------- | :------------------------ |
| Navy           | `#0B1929` | `--color-navy`            |
| Teal (Dark)    | `#1BA098` | `--color-teal-dark`       |
| Teal (Light)   | `#4ECBC3` | `--color-teal-light`      |
| Orange (Dark)  | `#FF6F00` | `--color-orange-dark`     |
| Orange (Light) | `#FFA726` | `--color-orange-light`    |
| Gold           | `#FFD54F` | `--color-gold`            |
| Cream          | `#F5E6D3` | `--color-cream`           |

---

## ✒️ Typography

The design system uses a dual-font strategy to create a clear visual hierarchy:

-   **Inter**: A highly legible sans-serif font used for all body and UI text.
    -   **CSS Variable**: `--font-family-sans`
-   **Space Grotesk**: A distinctive, modern display font used for headlines and prominent text elements.
    -   **CSS Variable**: `--font-family-display`

---

## 📏 Spacing

All spacing and layout dimensions are based on the **Golden Ratio (Φ ≈ 1.618)**, a principle central to the Asymmetrica Protocol. This ensures a naturally balanced and aesthetically pleasing layout.

| Scale | Rem Value | Approx. Pixels | CSS Variable         |
| :---- | :-------- | :------------- | :------------------- |
| XS    | `0.382rem`  | `~6px`         | `--spacing-phi-xs`   |
| SM    | `0.618rem`  | `~10px`        | `--spacing-phi-sm`   |
| MD    | `1rem`      | `16px` (base)  | `--spacing-phi-md`   |
| LG    | `1.618rem`  | `~26px`        | `--spacing-phi-lg`   |
| XL    | `2.618rem`  | `~42px`        | `--spacing-phi-xl`   |

---

## ⏱️ Animation Timing

Animations follow a harmonic timing system derived from Nikola Tesla's research, specifically the **4.909 Hz** frequency. This results in animations that feel natural, responsive, and rhythmically consistent.

| Harmonic | Duration | CSS Variable          |
| :------- | :------- | :-------------------- |
| 1x       | `203.7ms`  | `--timing-tesla-1x`   |
| 2x       | `407.4ms`  | `--timing-tesla-2x`   |
| 4x       | `814.8ms`  | `--timing-tesla-4x`   |

---

## Usage

These design tokens are consumed by `tailwind.config.js` to generate utility classes. It is highly recommended to use the Tailwind classes (`bg-navy`, `p-phi-md`, etc.) whenever possible.

For custom CSS, you may use the CSS variables directly:

```css
.my-component {
  background-color: var(--color-navy);
  padding: var(--spacing-phi-lg);
  font-family: var(--font-family-display);
}
```

By adhering to this system, we ensure a consistent, high-quality, and protocol-aligned user experience across the Deep-Sensing Studio.