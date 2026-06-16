import { describe, expect, test } from 'vitest';
import { buildMergeGatherPlan, getOrthogonalMergePath } from '../ui/MergePath.js';

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

  test('chooses an alternate turn when a same-row first turn is blocked', () => {
    const source = { row: 0, col: 0, x: 40, y: 40 };
    const target = { row: 2, col: 3, x: 220, y: 160 };

    const path = getOrthogonalMergePath(source, target, {
      blockedCells: [{ row: 0, col: 3 }]
    });

    expect(path).toEqual([
      { x: 40, y: 40 },
      { x: 40, y: 160 },
      { x: 220, y: 160 }
    ]);
  });

  test('builds staged gather paths through nearby merge dice before final target', () => {
    const source = { row: 0, col: 0, x: 40, y: 40 };
    const intermediate = { row: 0, col: 1, x: 100, y: 40 };
    const nearTarget = { row: 1, col: 1, x: 100, y: 100 };
    const target = { row: 2, col: 1, x: 100, y: 160 };

    const plan = buildMergeGatherPlan({
      group: [source, intermediate, nearTarget, target],
      target,
      blockedCells: [{ row: 1, col: 0 }]
    });

    expect(plan.steps.length).toBeGreaterThanOrEqual(3);
    expect(plan.steps[0]).toMatchObject({
      from: { row: 0, col: 0 },
      to: { row: 0, col: 1 },
      final: false
    });
    expect(plan.steps.at(-1)).toMatchObject({
      to: { row: 2, col: 1 },
      final: true
    });
    plan.steps.forEach((step) => expectOrthogonal(step.path));
  });
});
