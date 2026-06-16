# Dicezzle MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Dicezzle.com Hugo + Phaser 3 MVP with a playable Classic dice merge puzzle, shareable results, SEO pages, docs, and verification.

**Architecture:** Hugo owns the static website, content pages, SEO metadata, and game shell. Vite bundles the Phaser game from `src/game/main.js` into `static/game/dicezzle/`, while focused core modules implement board rules, merge resolution, scoring, trays, ranking, storage, and sharing so they can be tested independently of Phaser.

**Tech Stack:** Hugo, Phaser 3, Vite, Vitest, plain CSS, localStorage, Web Share API with clipboard fallback.

---

### Task 1: Test Scaffold And Rule Contracts

**Files:**
- Create: `package.json`
- Create: `vite.config.js`
- Create: `src/game/tests/boardModel.test.js`
- Create: `src/game/tests/mergeResolver.test.js`
- Create: `src/game/tests/trayGenerator.test.js`
- Create: `src/game/tests/scoreModel.test.js`
- Create: `src/game/tests/rankModel.test.js`
- Create: `src/game/tests/shareService.test.js`

- [ ] **Step 1: Write failing tests for the core rule contracts**

```js
import { describe, expect, test } from 'vitest';
import { BoardModel } from '../core/BoardModel.js';

describe('BoardModel', () => {
  test('places one die on an empty cell and tracks empty cells', () => {
    const board = new BoardModel(5);
    board.placeDie(2, 3, 4);
    expect(board.getCell(2, 3)).toEqual({ value: 4 });
    expect(board.getEmptyCells()).toHaveLength(24);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test`
Expected: `FAIL` because core modules do not exist yet.

### Task 2: Game Core Models

**Files:**
- Create: `src/game/core/DiceModel.js`
- Create: `src/game/core/BoardModel.js`
- Create: `src/game/core/ScoreModel.js`
- Create: `src/game/core/RankModel.js`
- Create: `src/game/core/TrayGenerator.js`
- Create: `src/game/core/DailySeed.js`
- Create: `src/game/core/StorageService.js`
- Create: `src/game/core/ShareService.js`
- Create: `src/game/core/MergeResolver.js`

- [ ] **Step 1: Implement minimal focused modules**

Implement board placement, deterministic tray generation, chain merge resolution with a 20-loop cap, 6-to-star upgrades, star clears, scoring multipliers, rank labels, localStorage namespacing, and share text generation.

- [ ] **Step 2: Run tests to verify green**

Run: `npm test`
Expected: all Vitest tests pass.

### Task 3: Phaser Classic Mode

**Files:**
- Create: `src/game/main.js`
- Create: `src/game/scenes/BootScene.js`
- Create: `src/game/scenes/GameScene.js`
- Create: `src/game/scenes/UIScene.js`
- Create: `src/game/scenes/ResultScene.js`
- Create: `src/game/ui/BoardView.js`
- Create: `src/game/ui/DiceView.js`
- Create: `src/game/ui/TrayView.js`
- Create: `src/game/ui/ResultPanel.js`
- Create: `src/game/ui/ToastView.js`
- Create: `static/game/dicezzle/dicezzle-game.css`
- Create: `static/game/dicezzle/index.html`
- Create: `static/game/dicezzle/data/config.json`
- Create: `static/game/dicezzle/data/daily-seeds.json`

- [ ] **Step 1: Build the playable loop**

Mount Phaser inside `#dicezzle-game`, use tap/click tray selection then board placement, show score/tray/status, resolve merges immediately, persist best score, and show the result panel on game over.

- [ ] **Step 2: Verify manually in browser**

Run: `npm run dev`
Open: `http://localhost:1313/play/`
Expected: no console errors, playable board, responsive shell.

### Task 4: Hugo Site, SEO, Content, And Docs

**Files:**
- Create: `hugo.toml`
- Create: `content/_index.md`
- Create: `content/play.md`
- Create: `content/daily.md`
- Create: `content/guide.md`
- Create: `content/about.md`
- Create: `content/contact.md`
- Create: `content/privacy.md`
- Create: `content/terms.md`
- Create: `layouts/_default/baseof.html`
- Create: `layouts/_default/single.html`
- Create: `layouts/_default/list.html`
- Create: `layouts/index.html`
- Create: `layouts/partials/head.html`
- Create: `layouts/partials/header.html`
- Create: `layouts/partials/footer.html`
- Create: `layouts/partials/game-shell.html`
- Create: `layouts/partials/related-games.html`
- Create: `layouts/partials/share-meta.html`
- Create: `assets/css/main.css`
- Create: `assets/js/site.js`
- Create: `static/images/og/dicezzle-og.svg`
- Create: `README.md`
- Create: `docs/release-log.md`
- Create: `docs/qa-checklist.md`
- Create: `docs/analytics-plan.md`
- Create: `docs/social-share-plan.md`

- [ ] **Step 1: Create static-first pages and metadata**

Add all required routes, titles, descriptions, Open Graph and Twitter tags, modest JSON-LD, a mobile-first site theme, game shell, and related games links.

- [ ] **Step 2: Build Hugo**

Run: `hugo --gc --minify`
Expected: site builds without errors.

### Task 5: Final Verification

**Files:**
- Read: all modified files through build/test output and Git status.

- [ ] **Step 1: Install dependencies if needed**

Run: `npm install`
Expected: dependencies installed and `package-lock.json` generated.

- [ ] **Step 2: Run required validation**

Run:
```bash
npm run build
npm test
hugo --gc --minify
git diff --check
git status --short
```

Expected: build/test/Hugo/diff checks exit 0; Git status lists the new project files.
