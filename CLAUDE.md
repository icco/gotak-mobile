# CLAUDE.md

Guidance for working in gotak-mobile.

## Overview

Expo React Native client for Tak. Talks to https://gotak.app (override with `EXPO_PUBLIC_API_URL`).

## Requirements

- Auth via `/auth/login` and `/auth/register`; JWT in SecureStore
- Isometric board showing stacks
- Place pieces and stack slides via PTN
- Human vs human (poll) and human vs AI (`/ai-move`)
- Trust server board state — do not reconstruct moves client-side

## Commands

```bash
yarn install
yarn start
yarn typecheck
yarn lint
yarn test
```

## Architecture

- `src/services/api.ts` — axios client with Bearer interceptor
- `src/context/AuthContext.tsx` — session restore / login / logout
- `src/utils/ptn.ts` — PTN builders for place and slide
- Game create uses `Accept: application/json` so the server returns 201 + enriched `GameStateResponse`
