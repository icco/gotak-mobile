---
name: Gotak
description: A quiet, board-first Tak app for Android where the board itself teaches the rules.
colors:
  ground: "#0F1513"
  surface: "#18211E"
  surface-high: "#222D29"
  line: "#2E3A35"
  text: "#EEF2EF"
  text-dim: "#A3B1AA"
  board: "#55665E"
  tile: "#8A9C92"
  tile-edge: "#6E8077"
  accent: "#F4B740"
  on-accent: "#1D1606"
  accent-soft: "rgba(244, 183, 64, 0.30)"
  last-move: "rgba(238, 242, 239, 0.22)"
  danger: "#F2706A"
  danger-soft: "rgba(242, 112, 106, 0.16)"
  stone-white: "#F2EDE3"
  stone-white-edge: "#B9B0A0"
  stone-black: "#25282D"
  stone-black-edge: "#0B0C0E"
typography:
  title:
    fontFamily: "Roboto, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 600
  body:
    fontFamily: "Roboto, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
  label:
    fontFamily: "Roboto, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 500
  small:
    fontFamily: "Roboto, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 600
  stat:
    fontFamily: "Roboto, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 600
    fontFeature: "tnum"
  board-mark:
    fontFamily: "Roboto, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 700
    fontFeature: "tnum"
rounded:
  tile: "4px"
  sm: "6px"
  board: "10px"
  md: "12px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "48px"
  button-secondary:
    backgroundColor: "{colors.surface-high}"
    textColor: "{colors.text}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "48px"
  icon-button:
    textColor: "{colors.text}"
    rounded: "{rounded.pill}"
    size: "48px"
  icon-button-active:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    rounded: "{rounded.pill}"
    size: "48px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "48px"
  choice:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.md}"
    height: "48px"
  choice-selected:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    rounded: "{rounded.md}"
    height: "48px"
  tray-item:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-dim}"
    rounded: "{rounded.md}"
    height: "72px"
  tray-item-selected:
    backgroundColor: "{colors.surface-high}"
    textColor: "{colors.text}"
    rounded: "{rounded.md}"
    height: "72px"
  panel:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "0 4px 0 16px"
    height: "72px"
  player-bar-to-move:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
    height: "56px"
  banner:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "8px 12px"
    height: "40px"
  banner-error:
    backgroundColor: "{colors.danger-soft}"
    textColor: "{colors.danger}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "8px 12px"
    height: "40px"
  hand-count:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    rounded: "{rounded.pill}"
    padding: "0 5px"
    height: "20px"
---

# Design System: Gotak

## Overview

**Creative North Star: "The Board Is the Interface"**

Gotak is a dark, calm game room in the vein of lichess. A green-black ground recedes so a raised sage board can fill the phone's width, and everything a newcomer needs to learn (legal targets, the stone in hand, roads, the last move) is drawn on the squares themselves rather than explained around them. Chrome is flat, low, and quiet; the board and stones are the only physical objects on screen.

Density is phone-native: one column, 48dp targets, controls stacked under the board in thumb reach. The single amber accent is a signal, not a decoration. When amber appears, the player can act there or has just won there.

**Key Characteristics:**
- Board first: a full-width square board centered between the opponent above and the player below.
- One accent, one meaning: amber marks "you can act here" and the winning road.
- Flat chrome, physical pieces: only the board and stones cast shadows.
- System sans with tabular numerals for every count, turn, and move.
- Teaching lives on the board: dots, outlines, connectors, and badges instead of rules text.

## Colors

A deep green-black night palette with sage game materials, ivory and graphite stones, and a single warm amber.

### Primary
- **Signal Amber** (`accent`): legal move targets (outline and dot), the floating hand count, the selected chrome control (active icon button, selected board size, primary button), the "to move" marker on your own bar, and the winning road. Text on amber is always **Amber Ink** (`on-accent`).
- **Amber Wash** (`accent-soft`): the fill of the origin square of a spread and of each square in the winning road.

