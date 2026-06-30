---
name: Artisanal Pizzeria System
colors:
  surface: '#fff9eb'
  surface-dim: '#e7db9c'
  surface-bright: '#fff9eb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fff4c4'
  surface-container: '#fcefae'
  surface-container-high: '#f6e9a9'
  surface-container-highest: '#f0e3a4'
  on-surface: '#201c00'
  on-surface-variant: '#5c403c'
  inverse-surface: '#373102'
  inverse-on-surface: '#fff2b1'
  outline: '#906f6b'
  outline-variant: '#e5beb9'
  surface-tint: '#bb1718'
  primary: '#97000a'
  on-primary: '#ffffff'
  primary-container: '#be1a1a'
  on-primary-container: '#ffd1cb'
  inverse-primary: '#ffb4aa'
  secondary: '#b51c0c'
  on-secondary: '#ffffff'
  secondary-container: '#d93723'
  on-secondary-container: '#fffbff'
  tertiary: '#725c0d'
  on-tertiary: '#ffffff'
  tertiary-container: '#c5a955'
  on-tertiary-container: '#4e3e00'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad5'
  primary-fixed-dim: '#ffb4aa'
  on-primary-fixed: '#410002'
  on-primary-fixed-variant: '#930009'
  secondary-fixed: '#ffdad4'
  secondary-fixed-dim: '#ffb4a7'
  on-secondary-fixed: '#400100'
  on-secondary-fixed-variant: '#920700'
  tertiary-fixed: '#ffe088'
  tertiary-fixed-dim: '#e2c46d'
  on-tertiary-fixed: '#241a00'
  on-tertiary-fixed-variant: '#574500'
  background: '#fff9eb'
  on-background: '#201c00'
  surface-variant: '#f0e3a4'
typography:
  display-lg:
    fontFamily: Montserrat
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Montserrat
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Montserrat
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.2'
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.2'
  headline-lg-mobile:
    fontFamily: Montserrat
    fontSize: 28px
    fontWeight: '700'
    lineHeight: '1.2'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 40px
  xl: 64px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 80px
---

## Brand & Style

The design system is crafted for a premium, high-end pizza brand that balances traditional warmth with modern digital efficiency. The aesthetic is **Tactile / Modern**, utilizing a rich, appetizing palette and soft depth to evoke the feeling of a sophisticated kitchen environment.

The brand personality is welcoming yet authoritative, positioning the product as an artisanal leader in the food-tech space. The target audience values quality ingredients and seamless ordering experiences. The UI evokes comfort, hunger, and reliability through the use of deep reds and creamy neutrals, avoiding the sterile "tech" feel of competitors in favor of a more editorial, food-focused atmosphere.

## Colors

The color palette is rooted in the "Pizzania" heritage, using high-contrast tones to drive appetite and focus.

- **Primary Red (#BE1A1A):** Used for primary actions, branding, and critical status indicators.
- **Secondary Red (#D0311E):** A brighter variant used for hover states, accents, and secondary highlights.
- **Warm Cream (#F8EBAB):** The primary surface color, providing a soft, parchment-like background that feels more organic than pure white.
- **Muted Gold (#F7D87F):** Used for secondary UI elements, chips, and interactive states on light backgrounds.
- **Deep Espresso (#1A0806):** Reserved for dark-mode surfaces and high-contrast hero sections.

The system utilizes a "High-Contrast Light" default mode where primary surfaces are Cream, and text is a very dark, warm Espresso.

## Typography

This design system pairs the bold, geometric presence of **Montserrat** for headlines with the friendly, accessible rhythm of **Plus Jakarta Sans** for body and interface text. 

Headlines should use tight letter spacing to appear impactful and "editorial." Body text uses generous line heights to ensure legibility against the warm cream background. Labels often employ a medium or semi-bold weight to maintain hierarchy in dense data areas like checkout summaries or order trackers.

## Layout & Spacing

The design system utilizes a **Fluid Grid** model based on an 8px base unit. 

- **Desktop:** 12-column grid with 24px gutters and 80px side margins.
- **Tablet:** 8-column grid with 20px gutters and 40px side margins.
- **Mobile:** 4-column grid with 16px gutters and 16px side margins.

Content blocks (like pizza cards) should follow a 1:1 or 4:5 aspect ratio. Vertical rhythm is strictly enforced using the 8px increments to maintain a structured, professional appearance even in data-heavy administrative views.

## Elevation & Depth

Hierarchy is established through **Tonal Layers** and **Ambient Shadows**. Surfaces do not rely on harsh black shadows; instead, they use warm, tinted shadows (e.g., a deep umber or burnt sienna) to maintain the "warm kitchen" aesthetic.

- **Level 0 (Base):** The primary Cream (#F8EBAB) surface.
- **Level 1 (Cards/Inputs):** A slight tonal shift or a 1px border in #F7D87F.
- **Level 2 (Floating/Modals):** Soft, diffused shadows (Blur: 20px, Y: 10px, Opacity: 8%) tinted with the primary red color to create a "glow" effect on dark backgrounds or a "warm lift" on light ones.
- **Glassmorphism:** Used sparingly for top navigation bars and mobile overlays, featuring a 10px backdrop blur to allow the vibrant food photography to peek through.

## Shapes

The shape language is consistently **Rounded**, mirroring the organic circularity of the product (pizza). 

- **Buttons & Inputs:** Use the standard `rounded-md` (0.5rem) for a friendly but structured feel.
- **Cards & Modals:** Use `rounded-xl` (1.5rem) to emphasize a premium, soft-touch experience.
- **Search Bars & Chips:** Frequently utilize pill-shaped (full radius) containers to distinguish them from structural layout elements.
- **Iconography:** Icons must be enclosed in rounded-square or circular containers with a 2px stroke width, maintaining the "hand-drawn yet clean" artisanal feel.

## Components

### Buttons
Primary buttons use the #BE1A1A background with white or cream text. They feature a subtle inner-glow and a distinct hover state that shifts to #D0311E. Secondary buttons use a #F7D87F background with dark espresso text.

### Inputs
Input fields are styled with a subtle cream-to-white gradient and a 1px #F7D87F border. On focus, the border transitions to Primary Red with a soft outer glow.

### Cards
Cards are the heart of the system. They feature high-quality imagery that breaks the top boundary (overlap), creating a 3D effect. The bottom section of the card provides clear pricing and a prominent "+" action button in Primary Red.

### Selection Controls
Radio buttons and checkboxes are custom-styled to match the brand. When selected, they utilize the Primary Red with a small, circular inner-dot for radios and a clean stroke for checkboxes.

### Progress Trackers (Order Tracking)
A horizontal line with custom iconography nodes. Completed stages are highlighted in Primary Red, while upcoming stages are rendered in a muted #F7D87F with lower opacity.