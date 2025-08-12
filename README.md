# Gotak Mobile

This is a React Native application built with Expo that creates iOS and Android apps for playing Tak, the beautiful board game.

## About Tak

Tak is a two-player board game where you build roads of stones to connect opposite sides of the board. The game uses two colors of pieces similar to checkers or Go. Learn more about the rules at [US Tak Association](https://ustak.org/play-beautiful-game-tak/).

## Backend Integration

The backend service is at https://github.com/icco/gotak, with API documentation at https://gotak.app/swagger/doc.json.

## Features

✅ **Implemented:**
- Isometric 3D board rendering (shows piece stacks)
- Interactive piece selection and placement
- Game creation and sharing functionality
- Real-time API integration with gotak.app
- Cross-platform mobile support (iOS & Android)

🚧 **In Development:**
- Drag and drop gestures
- Move validation
- Multiplayer synchronization

🔮 **Future Plans:**
- User authentication
- Offline mode
- Game history
- AI opponent

## Development

### Prerequisites
- Node.js 18+
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio/Emulator (for Android development)

### Setup
```bash
npm install
npm start
```

### Building
```bash
# Development builds
expo build:android --type apk
expo build:ios

# Production
expo build:android --type app-bundle
```

### Project Structure
- `src/components/` - Reusable UI components
- `src/screens/` - Screen components
- `src/services/` - API and external services  
- `src/types/` - TypeScript type definitions
- `src/utils/` - Utility functions

## Contributing

This project uses GitHub Actions for CI/CD. All pull requests are automatically tested and built.
