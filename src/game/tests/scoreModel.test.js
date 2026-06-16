import { describe, expect, test } from 'vitest';
import { ScoreModel, defaultScoringConfig } from '../core/ScoreModel.js';

describe('ScoreModel', () => {
  test('scores placement and merge values with chain multipliers', () => {
    const score = new ScoreModel(defaultScoringConfig);

    expect(score.placeScore()).toBe(1);
    expect(score.mergeScore(1, 1)).toBe(30);
    expect(score.mergeScore(2, 2)).toBe(90);
    expect(score.mergeScore(3, 3)).toBe(240);
    expect(score.mergeScore(5, 8)).toBe(1440);
  });

  test('scores star clears with the configured bonus', () => {
    const score = new ScoreModel(defaultScoringConfig);

    expect(score.starClearScore()).toBe(2000);
  });
});
