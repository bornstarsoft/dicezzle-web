import { describe, expect, test } from 'vitest';
import { calculateGameLayout } from '../ui/GameLayout.js';

describe('calculateGameLayout', () => {
  test.each([
    [360, 420],
    [390, 430],
    [393, 430],
    [430, 450],
    [768, 520]
  ])('fits board and tray inside a compact %ix%i game canvas', (width, height) => {
    const layout = calculateGameLayout({ width, height, boardSize: 5, traySize: 3 });

    expect(layout.board.originY).toBeLessThanOrEqual(width < 500 ? 12 : 20);
    expect(layout.board.bottom).toBeLessThan(layout.tray.top);
    expect(layout.tray.bottom).toBeLessThanOrEqual(height - layout.bottomMargin);
    expect(layout.board.cellSize).toBeGreaterThanOrEqual(width < 500 ? 56 : 70);
    expect(layout.tray.slotSize).toBeGreaterThanOrEqual(width < 500 ? 58 : 76);
  });
});
