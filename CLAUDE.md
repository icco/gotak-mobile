# CLAUDE.md

Guidance for working in gotak-mobile.

## Overview

Expo React Native client for Tak. Talks to https://gotak.app (override with `EXPO_PUBLIC_API_URL`).

## Requirements

- Auth via `/auth/login` and `/auth/register`; JWT in SecureStore
- 2D board (optional tilt) showing stacks
- Place pieces and spread stacks one drop at a time via PTN
- Human vs human (poll) and human vs AI (`/ai-move`)
- Trust server board state — do not reconstruct moves client-side

## Commands

```bash
pnpm install
pnpm start
pnpm typecheck
pnpm lint
pnpm test
```

## Architecture

- `src/services/api.ts` — axios client with Bearer interceptor
- `src/context/AuthContext.tsx` — session restore / login / logout
- `src/utils/ptn.ts` — PTN builders for place and slide
- `src/utils/spread.ts` — spread state machine; legality mirrors gotak `Board.DoMove` (including no flattening your own wall)
- `src/theme.ts` — colors, spacing, and type tokens
- `PRODUCT.md`, `DESIGN.md`, and `.impeccable/surfaces/` — Impeccable product and design records; read before changing UI
- Game create uses `Accept: application/json` so the server returns 201 + enriched `GameStateResponse`
