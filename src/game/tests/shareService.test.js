import { describe, expect, test } from 'vitest';
import { ShareService } from '../core/ShareService.js';

describe('ShareService', () => {
  test('generates the required share text format', () => {
    const text = ShareService.generateResultText({
      score: 12840,
      highestDie: 'star',
      starClears: 3,
      bestChain: 3,
      rank: 'Star Maker'
    });

    expect(text).toBe([
      'Dicezzle Classic',
      'Score: 12,840',
      'Best Die: ⭐',
      'Star Clears: 3',
      'Best Chain: x3',
      'Rank: Star Maker',
      'Can you beat my score?',
      'https://dicezzle.com/play/'
    ].join('\n'));
  });
});
