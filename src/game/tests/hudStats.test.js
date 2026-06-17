import { describe, expect, test } from 'vitest';
import { getStarsHudState } from '../ui/HudStats.js';

describe('HudStats', () => {
  test('uses stars instead of highest die for the live fourth HUD card', () => {
    const state = getStarsHudState({ starsCreated: 2, starClears: 1 });

    expect(state.label).toBe('Stars');
    expect(state.countText).toBe('×2');
    expect(state.clearsText).toBe('Clears 1');
    expect(state.iconValue).toBe('star');
    expect(state.style.special).toBe(true);
  });

  test('defaults star progress counts to zero for a fresh game', () => {
    const state = getStarsHudState();

    expect(state.countText).toBe('×0');
    expect(state.clearsText).toBe('Clears 0');
  });
});
