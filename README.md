# Gotak Mobile

Expo / React Native client for [Tak](https://ustak.org/play-beautiful-game-tak/), backed by [gotak](https://github.com/icco/gotak) at https://gotak.app.

## Features

**Implemented**
- Email/password login and registration (JWT stored in SecureStore)
- New game vs human or vs AI
- Join game by slug
- Isometric board with stacks
- Place flat / standing / capstone (PTN)
- Stack slides to adjacent squares
- Human games poll for opponent moves
- AI games call `/ai-move` after your turn
- Share game link

**Deferred**
- Google OAuth
- Offline mode
- Spectating / WebSockets
- Drag-and-drop gestures
- App Store / Play Store release builds

## Setup

```bash
yarn install
yarn start
```

Optional API override:

```bash
EXPO_PUBLIC_API_URL=http://localhost:8080 yarn start
```

Defaults to `https://gotak.app`.

## Scripts

| Command | Description |
|---------|-------------|
| `yarn start` | Expo dev server |
| `yarn lint` | ESLint |
| `yarn typecheck` | TypeScript |
| `yarn test` | Unit tests (PTN / inventory) |

## Project structure

- `src/components/` — board and inventory UI
- `src/screens/` — login, home, game
- `src/services/` — API client and SecureStore auth
- `src/context/` — auth session
- `src/utils/` — PTN helpers
