import { describe, expect, test } from 'vitest';
import { getOrthogonalMergePath } from '../ui/MergePath.js';

function expectOrthogonal(path) {
  for (let index = 1; index < path.length; index += 1) {
    const previous = path[index - 1];
    const current = path[index];
    expect(previous.x === current.x || previous.y === current.y).toBe(true);
  }
}

describe('getOrthogonalMergePath', () => {
  test('routes diagonal merge travel through a board-aligned turn', () => {
    const source = { row: 0, col: 0, x: 40, y: 40 };
    const target = { row: 2, col: 3, x: 220, y: 160 };

    const path = getOrthogonalMergePath(source, target);

    expect(path[0]).toEqual({ x: source.x, y: source.y });
    expect(path[path.length - 1]).toEqual({ x: target.x, y: target.y });
    expect(path.length).toBeGreaterThanOrEqual(3);
    expectOrthogonal(path);
  });

  test('keeps same-row travel simple and orthogonal', () => {
    const source = { row: 2, col: 0, x: 40, y: 160 };
    const target = { row: 2, col: 4, x: 280, y: 160 };

    const path = getOrthogonalMergePath(source, target);

    expect(path).toEqual([
      { x: 40, y: 160 },
      { x: 280, y: 160 }
    ]);
  });
});
