import { describe, expect, test } from 'vitest';
import { RankModel } from '../core/RankModel.js';

describe('RankModel', () => {
  test('generates positive rank labels from score and achievements', () => {
    expect(RankModel.getRank({ score: 120, highestDie: 2, starsCreated: 0, starClears: 0 })).toBe('Beginner Roller');
    expect(RankModel.getRank({ score: 900, highestDie: 4, starsCreated: 0, starClears: 0 })).toBe('Chain Builder');
    expect(RankModel.getRank({ score: 2200, highestDie: 6, starsCreated: 0, starClears: 0 })).toBe('Six Master');
    expect(RankModel.getRank({ score: 4200, highestDie: 'star', starsCreated: 1, starClears: 0 })).toBe('Star Maker');
    expect(RankModel.getRank({ score: 8200, highestDie: 'star', starsCreated: 3, starClears: 2 })).toBe('Star Clearer');
    expect(RankModel.getRank({ score: 16000, highestDie: 'star', starsCreated: 5, starClears: 3 })).toBe('Dicezzle Pro');
  });
});
