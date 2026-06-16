import { describe, expect, test } from 'vitest';
import { TrayGenerator } from '../core/TrayGenerator.js';

describe('TrayGenerator', () => {
  test('creates deterministic trays from the same seed', () => {
    const first = new TrayGenerator({ seed: 'daily-2026-06-16' });
    const second = new TrayGenerator({ seed: 'daily-2026-06-16' });

    expect(first.nextTray({ turn: 1 })).toEqual(second.nextTray({ turn: 1 }));
    expect(first.nextTray({ turn: 2 })).toEqual(second.nextTray({ turn: 2 }));
  });

  test('avoids high dice during early turns with default tuning', () => {
    const generator = new TrayGenerator({ seed: 'early-game' });

    const earlyDice = Array.from({ length: 8 }, (_, index) => generator.nextTray({ turn: index + 1 })).flat();

    expect(earlyDice.every((die) => die.value >= 1 && die.value <= 3)).toBe(true);
  });
});
