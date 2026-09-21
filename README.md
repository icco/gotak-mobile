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
The production package ID is `app.gotak.mobile` (display name **Gotak**).
It installs separately from the old `com.anonymous.gotakmobile` test app.
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

**Actions → Release Android (APK and AAB)**, or a `v*` tag, builds signed
artifacts using repository secrets `ANDROID_KEYSTORE_BASE64`,
`ANDROID_STORE_PASSWORD`, `ANDROID_KEY_ALIAS`, and `ANDROID_KEY_PASSWORD`.
The workflow uses `https://gotak.app` and uploads both APK and AAB artifacts.
Increment `android.versionCode` in `app.json` for subsequent releases.

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

- `src/components/` — board and inventory UI
- `src/screens/` — login, home, game
- `src/services/` — API client and SecureStore auth
- `src/context/` — auth session
- `src/utils/` — PTN helpers
