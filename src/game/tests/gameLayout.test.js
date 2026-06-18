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

  test('uses one visual die size for board, tray, and drag proxy', () => {
    const layout = calculateGameLayout({ width: 393, height: 430, boardSize: 5, traySize: 3 });

    expect(layout.board.dieSize).toBeGreaterThan(0);
    expect(layout.tray.pieceSize).toBe(layout.board.dieSize);
    expect(layout.drag.dieSize).toBe(layout.board.dieSize);
    expect(layout.tray.slotSize).toBeGreaterThan(layout.board.dieSize);
  });

  test('keeps tray rack visibly separated from the board frame on mobile', () => {
    const layout = calculateGameLayout({ width: 393, height: 430, boardSize: 5, traySize: 3 });

    expect(layout.tray.top - layout.board.bottom).toBeGreaterThanOrEqual(22);
    expect(layout.tray.slotSize - layout.tray.pieceSize).toBeGreaterThanOrEqual(12);
  });

  test('keeps an iPhone-sized compact canvas playable with a smaller tray rack', () => {
    const layout = calculateGameLayout({ width: 393, height: 388, boardSize: 5, traySize: 3 });

    expect(layout.board.originY).toBeLessThanOrEqual(8);
    expect(layout.board.size).toBeLessThanOrEqual(290);
    expect(layout.board.cellSize).toBeGreaterThanOrEqual(53);
    expect(layout.tray.slotSize).toBeLessThanOrEqual(68);
    expect(layout.tray.top - layout.board.bottom).toBeGreaterThanOrEqual(16);
    expect(layout.tray.bottom).toBeLessThanOrEqual(layout.height - layout.bottomMargin);
  });

  test('keeps tray touch targets generous and inside the canvas', () => {
    const layout = calculateGameLayout({ width: 393, height: 430, boardSize: 5, traySize: 3 });

    expect(layout.tray.hitSize).toBeGreaterThanOrEqual(layout.tray.pieceSize + 24);
    layout.tray.centers.forEach((center) => {
      expect(center.x - layout.tray.hitSize / 2).toBeGreaterThanOrEqual(0);
      expect(center.x + layout.tray.hitSize / 2).toBeLessThanOrEqual(layout.width);
      expect(center.y - layout.tray.hitSize / 2).toBeGreaterThanOrEqual(0);
      expect(center.y + layout.tray.hitSize / 2).toBeLessThanOrEqual(layout.height);
    });
  });
});