### Neutral
- **Night Ground** (`ground`): screen background behind everything, including the navigation theme.
- **Moss Surface** (`surface`): panels, tray items, inputs, banners, and the bar of the player to move.
- **Raised Moss** (`surface-high`): secondary buttons and the selected tray item.
- **Hairline Moss** (`line`): Android ripple color on icon buttons.
- **Mist Text** (`text`) and **Lichen Text** (`text-dim`): primary and secondary text; dim text also serves placeholders, labels, and the opponent's "to move" marker.
- **Last-Move Veil** (`last-move`): translucent light fill over squares touched by the previous move.

### Game materials
- **Sage Board** (`board`), **Sage Tile** (`tile`), **Tile Lip** (`tile-edge`): the board frame, each square, and the 2px bottom edge that raises it.
- **Ivory** / **Ivory Edge** and **Graphite** / **Graphite Edge** (`stone-white*`, `stone-black*`): stone fills and outlines. Under-stack bars and non-winning road connectors use the owning player's stone fill.

### Status
- **Coral** (`danger`) on **Coral Wash** (`danger-soft`): inline error banners and form errors only.

### Named Rules
**The One Signal Rule.** Amber means the player can act here, has chosen this, or has won here. Never use it for decoration, headings, or the opponent's state.

**The Stone Color Rule.** Player identity is carried only by stone colors (ivory, graphite), never by chrome. Road connectors take the stone color of their owner until a road wins, when they turn amber.

## Typography

**Body Font:** the platform sans (Roboto on Android); the app sets no `fontFamily`.

**Character:** Plain, legible, and numeric. Type stays small and steady so the board carries the screen; every number uses tabular figures so counts and move lists do not jitter.

### Hierarchy
- **Title** (600, 20px): screen header ("6x6 vs computer") and the game result line.
- **Body** (400, 16px): player names, "Carrying N", load errors, input text. Button labels use body size at 600.
- **Label** (500, 14px, dim): section labels, banners, move list, stack inspector, PTN preview.
- **Small** (600, 12px, dim): turn subtitle, stat captions, "To move" / "Thinking".
- **Stat** (600, 18px, tabular): reserve and flat counts in player bars; the flat count on top is full-strength text, the others dim.
- **Board mark** (700, 11px, tabular): coordinates in the corner of edge squares (Night Ground at 80%) and stack-height badges (Mist Text on a dark pill).

### Named Rules
**The Tabular Rule.** Every number that changes during play (counts, turn, move list, badges, board size) uses tabular numerals.

## Layout

One column inside safe areas with an 8px side gutter on the game screen and 24px on the home and login screens. Spacing runs on a 4px base: 4, 8, 12, 16, 24.

The game screen stacks, top to bottom: a 56dp header (back, title and turn, 3D toggle, share), the opponent bar, the board with the move strip under it (vertically centered in the remaining space), then an inline banner, the active panel (stone tray, hand bar, stack inspector, or result), and the player's own bar at the bottom. The board is square and as wide as the screen allows: `max(260, min(width - 16, height - 420, 600))`.

Squares are separated by a 3px gap inside a 6px board padding, so the sage frame shows between tiles like grout.

## Elevation & Depth

Chrome is flat and separated by tone: Night Ground, then Moss Surface, then Raised Moss. Only game pieces have physical depth.

### Shadow Vocabulary
- **Board lift** (black, 40% opacity, 16 radius, 0/10 offset, Android elevation 8): under the board frame. Dropped when the 3D tilt is on.
- **Stone drop** (black, 35% opacity, radius 6% of stone size, offset 5% of size, elevation 3): every stone, wherever it is drawn.
- **Tile lip** (2px bottom border in Tile Lip): raises each square without a shadow.

