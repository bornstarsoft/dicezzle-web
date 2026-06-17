import { describe, expect, test } from 'vitest';
import { DiceView } from '../ui/DiceView.js';

describe('DiceView geometry', () => {
  test.each([1, 2, 3, 4, 5, 6])('keeps value %i pips inside the premium face safe area', (value) => {
    const layout = DiceView.getPipLayout(64, value);

    expect(layout.positions).toHaveLength(value);
    layout.positions.forEach((pip) => {
      expect(pip.x - layout.radius).toBeGreaterThanOrEqual(layout.safe.left);
      expect(pip.x + layout.radius).toBeLessThanOrEqual(layout.safe.right);
      expect(pip.y - layout.radius).toBeGreaterThanOrEqual(layout.safe.top);
      expect(pip.y + layout.radius).toBeLessThanOrEqual(layout.safe.bottom);
    });
  });

  test('uses balanced rows and columns for six pips', () => {
    const layout = DiceView.getPipLayout(64, 6);
    const rows = [...new Set(layout.positions.map((pip) => pip.y))];
    const cols = [...new Set(layout.positions.map((pip) => pip.x))];

    expect(rows).toHaveLength(3);
    expect(cols).toHaveLength(2);
    expect(rows[1]).toBeCloseTo(layout.centerY, 5);
    expect(Math.abs(cols[0])).toBeCloseTo(Math.abs(cols[1]), 5);
  });

  test('uses a nearly square top-face safe area', () => {
    const { safe } = DiceView.getFaceGeometry(64);
    const width = safe.right - safe.left;
    const height = safe.bottom - safe.top;

    expect(Math.abs(width - height)).toBeLessThanOrEqual(1);
  });

  test('centers the star inside the same face safe area', () => {
    const star = DiceView.getStarLayout(64);

    expect(star.centerX - star.outerRadius).toBeGreaterThanOrEqual(star.safe.left);
    expect(star.centerX + star.outerRadius).toBeLessThanOrEqual(star.safe.right);
    expect(star.centerY - star.outerRadius).toBeGreaterThanOrEqual(star.safe.top);
    expect(star.centerY + star.outerRadius).toBeLessThanOrEqual(star.safe.bottom);
  });
});
