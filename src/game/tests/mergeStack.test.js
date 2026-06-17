import { describe, expect, test } from 'vitest';
import { getMergeStackFeedback, getStackLayerPoint, STACK_LAYER_SCALE, takeNextStackArrival } from '../ui/MergeStack.js';

describe('MergeStack', () => {
  test('keeps stack dice at full board-die scale', () => {
    expect(STACK_LAYER_SCALE).toBe(1);
  });

  test('stacks layers upward with readable y offsets', () => {
    const target = { x: 120, y: 180 };
    const cellSize = 64;
    const totalLayers = 4;
    const points = [0, 1, 2, 3].map((layerIndex) => getStackLayerPoint(target, layerIndex, totalLayers, cellSize));

    expect(points[0].y).toBe(target.y);
    points.forEach((point) => expect(point.x).toBe(target.x));
    expect(points[1].y).toBeLessThan(points[0].y);
    expect(points[2].y).toBeLessThan(points[1].y);
    expect(points[3].y).toBeLessThan(points[2].y);
    expect(points[0].y - points[1].y).toBeGreaterThanOrEqual(12);
    expect(points[0].y - points[1].y).toBeLessThanOrEqual(18);
  });

  test('adds stronger feedback only for 4+ merge groups', () => {
    expect(getMergeStackFeedback({ groupSize: 3, score: 30 })).toBeNull();
    expect(getMergeStackFeedback({ groupSize: 4, score: 60 })).toMatchObject({
      level: 'big',
      title: '4 Dice Merge!',
      score: 60
    });
    expect(getMergeStackFeedback({ groupSize: 5, score: 120 })).toMatchObject({
      level: 'huge',
      title: '5 Dice Merge!',
      score: 120
    });
  });

  test('takes queued stack arrivals in actual arrival order', () => {
    const queue = [
      { id: 'arrived-first', step: { stage: 2 } },
      { id: 'arrived-second', step: { stage: 0 } }
    ];

    expect(takeNextStackArrival(queue)?.id).toBe('arrived-first');
    expect(takeNextStackArrival(queue)?.id).toBe('arrived-second');
    expect(takeNextStackArrival(queue)).toBeNull();
  });
});
