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
});
