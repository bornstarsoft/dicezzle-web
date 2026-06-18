import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';

const mainCss = readFileSync(new URL('../../../assets/css/main.css', import.meta.url), 'utf8');

describe('site layout CSS', () => {
  test('uses one inset width system for mobile game and content cards', () => {
    expect(mainCss).toContain('--content-card-width: min(1120px, calc(100% - 28px));');
    expect(mainCss).toContain('--game-card-width: min(760px, calc(100% - 28px));');
    expect(mainCss).toMatch(/\.section-grid,\s*\.page,\s*\.related-games\s*{[^}]*width:\s*var\(--content-card-width\)/s);
    expect(mainCss).toMatch(/\.hero--game-first\s*{[^}]*width:\s*var\(--game-card-width\)/s);
    expect(mainCss).not.toContain('100% - 8px');
  });

  test('keeps game utility controls right-aligned and visually secondary', () => {
    const gameCss = readFileSync(new URL('../../../static/game/dicezzle/dicezzle-game.css', import.meta.url), 'utf8');
    const gameShell = readFileSync(new URL('../../../layouts/partials/game-shell.html', import.meta.url), 'utf8');

    expect(gameCss).toMatch(/\.game-topbar\s*{[^}]*justify-content:\s*flex-end/s);
    expect(gameCss).toMatch(/\.game-actions\s*{[^}]*justify-content:\s*flex-end/s);
    expect(gameCss).toMatch(/\.game-actions\s*{[^}]*margin-left:\s*auto/s);
    expect(gameCss).toMatch(/\.game-topbar\s+\.game-actions\s+button\s*{[^}]*background:\s*linear-gradient\(180deg,\s*#ffffff\s*0%,\s*#f5faf7\s*100%\)/s);
    expect(gameCss).not.toMatch(/\.game-topbar\s+\.game-actions\s+button\[aria-pressed="true"\]\s*{[^}]*background:\s*#(?:244a3f|315f50)/s);
    expect(gameShell).not.toContain('game-topbar__spacer');
  });

  test('keeps mobile result popup, toast, and tutorial hint compact', () => {
    const gameCss = readFileSync(new URL('../../../static/game/dicezzle/dicezzle-game.css', import.meta.url), 'utf8');

    expect(gameCss).toMatch(/\.game-toast\s*{[^}]*white-space:\s*nowrap/s);
    expect(gameCss).toMatch(/\.game-toast\s*{[^}]*max-width:\s*calc\(100vw - 24px\)/s);
    expect(gameCss).toMatch(/\.tutorial-hint\s*{[^}]*white-space:\s*nowrap/s);
    expect(gameCss).toMatch(/\.tutorial-hint\s*{[^}]*min-width:\s*0/s);
    expect(gameCss).toMatch(/\.result-panel__share-note\s*{/s);
    expect(gameCss).not.toMatch(/\.result-panel__share-text\s*{/s);
    expect(gameCss).toMatch(/\.result-panel__inner\s*{[^}]*padding:\s*12px/s);
  });
});
