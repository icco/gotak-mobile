# Product

<!-- impeccable:product-schema 1 -->

## Platform

android

## Users

People new to Tak who want to learn it by playing on their phone, against the computer or with a friend who sent them a game code.

## Product Purpose

Gotak is a native phone app for playing Tak against the gotak server's AI or another person. Success is a newcomer finishing a first game without reading the rules elsewhere, then starting another.

## Positioning

A native mobile app with a built-in computer opponent and async games with friends. PlayTak and PTN Ninja are web clients aimed at players who already know Tak.

## Operating Context

- Played one-handed on a phone, in short sessions, often while waiting for the AI or a friend's move.
- The server (https://gotak.app, source at https://github.com/icco/gotak) validates every move and owns game state; the app sends PTN.
- Friend games are async: the app polls for the opponent's move.

## Capabilities and Constraints

- Email and password accounts; Google sign-in is deferred.
- Board sizes 4 to 8; turn 1 places the opponent's flat; walls can only be flattened by a lone capstone, and gotak forbids flattening your own wall.
- Android ships from the daily Release workflow as `com.timeclimbers.gotak`; iOS builds in CI but is not released.
- No offline play, spectating, or analysis UI yet.

## Brand Commitments

- Name: Gotak, shown in the app as "Tak".
- Quiet modern look chosen by the owner: board first, minimal chrome.

## Evidence on Hand

No player counts, reviews, or testimonials exist. Do not invent them.

## Product Principles

1. Teach by showing: legal targets, roads, and counts are visible on the board instead of explained in text.
2. The server is the referee; the app never guesses at game state.
3. Every move is one tap per decision, reachable with a thumb.
4. Errors explain what to do next, inline, never in a modal.

## Accessibility & Inclusion

Touch targets aim for 48dp; every board square has a spoken label with its stack.
