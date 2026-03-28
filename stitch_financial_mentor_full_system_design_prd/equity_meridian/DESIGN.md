# Design System Specification: The Architectural Wealth Experience

This document defines the visual language and structural logic for a high-end financial ecosystem. Our objective is to move beyond the "fintech template" and toward a digital experience that feels like an elite private wealth firm: authoritative, serene, and meticulously curated.

## 1. Creative North Star: "The Sovereign Curator"
Most financial apps feel cluttered and urgent. This design system takes the opposite approach. We embrace **The Sovereign Curator**—a philosophy of high-density data wrapped in low-density layouts. By utilizing intentional asymmetry, expansive breathing room, and tonal layering, we create an environment of "calm competence." We don't just show numbers; we showcase financial health as a premium lifestyle.

## 2. Color Theory & Surface Logic
The palette is rooted in a deep, nocturnal blue (`primary: #00193c`) and a vibrant, "growth-oriented" emerald (`secondary: #006c47`). 

### The "No-Line" Rule
To achieve a premium, editorial feel, **1px solid borders are strictly prohibited for sectioning.** Do not draw boxes around your content. Instead, define boundaries through:
*   **Background Shifts:** Move from `surface` to `surface_container_low` to define a new content area.
*   **Tonal Transitions:** Use a subtle shift to `surface_container` for interactive regions.

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of materials.
*   **Base Layer:** `surface` (#f7f9fb) for the main background.
*   **Sectional Layer:** `surface_container_low` (#f2f4f6) for secondary modules or sidebars.
*   **Interaction Layer:** `surface_container_lowest` (#ffffff) for high-priority cards or input fields.
*   **Depth Principle:** An inner container must always be a "lighter" or "higher" tier than its parent to simulate a natural lift toward the user.

### Glass & Gradient (The "Signature" Touch)
To avoid a flat, "Bootstrap" appearance, use **Glassmorphism** for floating elements (e.g., bottom navigation bars or modal overlays). Apply a background blur of 20px–40px to `surface` colors at 80% opacity. 
*   **Hero Polish:** Use a linear gradient from `primary` (#00193c) to `primary_container` (#002d62) for high-impact cards. This creates a "deep-sea" depth that feels expensive and secure.

## 3. Typography: Editorial Authority
We utilize a dual-typeface system to balance character with clarity.

*   **Display & Headlines (Manrope):** Chosen for its geometric precision. Use `display-lg` and `headline-md` with tight letter-spacing (-0.02em) to create a bold, "newspaper-masthead" authority.
*   **Body & Labels (Inter):** The workhorse for financial data. Inter provides maximum legibility at small sizes. Use `body-md` for general content and `label-md` for metadata.
*   **The Contrast Rule:** Key financial figures (balances, ROI) should always be rendered in `headline-sm` or `title-lg` using `on_surface` (#191c1e) to ensure they are the first thing a user sees.

## 4. Elevation & Depth
Traditional drop shadows are too "web 2.0." We use **Ambient Shadows** and **Tonal Layering**.

*   **The Layering Principle:** Place a `surface_container_lowest` card on a `surface_container_low` background. The subtle shift in hex code provides all the separation needed without visual noise.
*   **Ambient Shadows:** When an element must float (e.g., a FAB or active Modal), use a shadow with a 32px blur, 0px spread, and a color of `on_surface` at only 4% opacity. It should feel like a soft glow, not a hard shadow.
*   **The "Ghost Border" Fallback:** If a border is required for accessibility, use `outline_variant` (#c4c6d1) at **15% opacity**. Never use 100% opaque lines.

## 5. Components

### Buttons & CTAs
*   **Primary:** Solid `primary` (#00193c) with `on_primary` (#ffffff) text. Use `rounded-md` (0.75rem).
*   **Success Action:** Solid `secondary` (#006c47) for "Buy" or "Deposit" actions to signal growth.
*   **Tertiary:** No background, `primary` text. Use for low-emphasis actions like "Cancel" or "Learn More."

### Input Fields
*   **Styling:** Use `surface_container_lowest` for the fill. No border. Instead, use a 2px bottom-accent of `surface_variant` that transitions to `primary` on focus.
*   **Rounding:** `sm` (0.25rem) for a more "precise/technical" feel.

### Cards & Data Lists
*   **The "No-Divider" Rule:** Forbid the use of horizontal divider lines. Use `spacing-6` (1.5rem) to separate list items, or a subtle `surface_container_low` hover state to indicate rows.
*   **Financial Cards:** Use `primary_container` with a subtle mesh gradient. Data should be high-contrast: `on_primary_container` for labels and `white` for values.

### Additional Signature Components
*   **The "Growth Spark":** A micro-chart component using `secondary` (#006c47) with a subtle outer glow to represent positive portfolio trends.
*   **Progress Insights:** Use `secondary_container` (#8af5be) as a track and `secondary` (#006c47) as the indicator for financial goals.

## 6. Do’s and Don’ts

### Do
*   **Do** use asymmetrical margins. A wider left margin for titles creates an editorial, "premium magazine" feel.
*   **Do** use `secondary` (#006c47) sparingly. It should represent "Profit" or "Success," not just a generic brand color.
*   **Do** leverage `spacing-12` (3rem) and `spacing-16` (4rem) to let high-level data "breathe."

### Don’t
*   **Don’t** use black (#000000). Always use `primary` or `on_surface` for text to maintain the sophisticated blue-tinted atmosphere.
*   **Don’t** use `DEFAULT` roundedness for everything. Use `xl` (1.5rem) for large containers and `sm` (0.25rem) for small data tags to create visual hierarchy through corner radius.
*   **Don’t** use "Alert Red" for everything. Reserve `error` (#ba1a1a) for critical data loss or security threats; use `surface_variant` for neutral empty states.