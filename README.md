# gotak-mobile

This is a React Native application that generates an iOS and Android app for their latest versions.

The backend of this service is at https://github.com/icco/gotak, and its swagger document is at https://gotak.app/swagger/doc.json.

Tak is a board game using two colors of pieces similar to checkers or Go. The [wikipedia page](https://ustak.org/play-beautiful-game-tak/) has the rules, but the official rules are also online: https://ustak.org/play-beautiful-game-tak/

## UI

In our initial version of the application, there is no offline mode or authentication. Those are for future releases. For now the app needs to:

- Render the board in an isometric grid. It cannot be 2D because you need to be able to see the stacks.
- Allow dragging and droping of pieces
- Showing your existing pieces that have not been played
- Allow for users to start a new game and share a game link
