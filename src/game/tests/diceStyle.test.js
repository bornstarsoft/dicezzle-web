import { describe, expect, test } from 'vitest';
import { DiceStyle } from '../ui/DiceStyle.js';

describe('DiceStyle', () => {
  test('gives each die value a distinct readable color identity', () => {
    const values = [1, 2, 3, 4, 5, 6, 'star'];
    const styles = values.map((value) => DiceStyle.forValue(value));

    expect(new Set(styles.map((style) => style.fill))).toHaveLength(values.length);
    styles.forEach((style) => {
      expect(style.fill).toMatch(/^#[0-9a-f]{6}$/i);
      expect(style.stroke).toMatch(/^#[0-9a-f]{6}$/i);
      expect(style.pip).toMatch(/^#[0-9a-f]{6}$/i);
      expect(style.highlight).toMatch(/^#[0-9a-f]{6}$/i);
      expect(style.side).toMatch(/^#[0-9a-f]{6}$/i);
      expect(style.shadow).toMatch(/^#[0-9a-f]{6}$/i);
      expect(style.rim).toMatch(/^#[0-9a-f]{6}$/i);
      expect(style.pipShadow).toMatch(/^#[0-9a-f]{6}$/i);
      expect(typeof style.name).toBe('string');
    });
  });
});
