# Gotak Mobile

Expo / React Native client for [Tak](https://ustak.org/play-beautiful-game-tak/), backed by [gotak](https://github.com/icco/gotak) at https://gotak.app.

## Features

**Implemented**
- Email/password login and registration (JWT stored in SecureStore)
- New game vs human or vs AI
- Join game by slug
- 2D touch board with an optional 3D tilt
- Tap an empty square to place a flat, wall, or capstone; turn 1 places your opponent's flat
- Tap your stack, then tap squares to drop one stone at a time (tap the origin to carry fewer; undo and cancel mid-move)
- Legal drop targets, last move, stack counts, and a stack inspector (long-press any square)
- Both players' reserves and flat counts, move list, inline errors
- Road connections between adjacent road stones, and the winning road highlighted at the end
- Hints on the first turns for new players
- Human games poll for opponent moves
- AI games call `/ai-move` after your turn
- Share game link

**Deferred**
- Google OAuth
- Offline mode
- Spectating / WebSockets
- Drag-and-drop gestures
- iOS haptics
- App Store / Play Store release builds

## Setup

Use Node.js 26.x.

```bash
pnpm install
pnpm start
```

Optional API override:

```bash
EXPO_PUBLIC_API_URL=http://localhost:8080 pnpm start
```

Defaults to `https://gotak.app`.

### Standalone Android APK

Install JDK 17+ and the Android SDK, and set `JAVA_HOME` and `ANDROID_HOME`.
Dependencies are patched on installation to use Foojay resolver **1.0.0**:
React Native's bundled **0.5.0** references `JvmVendorSpec.IBM_SEMERU`, which
was removed in Gradle 9.

```bash
pnpm install --frozen-lockfile
npx expo prebuild --platform android --no-install
```

Then run from the generated `android/` directory:

```bash
NODE_ENV=production EXPO_PUBLIC_API_URL=https://gotak.app ./gradlew assembleRelease -PreactNativeArchitectures=arm64-v8a
```

Install `android/app/build/outputs/apk/release/app-release.apk`. This release-mode
APK contains its JavaScript bundle and does not require Metro or Expo Go.
The production package ID is `com.timeclimbers.gotak` (display name **Gotak**).
It installs separately from the older `app.gotak.mobile` and `com.anonymous.gotakmobile` builds.
The config plugin in `plugins/` installs production signing on every prebuild.
Release tasks require `ANDROID_KEYSTORE_PATH`, `ANDROID_STORE_PASSWORD`,
`ANDROID_KEY_ALIAS`, and `ANDROID_KEY_PASSWORD`; missing credentials fail the
build rather than silently using the debug key. Debug builds still work without
production credentials. Keep the same signing key for future updates.
Native directories are generated and ignored by Git.

The Private 1Password vault contains **Gotak Mobile Android production signing**
(credentials) and **Gotak Mobile Android production keystore** (PKCS12 document).
Retrieve the document to a temporary local file, set `ANDROID_KEYSTORE_PATH`,
and use `op run` with these references for the other variables:

```text
ANDROID_STORE_PASSWORD=op://Private/Gotak Mobile Android production signing/password
ANDROID_KEY_ALIAS=op://Private/Gotak Mobile Android production signing/key alias
ANDROID_KEY_PASSWORD=op://Private/Gotak Mobile Android production signing/key password
```

The **Release** workflow (`.github/workflows/release.yml`) runs daily and on demand. It uses semantic-release to publish a GitHub release with a signed APK and AAB whenever `main` has new commits, using repository secrets `ANDROID_KEYSTORE_BASE64`,
`ANDROID_STORE_PASSWORD`, `ANDROID_KEY_ALIAS`, and `ANDROID_KEY_PASSWORD`.
The workflow uses `https://gotak.app` and sets the version in `app.json` itself.

React is pinned to the exact renderer version, and SecureStore must stay on
the same SDK major as Expo. Mixing SDK 57 SecureStore with SDK 55 causes a
native `AnyTypeCache` class-not-found crash before JavaScript starts.

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm start` | Expo dev server |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | TypeScript |
| `pnpm test` | Unit tests (PTN / inventory) |

## Project structure

- `src/components/` — board, stones, and game panels
- `src/screens/` — login, home, game
- `src/services/` — API client and SecureStore auth
- `src/context/` — auth session
- `src/utils/` — PTN, spread state machine, and board helpers
