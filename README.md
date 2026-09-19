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

### Standalone Android APK

Install JDK 17+ and the Android SDK, and set `JAVA_HOME` and `ANDROID_HOME`.
Dependencies are patched on installation to use Foojay resolver **1.0.0**:
React Native's bundled **0.5.0** references `JvmVendorSpec.IBM_SEMERU`, which
was removed in Gradle 9.

```bash
yarn install --frozen-lockfile
npx expo prebuild --platform android --no-install
```

Then run from the generated `android/` directory:

```bash
NODE_ENV=production EXPO_PUBLIC_API_URL=https://gotak.app ./gradlew assembleRelease -PreactNativeArchitectures=arm64-v8a
```

Install `android/app/build/outputs/apk/release/app-release.apk`. This release-mode
APK contains its JavaScript bundle and does not require Metro or Expo Go.
Expo's generated signing configuration uses its debug key; this is a local
testing build, not a Play release. Keep using the same key for updates.
The explicit package ID preserves Expo's initial `com.anonymous.gotakmobile`
default so repeat prebuilds produce updates to the same installed app.
Native directories are generated and ignored by Git.

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
