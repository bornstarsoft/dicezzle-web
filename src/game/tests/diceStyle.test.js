import { describe, expect, test } from 'vitest';
import { DiceStyle } from '../ui/DiceStyle.js';

function colorDistance(leftHex, rightHex) {
  const parse = (hex) => [
    Number.parseInt(hex.slice(1, 3), 16),
    Number.parseInt(hex.slice(3, 5), 16),
    Number.parseInt(hex.slice(5, 7), 16)
  ];
  const left = parse(leftHex);
  const right = parse(rightHex);
  return Math.sqrt(left.reduce((sum, channel, index) => sum + (channel - right[index]) ** 2, 0));
}

function rgb(hex) {
  return {
    red: Number.parseInt(hex.slice(1, 3), 16),
    green: Number.parseInt(hex.slice(3, 5), 16),
    blue: Number.parseInt(hex.slice(5, 7), 16)
  };
}

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

  test('keeps value 3 lime green while making star visibly special', () => {
    const two = DiceStyle.forValue(2);
    const three = DiceStyle.forValue(3);
    const four = DiceStyle.forValue(4);
    const star = DiceStyle.forValue('star');
    const threeFill = rgb(three.fill);

    expect(three.name).toMatch(/green|lime|leaf/i);
    expect(three.special).not.toBe(true);
    expect(threeFill.green).toBeGreaterThan(threeFill.red + 35);
    expect(threeFill.green).toBeGreaterThan(threeFill.blue + 45);
    expect(star.special).toBe(true);
    expect(star.starScale).toBeGreaterThan(1);
    expect(colorDistance(three.fill, star.fill)).toBeGreaterThanOrEqual(70);
    expect(colorDistance(three.fill, two.fill)).toBeGreaterThanOrEqual(55);
    expect(colorDistance(three.fill, four.fill)).toBeGreaterThanOrEqual(85);
    expect(colorDistance(three.stroke, star.stroke)).toBeGreaterThanOrEqual(55);
  });
});