### Named Rules
**The Pieces-Only Depth Rule.** Shadows belong to the board and stones. Panels, buttons, banners, and bars stay flat and use tonal surfaces.

## Shapes

Softly rounded rectangles throughout: 12px for chrome containers and buttons, 6px for banners, 10px for the board frame, 4px for tiles and their target outline. Round controls (icon buttons, badges, hand count, to-move dot) are full pills.

Stones keep Tak's real silhouettes: flats are rounded squares (16% radius) seen from above or thin slabs from the side, walls are narrow slabs rotated 45 degrees on the board, capstones are circles from above and domed pillars from the side.

## Components

### Buttons
- **Shape:** gently rounded (12px), at least 48dp tall, label at 16px/600 with an optional 20px leading icon.
- **Primary:** Signal Amber with Amber Ink; one per view (Rematch, Log in).
- **Secondary:** Raised Moss with Mist Text (Home, Retry).
- **Pressed / Disabled:** opacity drops to 45%; no color change.

### Icon buttons
- **Style:** 48dp circle, transparent, 24px Material Community icon in Mist Text, borderless ripple in Hairline Moss.
- **Active:** fills Signal Amber, icon turns Amber Ink (the 3D toggle).
- **Pressed / Disabled:** 45% opacity.

### Choices (board size)
- **Style:** equal-width Moss Surface tiles, 48dp tall, 12px radius, tabular 16px/600 numbers.
- **Selected:** fills Signal Amber with Amber Ink.

### Inputs / Fields
- **Style:** Moss Surface fill, no stroke, 12px radius, 16px text, Lichen placeholder, 48dp minimum height.
- **Error:** shown as Coral text or a Coral banner next to the field, never in a modal.

### Panels and bars
- **Panel:** Moss Surface, 12px radius, 72dp tall, content left and icon buttons right (hand bar, stack inspector).
- **Player bar:** stone swatch, name, and three stats; transparent at rest, Moss Surface when that player is to move. Your own "to move" marker is amber; the opponent's is dim or a spinner while the computer thinks.
- **Banner:** Moss Surface (Coral Wash for errors), 6px radius, label text, optional amber text action on the right; announced as a polite live region.

### Stone tray
Three equal tiles (Flat, Wall, Cap), each a 30px stone over a 13px/600 label, 72dp tall. The selected tile gains a 2px amber outline and Raised Moss fill; empty or disallowed pieces drop to 45%.

### Board (signature)
- **Square states, layered in order:** last-move veil, Amber Wash on the spread origin, 3px amber outline on legal targets (plus an amber dot at 22% of the tile when the square is empty), Amber Wash sweep on the winning road, 2px Mist outline on the inspected stack.
- **Stacks:** top stone at 60% of the tile; up to eight buried stones as thin bars in the owner's color in the lower left; a height badge top right when the stack has two or more.
- **Hand:** an amber pill with the carried count floats at the top center of the square being dropped on.
- **Roads:** connectors at 10% of tile width in the owner's stone color at 80% opacity join adjacent road stones; a winning road thickens to 14%, turns amber, and sweeps in square by square (280ms, 70ms stagger, exponential ease-out), instant under reduce motion.
- **3D:** optional tilt (perspective 900, 34 degree X rotation, 94% scale) with the board shadow removed.

## Do's and Don'ts

### Do:
- **Do** draw rules on the board: targets, hand count, stack height, and roads are marks on squares, not text.
- **Do** keep every tappable control at least 48dp and give every board square a spoken label with its stack.
- **Do** use tabular numerals for every number that changes during play.
- **Do** report errors inline in a banner or under the field, with what to do next.
- **Do** dim to 45% opacity for pressed and disabled states.

### Don't:
- **Don't** use amber for anything the player cannot act on or has not won.
- **Don't** put shadows on chrome; only the board and stones are physical.
- **Don't** open modals or dialogs for errors or rules.
- **Don't** give player identity a chrome color; ivory and graphite stones carry it.
