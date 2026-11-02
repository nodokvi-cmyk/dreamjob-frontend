---
name: DreamJob
description: Vacancies from verified employers in Georgia, drawn as a metro line.
colors:
  enamel: "#0b1230"
  enamel-dark: "#070c22"
  enamel-raised: "#142048"
  enamel-seam: "#26346a"
  on-enamel: "#f4f6fb"
  on-enamel-muted: "#b3bddc"
  porcelain: "#f4f6fb"
  surface: "#ffffff"
  ink: "#0b1230"
  ink-muted: "#4a5677"
  border: "#d6dceb"
  primary: "#d71a2a"
  line-scarlet: "#e21d2d"
  line-cobalt: "#1e5bff"
  line-amber: "#ffc20e"
  line-green: "#22b14c"
  success-ink: "#137a35"
  cobalt-ink: "#1747c7"
  dark-background: "#0b1230"
  dark-surface: "#111a3d"
  dark-ink: "#eef1f9"
  dark-ink-muted: "#a9b4d6"
typography:
  display:
    fontFamily: "Barlow Condensed, sans-serif"
    fontSize: "clamp(2.75rem, 7vw, 5.25rem)"
    fontWeight: 700
    lineHeight: 0.95
    letterSpacing: "-0.02em"
  heading:
    fontFamily: "Barlow Condensed, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.01em"
  label:
    fontFamily: "Barlow Condensed, sans-serif"
    fontSize: "0.95rem"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.08em"
  body:
    fontFamily: "Barlow, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
rounded:
  sm: "7px"
  md: "10px"
  lg: "12px"
  xl: "17px"
  2xl: "22px"
  full: "9999px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "40px"
  2xl: "64px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    typography: "{typography.label}"
    rounded: "{rounded.lg}"
    padding: "0 16px"
    height: "40px"
  button-on-enamel:
    backgroundColor: "{colors.enamel}"
    textColor: "{colors.on-enamel}"
    typography: "{typography.label}"
    rounded: "{rounded.lg}"
    padding: "0 16px"
    height: "40px"
  button-outline:
    backgroundColor: "{colors.porcelain}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.lg}"
    padding: "0 16px"
    height: "40px"
  header:
    backgroundColor: "{colors.enamel}"
    textColor: "{colors.on-enamel}"
    height: "64px"
  search-field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xl}"
    padding: "8px"
  journey-panel:
    backgroundColor: "{colors.enamel}"
    textColor: "{colors.on-enamel}"
    rounded: "{rounded.2xl}"
    padding: "32px"
---

# Design System: DreamJob

## Overview

DreamJob is drawn as a metro network fired in midnight enamel. A vacancy is a journey: categories are lines, statuses are stations. The shell is always enamel (header and footer stay midnight in both themes) with a scarlet rule under the header, so the brand holds while the working surface switches between porcelain (light) and enamel (dark).

The product is an Operate surface: the world contributes type, palette, density and one signature move (the station track), never the layout or the controls. Navigation, buttons, inputs and menus are standard web controls.

## Colors

### Primary

Scarlet is the action colour and the travelled line. `primary` (#d71a2a in light, #e21d2d in dark) fills the main button; `line-scarlet` draws the status line and the header rule.

### Secondary

The four line inks (scarlet, cobalt, amber, green) are reserved for categories, states and the line motif. Green marks the active nav item and verified state; amber marks something that needs attention (incomplete or unapproved company); cobalt is focus and links (`cobalt-ink` for text).

### Neutral

Enamel (#0b1230) is both the shell and the dark-mode ground. Porcelain (#f4f6fb) is the light ground, white the light card. Text on enamel uses `on-enamel` and `on-enamel-muted`; never grey.

### Named Rules

- **Inks carry meaning.** A line colour always means a category, a state or the action. Never decorative fills.
- **Shell is constant.** Header and footer stay enamel in both themes.

## Typography

Barlow Condensed is the transit sign voice: display headlines and headings in uppercase, labels and buttons in tracked uppercase (`transit-label`). Barlow is the reading face for body and inputs. Salaries and counts use tabular figures (`tabular`).

Neither Barlow face has the lari sign (₾, U+20BE), so Noto Sans Georgian (latin-ext subset only) follows Barlow in both stacks and draws just the missing characters, narrowed to width 75 inside condensed text. It was chosen because its ₾ sits closest to Barlow's weight and width, and the file it needs is small (22.7 KB, against 290 KB for Noto Sans). Without it, the system font drew a mismatched ₾ beside salaries.

### Hierarchy

- Display: hero only, three short lines, last line in scarlet.
- Heading: section and panel titles, uppercase, -0.01em.
- Label: nav, buttons, station names, footer column titles; uppercase, +0.08em.
- Body: 1rem to 1.25rem, measure under 75ch, muted ink for supporting copy.

## Layout

Max width 80rem with 16/24/32px gutters (`px-4 sm:px-6 lg:px-8`). Header is 64px plus a 4px scarlet rule, sticky. Desktop hero is a 12-column grid (7 for headline and search, 5 for the journey panel). Below `md` the nav moves into a right-side sheet, the search bar stacks its fields, and every grid becomes one column.

## Elevation & Depth

Flat by default: seams (1px borders) separate regions. One soft shadow exists, under the hero search field, to lift the main task. Menus use the popover surface with the library shadow.

## Shapes

Controls 10-12px radius, panels 17-22px, chips and status dots fully round. The station node is a ring (border 4-5px) on a 6px line.

## Components

### Buttons

Condensed uppercase labels with an arrow icon on forward actions. Primary is scarlet; `onEnamel` is a translucent outline for use on the enamel shell; `outline` is the porcelain-side secondary. Destructive actions (sign out, delete) sit apart from other actions.

### Inputs / Fields

The search bar is one bordered field (2px ink border) holding icon-led inputs separated by a seam, with the scarlet Search button inside it.

### Navigation

Header nav items are tracked labels; the active item gets a 3px green bar on the header's bottom edge. The account menu shows initials on a porcelain tile, with an amber dot when the company profile needs attention.

### Station track (signature)

A vertical line with ring stations for pending, published and closed. Travelled segments are scarlet, the reached station is filled, upcoming stations are hollow and muted. On load the first segment fills once with an expo ease and the reached station pulses once; both are skipped under reduced motion.

## Do's and Don'ts

### Do:

- Use the station track for any status or progress (vacancy status, company approval).
- Keep salaries in tabular figures and in the row, never hidden behind a click.
- Label every icon-only control for screen readers.

### Don't:

- Don't paint regions with line inks or use them as decoration.
- Don't add eyebrow labels above headings.
- Don't invent counts, employers or testimonials; show real data or none.
