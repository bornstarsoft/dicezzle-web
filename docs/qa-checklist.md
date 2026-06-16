# Dicezzle QA Checklist

## Build checks

- [ ] `npm install`
- [ ] `npm run build`
- [ ] `npm test`
- [ ] `hugo --gc --minify`
- [ ] `git diff --check`
- [ ] `git status --short`

## Page checks

- [ ] `/` loads homepage with H1 `Dicezzle`.
- [ ] `/play/` loads H1 `Play Dicezzle` and playable Classic game.
- [ ] `/daily/` loads Coming Soon content.
- [ ] `/guide/` explains placement, merge, Star Dice, Star Clears, space management, sharing, and Daily Dice.
- [ ] `/about/`, `/contact/`, `/privacy/`, and `/terms/` load.
- [ ] Social meta tags exist.
- [ ] JSON-LD exists for WebSite, Organization, and game page.

## Game checks

- [ ] Player can select a tray die and place it on an empty board cell.
- [ ] Occupied cells reject placement.
- [ ] Tray starts with 3 dice and refreshes after all 3 are placed.
- [ ] Three connected matching dice merge.
- [ ] Four or more connected matching dice merge into one upgraded die.
- [ ] Chains resolve and show short feedback.
- [ ] Sixes merge into a Star Die.
- [ ] Three or more Stars trigger a 3x3 Star Clear.
- [ ] Score updates after placement, merges, chains, and Star Clears.
- [ ] Best score persists through reload via localStorage.
- [ ] Game over appears when no empty cell remains for required placement.
- [ ] Restart starts a fresh Classic game.

## Share checks

- [ ] Result panel shows score, best, highest die, stars created, star clears, best chain, turns survived, and rank.
- [ ] Share button calls `navigator.share()` on supported browsers.
- [ ] Share fallback copies result text.
- [ ] Copy result button copies the same result text.
- [ ] Toast shows `Result copied!` after clipboard fallback/copy.

## Responsive checks

- [ ] 360px wide viewport has no horizontal scroll.
- [ ] 390px wide viewport has no horizontal scroll.
- [ ] 430px wide viewport has no horizontal scroll.
- [ ] 768px wide viewport has comfortable board and tray sizing.
- [ ] Desktop viewport has readable layout and no oversized controls.

## Accessibility checks

- [ ] Buttons are at least 44px tall.
- [ ] Dice values are visible without relying only on color.
- [ ] No rapid flashing or stressful timer.
- [ ] Sound defaults off and can be toggled.
- [ ] Game shell has practical labels around HTML controls.
