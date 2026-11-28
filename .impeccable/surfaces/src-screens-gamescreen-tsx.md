---
version: 1
slug: "src-screens-gamescreen-tsx"
primary_target: "src/screens/GameScreen.tsx"
related_targets: ["src/components/Board.tsx","src/components/GamePanels.tsx"]
---

# Game screen

Scope: the in-game screen (board, both players, move input, result). Mode: Operate. Audience: Tak newcomers on a phone, one-handed. Task: make a legal move in one tap per decision and understand who is winning.

## Direction contract

THESIS: The board is the interface. Legal targets, the stone in hand, roads, and the last move are drawn on the squares themselves, so a newcomer learns the rules by looking. It refuses the category default of a small decorative board with controls, dialogs, and rules text around it.

OWN-WORLD: Deep green-black ground (#0F1513), sage board (#55665E) with raised sage tiles (#8A9C92), ivory and graphite stones with a soft drop shadow, one amber accent (#F4B740) reserved for "you can act here": legal targets, the hand, the selected stone type, and the winning road. System type, tabular numerals.

STORY: The player sees whose turn it is, taps a stack or square, watches the amber targets, drops stones one at a time, and sees road connectors grow toward the edges until one lights up amber.

FIRST VIEWPORT: Header (back, size and mode, 3D, share), opponent bar, a full-width square board in the middle, move list under it, then hint or error line, stone tray or hand controls, and your own bar at the bottom in thumb reach.

FORM: Quiet modern game UI in the vein of lichess, board first. seed: none (pinned) "Quiet modern: Flat, calm, high-contrast game UI in the vein of lichess: board first, minimal chrome."

Signature interaction: tap-to-drop spread with live amber targets and a floating hand count.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
