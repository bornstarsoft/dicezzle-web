# Dicezzle.com

Dicezzle is a lightweight, mobile-first browser dice merge puzzle from Bornstar Soft. The MVP ships as a static Hugo site with a Phaser 3 Classic game mode.

## Project Summary

- Static-first Hugo website for Dicezzle.com.
- Phaser 3 browser game bundled with Vite.
- Core game logic kept in testable JavaScript modules.
- Local-only MVP persistence through localStorage.
- No login, purchases, gacha, coins, gems, forced ads, or manipulative reward loops.

## Local Development

```bash
npm install
npm run dev
```

`npm run dev` builds the game bundle, then starts `hugo server` at `http://127.0.0.1:1313/`.

You can also run Hugo directly:

```bash
hugo server
```

If you change `src/game/**`, rebuild the game bundle:

```bash
npm run build:game
```

## Build Commands

```bash
npm run build
hugo --gc --minify
```

`npm run build` runs Vite first, writing the browser game bundle into `static/game/dicezzle/`, then runs the Hugo production build.

## Test Commands

```bash
npm test
```

Vitest covers board placement, occupied-cell rejection, merge detection, four-plus merges, chains, 6-to-Star, Star Clear, scoring, rank labels, tray generation, and share text.

## Game Rule Summary

- Board is 5x5.
- The tray gives 3 single-cell dice per turn.
- Tap a tray die, then tap an empty board cell.
- Three or more orthogonally connected matching dice merge.
- Merge target is deterministic: use the placed cell when it belongs to the group, otherwise use the most center-like group cell with row/column tie-breaks.
- 1s merge into 2, up through 6s merging into Star Dice.
- Three or more Star Dice trigger a Star Clear and remove a 3x3 area around the merge target.
- Chains resolve until no merge exists, capped at 20 loops.
- Game over happens when the board has no empty cell for the next required placement.

## Deployment Notes

The project is Cloudflare Pages friendly:

- Build command: `npm run build`
- Output directory: `public`
- No server runtime required.
- Do not commit secrets, analytics IDs, API keys, paid SDK keys, or private tokens.

## MVP Scope

- Classic mode playable at `/play/`.
- Daily page exists at `/daily/` as a placeholder.
- Result panel includes Score, Best score, Highest die, Stars created, Star clears, Best chain, Turns survived, Rank, Share, Copy result, and Play again.
- Share uses `navigator.share()` when available and clipboard fallback otherwise.
- Analytics wrapper is privacy-conscious and inert unless a provider is explicitly attached later.

## Non-goals

- No Unity WebGL.
- No backend, login, accounts, purchases, gacha, casino visuals, coins, gems, forced ads, or aggressive interstitials.
- No server-side share image generation in the MVP.
- No Daily Dice gameplay until Classic is stable.
